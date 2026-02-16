/**
 * Crew Battle socket event handlers.
 * - Rooms isolate each battle by battleId
 * - Supports joinBattle, attack, broadcastState
 * - Handles invalid joins and disconnect cleanup
 */

const battleStates = new Map();
const MIN_DAMAGE = 1;
const MAX_DAMAGE = 100;
const DEFAULT_DAMAGE = 10;
const BATTLE_STALE_TTL_MS = 10 * 60 * 1000;

function pruneStaleBattles() {
  const now = Date.now();
  for (const [battleId, state] of battleStates.entries()) {
    if (state.players.size === 0 || now - state.lastEventAt > BATTLE_STALE_TTL_MS) {
      battleStates.delete(battleId);
    }
  }
}

function ensureBattleState(battleId) {
  if (!battleStates.has(battleId)) {
    battleStates.set(battleId, {
      battleId,
      players: new Map(),
      hpByPlayer: new Map(),
      lastEventAt: Date.now(),
    });
  }
  return battleStates.get(battleId);
}

export function registerBattleHandler(io, socket) {
  pruneStaleBattles();
  let joinedBattleId = null;
  let joinedPlayerId = null;

  socket.on('joinBattle', (payload = {}, ack) => {
    try {
      const { battleId, playerId } = payload;
      if (!battleId || !playerId) {
        ack?.({ ok: false, error: 'battleId and playerId are required' });
        return;
      }

      joinedBattleId = String(battleId);
      joinedPlayerId = String(playerId);

      socket.join(joinedBattleId);

      const state = ensureBattleState(joinedBattleId);
      state.players.set(joinedPlayerId, socket.id);
      if (!state.hpByPlayer.has(joinedPlayerId)) {
        state.hpByPlayer.set(joinedPlayerId, 100);
      }
      state.lastEventAt = Date.now();

      const serializedState = serializeState(state);

      io.to(joinedBattleId).emit('broadcastState', {
        reason: 'player_joined',
        state: serializedState,
      });

      ack?.({ ok: true, battleId: joinedBattleId, state: serializedState });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('joinBattle failed:', error);
      ack?.({ ok: false, error: 'Failed to join battle' });
    }
  });

  socket.on('attack', (payload = {}, ack) => {
    try {
      if (!joinedBattleId || !joinedPlayerId) {
        ack?.({ ok: false, error: 'Join a battle before attacking' });
        return;
      }

      const { targetPlayerId, damage = 10 } = payload;
      if (!targetPlayerId) {
        ack?.({ ok: false, error: 'targetPlayerId is required' });
        return;
      }

      const state = battleStates.get(joinedBattleId);
      if (!state || !state.players.has(String(targetPlayerId))) {
        ack?.({ ok: false, error: 'Invalid battle or target player' });
        return;
      }

      const normalizedDamage = Math.max(
        MIN_DAMAGE,
        Math.min(MAX_DAMAGE, Number(damage) || DEFAULT_DAMAGE)
      );
      const currentHp = state.hpByPlayer.get(String(targetPlayerId)) ?? 100;
      const nextHp = Math.max(0, currentHp - normalizedDamage);
      state.hpByPlayer.set(String(targetPlayerId), nextHp);
      state.lastEventAt = Date.now();

      const serializedState = serializeState(state);
      io.to(joinedBattleId).emit('broadcastState', {
        reason: 'attack',
        actorPlayerId: joinedPlayerId,
        targetPlayerId: String(targetPlayerId),
        damage: normalizedDamage,
        state: serializedState,
      });

      ack?.({ ok: true, state: serializedState });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('attack failed:', error);
      ack?.({ ok: false, error: 'Attack failed' });
    }
  });

  socket.on('broadcastState', (payload = {}, ack) => {
    try {
      if (!joinedBattleId) {
        ack?.({ ok: false, error: 'Join a battle first' });
        return;
      }
      const state = battleStates.get(joinedBattleId);
      if (!state) {
        ack?.({ ok: false, error: 'Battle not found' });
        return;
      }

      io.to(joinedBattleId).emit('broadcastState', {
        reason: payload.reason || 'manual_broadcast',
        state: serializeState(state),
      });
      ack?.({ ok: true });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('broadcastState failed:', error);
      ack?.({ ok: false, error: 'Failed to broadcast state' });
    }
  });

  socket.on('disconnect', () => {
    if (!joinedBattleId || !joinedPlayerId) return;
    const state = battleStates.get(joinedBattleId);
    if (!state) return;

    state.players.delete(joinedPlayerId);
    state.lastEventAt = Date.now();

    if (state.players.size === 0) {
      battleStates.delete(joinedBattleId);
      return;
    }

    io.to(joinedBattleId).emit('broadcastState', {
      reason: 'player_disconnected',
      playerId: joinedPlayerId,
      state: serializeState(state),
    });
  });
}

function serializeState(state) {
  return {
    battleId: state.battleId,
    players: Array.from(state.players.keys()),
    hpByPlayer: Object.fromEntries(state.hpByPlayer.entries()),
    lastEventAt: state.lastEventAt,
  };
}
