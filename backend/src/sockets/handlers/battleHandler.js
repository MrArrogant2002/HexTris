// In-memory room state is suitable for a single-node runtime.
// Use Redis or another shared store for multi-node horizontal scaling.
const battleStateByRoom = new Map();
const INITIAL_PLAYER_HP = 100;
const DEFAULT_DAMAGE = 10;
const MIN_DAMAGE = 1;
const MAX_DAMAGE = 100;
const ATTACK_COOLDOWN_MS = 250;

function getBattleState(battleId) {
  if (!battleStateByRoom.has(battleId)) {
    battleStateByRoom.set(battleId, {
      battleId,
      players: new Map(),
      lastEventAt: Date.now(),
    });
  }
  return battleStateByRoom.get(battleId);
}

function buildStatePayload(state) {
  const players = Array.from(state.players.values()).sort((a, b) => b.hp - a.hp);
  return {
    battleId: state.battleId,
    players,
    updatedAt: new Date(state.lastEventAt).toISOString(),
  };
}

export function emitBattleUpdate(io, battleId, payload = {}) {
  io.to(battleId).emit('battle:update', {
    battleId,
    ...payload,
  });
}

export function registerBattleHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('joinBattle', ({ battleId, playerId, name }) => {
      try {
        if (!battleId || typeof battleId !== 'string') {
          socket.emit('battle:error', { code: 'INVALID_BATTLE_ID', message: 'Invalid battleId.' });
          return;
        }
        if (!playerId || typeof playerId !== 'string') {
          socket.emit('battle:error', { code: 'INVALID_PLAYER_ID', message: 'Invalid playerId.' });
          return;
        }

        const state = getBattleState(battleId);
        socket.join(battleId);
        socket.data.battleId = battleId;
        socket.data.playerId = playerId;

        state.players.set(playerId, {
          playerId,
          name: typeof name === 'string' && name.trim() ? name.trim() : playerId,
          hp: INITIAL_PLAYER_HP,
          socketId: socket.id,
        });
        state.lastEventAt = Date.now();

        io.to(battleId).emit('battle:playerJoined', {
          battleId,
          playerId,
          name: state.players.get(playerId).name,
        });
        io.to(battleId).emit('battle:state', buildStatePayload(state));
      } catch (error) {
        console.error('joinBattle failed:', error);
        socket.emit('battle:error', { code: 'JOIN_FAILED', message: 'Unable to join battle room.' });
      }
    });

    socket.on('attack', ({ battleId, attackerId, targetId, damage = DEFAULT_DAMAGE }) => {
      if (!battleId || !attackerId || !targetId) {
        socket.emit('battle:error', { code: 'INVALID_ATTACK', message: 'Attack payload is incomplete.' });
        return;
      }
      if (socket.data?.playerId !== attackerId || socket.data?.battleId !== battleId) {
        socket.emit('battle:error', { code: 'UNAUTHORIZED_ATTACK', message: 'Attacker identity mismatch.' });
        return;
      }
      if (attackerId === targetId) {
        socket.emit('battle:error', { code: 'INVALID_TARGET', message: 'Self-target attack is not allowed.' });
        return;
      }
      const now = Date.now();
      const lastAttackAt = socket.data?.lastAttackAt || 0;
      if (now - lastAttackAt < ATTACK_COOLDOWN_MS) {
        socket.emit('battle:error', { code: 'ATTACK_RATE_LIMITED', message: 'Attack is cooling down.' });
        return;
      }

      // Attack is valid only for existing rooms; unlike joinBattle, this does not auto-create.
      const state = battleStateByRoom.get(battleId);
      if (!state) {
        socket.emit('battle:error', { code: 'ROOM_NOT_FOUND', message: 'Battle room does not exist.' });
        return;
      }

      const attacker = state.players.get(attackerId);
      const target = state.players.get(targetId);
      if (!attacker || !target) {
        socket.emit('battle:error', { code: 'INVALID_PLAYERS', message: 'Attacker or target not found.' });
        return;
      }
      if (attacker.hp <= 0) {
        socket.emit('battle:error', { code: 'ATTACKER_DEFEATED', message: 'Defeated players cannot attack.' });
        return;
      }

      const parsedDamage = Number(damage);
      const normalizedDamage =
        Number.isNaN(parsedDamage) || parsedDamage < 0 ? DEFAULT_DAMAGE : parsedDamage;
      const appliedDamage = Math.max(MIN_DAMAGE, Math.min(MAX_DAMAGE, normalizedDamage));
      socket.data.lastAttackAt = now;
      target.hp = Math.max(0, target.hp - appliedDamage);
      state.lastEventAt = Date.now();

      io.to(battleId).emit('battle:attacked', {
        battleId,
        attackerId,
        targetId,
        damage: appliedDamage,
        targetHp: target.hp,
      });

      io.to(battleId).emit('battle:state', buildStatePayload(state));
    });

    socket.on('broadcastState', ({ battleId }) => {
      const state = battleStateByRoom.get(battleId);
      if (!state) {
        socket.emit('battle:error', { code: 'ROOM_NOT_FOUND', message: 'Battle room does not exist.' });
        return;
      }
      io.to(battleId).emit('battle:state', buildStatePayload(state));
    });

    socket.on('disconnect', () => {
      const { battleId, playerId } = socket.data || {};
      if (!battleId || !playerId) return;

      const state = battleStateByRoom.get(battleId);
      if (!state) return;

      state.players.delete(playerId);
      state.lastEventAt = Date.now();
      io.to(battleId).emit('battle:playerLeft', { battleId, playerId });

      if (state.players.size === 0) {
        battleStateByRoom.delete(battleId);
        return;
      }

      io.to(battleId).emit('battle:state', buildStatePayload(state));
    });
  });
}
