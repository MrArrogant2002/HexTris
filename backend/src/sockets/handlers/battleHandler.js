// In-memory room state is suitable for a single-node runtime.
// Use Redis or another shared store for multi-node horizontal scaling.
const battleStateByRoom = new Map();
const INITIAL_PLAYER_HP = 100;
const DEFAULT_DAMAGE = 10;
const MIN_DAMAGE = 1;
const MAX_DAMAGE = 100;
const ATTACK_COOLDOWN_MS = 250;
const STATE_BROADCAST_COOLDOWN_MS = 120;
const TASK_BROADCAST_INTERVAL_MS = 20000;
const ROUND_DURATION_MS = 45000;
const ALLOWED_DIFFICULTIES = new Set(['easy', 'medium', 'hard']);
const SYNC_TASK_POOL = [
  { id: 'clear-12', label: 'Clear 12 blocks in this round' },
  { id: 'combo-4', label: 'Build a combo streak of 4+' },
  { id: 'survive-20', label: 'Survive for 20 seconds without life loss' },
];

function getBattleState(battleId) {
  if (!battleStateByRoom.has(battleId)) {
    battleStateByRoom.set(battleId, {
      battleId,
      players: new Map(),
      lastEventAt: Date.now(),
      lastBroadcastAt: 0,
      leaderId: null,
      activeInvitationId: null,
      invitationResponses: new Map(),
      matchActive: false,
      difficulty: 'medium',
      round: 0,
      scores: new Map(),
      eliminatedPlayerIds: new Set(),
      taskIndex: 0,
      taskTimer: null,
      roundTimer: null,
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
    difficulty: state.difficulty,
    round: state.round,
    matchActive: state.matchActive,
    eliminatedPlayerIds: Array.from(state.eliminatedPlayerIds.values()),
  };
}

export function emitBattleUpdate(io, battleId, payload = {}) {
  io.to(battleId).emit('battle:update', {
    battleId,
    ...payload,
  });
}

function emitState(io, state) {
  io.to(state.battleId).emit('battle:state', buildStatePayload(state));
}

function emitStateThrottled(io, state) {
  const now = Date.now();
  if (now - state.lastBroadcastAt < STATE_BROADCAST_COOLDOWN_MS) {
    return;
  }
  state.lastBroadcastAt = now;
  emitState(io, state);
}

function getActivePlayers(state) {
  return Array.from(state.players.values()).filter((player) => !state.eliminatedPlayerIds.has(player.playerId));
}

function stopTaskFeed(state) {
  if (state.taskTimer) {
    clearInterval(state.taskTimer);
    state.taskTimer = null;
  }
}

function stopRoundTimer(state) {
  if (state.roundTimer) {
    clearInterval(state.roundTimer);
    state.roundTimer = null;
  }
}

function ensureTaskFeed(io, state) {
  stopTaskFeed(state);
  state.taskTimer = setInterval(() => {
    if (!state.matchActive) return;
    const task = SYNC_TASK_POOL[state.taskIndex % SYNC_TASK_POOL.length];
    state.taskIndex += 1;
    io.to(state.battleId).emit('battle:task', {
      battleId: state.battleId,
      round: state.round,
      task,
      issuedAt: new Date().toISOString(),
    });
  }, TASK_BROADCAST_INTERVAL_MS);
}

function startMatch(io, state) {
  state.matchActive = true;
  state.round = 1;
  state.eliminatedPlayerIds.clear();
  state.scores = new Map();
  state.players.forEach((_, playerId) => {
    state.scores.set(playerId, 0);
  });
  state.lastEventAt = Date.now();
  io.to(state.battleId).emit('battle:matchStarted', {
    battleId: state.battleId,
    round: state.round,
    difficulty: state.difficulty,
  });
  emitState(io, state);
  ensureTaskFeed(io, state);
  stopRoundTimer(state);
  state.roundTimer = setInterval(() => {
    if (!state.matchActive) return;
    completeRound(io, state);
  }, ROUND_DURATION_MS);
}

function maybeFinishMatch(io, state) {
  const activePlayers = getActivePlayers(state);
  if (activePlayers.length !== 1) return false;
  const winner = activePlayers[0];
  state.matchActive = false;
  state.lastEventAt = Date.now();
  stopTaskFeed(state);
  stopRoundTimer(state);
  io.to(state.battleId).emit('battle:winner', {
    battleId: state.battleId,
    winnerId: winner.playerId,
    winnerName: winner.name,
  });
  emitState(io, state);
  return true;
}

function completeRound(io, state) {
  const activePlayers = getActivePlayers(state);
  if (activePlayers.length <= 1) {
    maybeFinishMatch(io, state);
    return;
  }
  let lowest = activePlayers[0];
  let lowestScore = state.scores.get(lowest.playerId) ?? 0;
  for (const candidate of activePlayers.slice(1)) {
    const candidateScore = state.scores.get(candidate.playerId) ?? 0;
    if (candidateScore < lowestScore) {
      lowest = candidate;
      lowestScore = candidateScore;
    }
  }
  state.eliminatedPlayerIds.add(lowest.playerId);
  state.lastEventAt = Date.now();
  io.to(state.battleId).emit('battle:eliminated', {
    battleId: state.battleId,
    round: state.round,
    playerId: lowest.playerId,
    name: lowest.name,
    score: lowestScore,
  });

  if (maybeFinishMatch(io, state)) {
    return;
  }

  state.round += 1;
  state.scores = new Map();
  getActivePlayers(state).forEach((player) => {
    state.scores.set(player.playerId, 0);
  });
  io.to(state.battleId).emit('battle:roundStarted', {
    battleId: state.battleId,
    round: state.round,
  });
  emitState(io, state);
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
        if (!state.leaderId) {
          state.leaderId = playerId;
        }

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
        emitStateThrottled(io, state);
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

      emitStateThrottled(io, state);
    });

    socket.on('startSyncInvitation', ({ battleId, leaderId, leaderName, difficulty }) => {
      if (!battleId || !leaderId) {
        socket.emit('battle:error', { code: 'INVALID_INVITATION', message: 'Invalid invitation payload.' });
        return;
      }
      const state = battleStateByRoom.get(battleId);
      if (!state) {
        socket.emit('battle:error', { code: 'ROOM_NOT_FOUND', message: 'Battle room does not exist.' });
        return;
      }
      if (state.leaderId !== leaderId || socket.data?.playerId !== leaderId) {
        socket.emit('battle:error', { code: 'NOT_LEADER', message: 'Only the crew leader can start sync invites.' });
        return;
      }
      const normalizedDifficulty = typeof difficulty === 'string' ? difficulty.toLowerCase() : '';
      if (!ALLOWED_DIFFICULTIES.has(normalizedDifficulty)) {
        socket.emit('battle:error', { code: 'INVALID_DIFFICULTY', message: 'Difficulty must be Easy, Medium, or Hard.' });
        return;
      }
      state.difficulty = normalizedDifficulty;
      state.activeInvitationId = `${battleId}:${Date.now()}`;
      state.invitationResponses = new Map([[leaderId, true]]);
      state.lastEventAt = Date.now();
      io.to(battleId).emit('battle:invitation', {
        battleId,
        invitationId: state.activeInvitationId,
        leaderId,
        leaderName,
        difficulty: normalizedDifficulty,
      });
      emitState(io, state);
    });

    socket.on('respondSyncInvitation', ({ battleId, invitationId, playerId, accepted }) => {
      if (!battleId || !invitationId || !playerId) {
        socket.emit('battle:error', { code: 'INVALID_INVITE_RESPONSE', message: 'Invalid invite response payload.' });
        return;
      }
      const state = battleStateByRoom.get(battleId);
      if (!state || state.activeInvitationId !== invitationId) {
        socket.emit('battle:error', { code: 'INVITATION_NOT_FOUND', message: 'Invitation is no longer active.' });
        return;
      }
      if (!state.players.has(playerId)) {
        socket.emit('battle:error', { code: 'PLAYER_NOT_FOUND', message: 'Player is not in this room.' });
        return;
      }
      state.invitationResponses.set(playerId, Boolean(accepted));
      io.to(battleId).emit('battle:invitationResponse', {
        battleId,
        invitationId,
        playerId,
        accepted: Boolean(accepted),
      });

      const activePlayers = Array.from(state.players.keys());
      const hasDecline = Array.from(state.invitationResponses.values()).some((response) => response === false);
      const allAccepted = activePlayers.every((id) => state.invitationResponses.get(id) === true);
      if (!hasDecline && allAccepted && !state.matchActive) {
        startMatch(io, state);
      }
    });

    socket.on('battle:score', ({ battleId, playerId, score }) => {
      const state = battleStateByRoom.get(battleId);
      if (!state || !state.matchActive) return;
      if (!state.players.has(playerId) || state.eliminatedPlayerIds.has(playerId)) return;
      const normalizedScore = Number(score);
      if (!Number.isFinite(normalizedScore) || normalizedScore < 0) return;
      state.scores.set(playerId, Math.floor(normalizedScore));
    });

    socket.on('battle:completeRound', ({ battleId, requestedBy }) => {
      const state = battleStateByRoom.get(battleId);
      if (!state || !state.matchActive) return;
      if (requestedBy !== state.leaderId) {
        socket.emit('battle:error', { code: 'NOT_LEADER', message: 'Only the crew leader can complete rounds.' });
        return;
      }
      completeRound(io, state);
    });

    socket.on('broadcastState', ({ battleId }) => {
      const state = battleStateByRoom.get(battleId);
      if (!state) {
        socket.emit('battle:error', { code: 'ROOM_NOT_FOUND', message: 'Battle room does not exist.' });
        return;
      }
      emitState(io, state);
    });

    socket.on('disconnect', () => {
      const { battleId, playerId } = socket.data || {};
      if (!battleId || !playerId) return;

      const state = battleStateByRoom.get(battleId);
      if (!state) return;

      state.players.delete(playerId);
      state.scores.delete(playerId);
      state.eliminatedPlayerIds.delete(playerId);
      state.invitationResponses.delete(playerId);
      state.lastEventAt = Date.now();
      io.to(battleId).emit('battle:playerLeft', { battleId, playerId });

      if (state.players.size === 0) {
        stopTaskFeed(state);
        stopRoundTimer(state);
        battleStateByRoom.delete(battleId);
        return;
      }

      if (state.leaderId === playerId) {
        const nextLeader = state.players.keys().next();
        state.leaderId = nextLeader.done ? null : nextLeader.value;
      }

      maybeFinishMatch(io, state);
      emitStateThrottled(io, state);
    });
  });
}
