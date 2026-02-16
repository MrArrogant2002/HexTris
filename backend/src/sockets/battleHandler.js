/**
 * Crew sync socket event handlers.
 * Provides crew invitations, live leaderboard updates, task feed, and elimination flow.
 */

const crewMembers = new Map();
const battleStates = new Map();
const BATTLE_STALE_TTL_MS = 10 * 60 * 1000;
const SCORE_UPDATE_THROTTLE_MS = 150;
const ROUND_DURATION_MS = 20000;
const TASK_OBJECTIVES = [
  'Clear 10 blocks',
  'Trigger a combo x3',
  'Survive 20 seconds',
  'Collect 1 time orb',
];

function pruneStaleBattles() {
  const now = Date.now();
  for (const [battleId, state] of battleStates.entries()) {
    if (state.players.size === 0 || now - state.lastEventAt > BATTLE_STALE_TTL_MS) {
      battleStates.delete(battleId);
    }
  }
}

function ensureBattleState(battleId, difficulty = 'standard') {
  if (!battleStates.has(battleId)) {
    battleStates.set(battleId, {
      battleId,
      seq: 0,
      round: 1,
      taskObjective: TASK_OBJECTIVES[0],
      nextRoundAt: Date.now() + ROUND_DURATION_MS,
      players: new Map(),
      winnerId: null,
      lastEventAt: Date.now(),
    });
  }
  const state = battleStates.get(battleId);
  state.difficulty = difficulty;
  return state;
}

function serializeLeaderboard(state) {
  return Array.from(state.players.entries())
    .map(([userId, entry]) => ({
      userId,
      userName: entry.userName,
      score: entry.score,
      eliminated: entry.eliminated,
    }))
    .sort((a, b) => b.score - a.score);
}

function emitLeaderboard(io, state, reason = 'score') {
  state.seq += 1;
  state.lastEventAt = Date.now();
  io.to(state.battleId).emit('crew:leaderboard', {
    seq: state.seq,
    reason,
    round: state.round,
    taskObjective: state.taskObjective,
    entries: serializeLeaderboard(state),
  });
}

function emitTask(io, state) {
  io.to(state.battleId).emit('crew:task', {
    round: state.round,
    objective: state.taskObjective,
  });
}

function maybeAdvanceRound(io, state) {
  const now = Date.now();
  if (state.winnerId || now < state.nextRoundAt) return;

  const active = Array.from(state.players.entries()).filter(([, p]) => !p.eliminated);
  if (active.length <= 1) {
    const winner = active[0];
    if (winner) {
      state.winnerId = winner[0];
      io.to(state.battleId).emit('crew:winner', { playerId: winner[0], userName: winner[1].userName });
    }
    emitLeaderboard(io, state, 'winner');
    return;
  }

  active.sort((a, b) => a[1].score - b[1].score);
  const [eliminatedId, eliminatedPlayer] = active[0];
  eliminatedPlayer.eliminated = true;
  io.to(state.battleId).emit('crew:eliminated', {
    playerId: eliminatedId,
    userName: eliminatedPlayer.userName,
    round: state.round,
  });

  const remaining = active.slice(1);
  if (remaining.length === 1) {
    state.winnerId = remaining[0][0];
    io.to(state.battleId).emit('crew:winner', { playerId: remaining[0][0], userName: remaining[0][1].userName });
  } else {
    state.round += 1;
    state.taskObjective = TASK_OBJECTIVES[(state.round - 1) % TASK_OBJECTIVES.length];
    state.nextRoundAt = now + ROUND_DURATION_MS;
    emitTask(io, state);
  }

  emitLeaderboard(io, state, 'round_end');
}

export function registerBattleHandler(io, socket) {
  pruneStaleBattles();
  let joinedCrewId = null;
  let joinedBattleId = null;
  let joinedPlayerId = null;

  socket.on('joinCrew', (payload = {}, ack) => {
    const { groupId, playerId } = payload;
    if (!groupId || !playerId) {
      ack?.({ ok: false, error: 'groupId and playerId are required' });
      return;
    }
    const crewRoom = `crew:${groupId}`;
    joinedCrewId = String(groupId);
    socket.join(crewRoom);
    crewMembers.set(String(playerId), { socketId: socket.id, crewId: joinedCrewId });
    ack?.({ ok: true, crewId: joinedCrewId });
  });

  socket.on('startMatchInvite', (payload = {}, ack) => {
    const { groupId, battleId, leaderId, leaderName, difficulty = 'standard', memberCount = 0 } = payload;
    if (!groupId || !battleId || !leaderId) {
      ack?.({ ok: false, error: 'groupId, battleId and leaderId are required' });
      return;
    }

    io.to(`crew:${groupId}`).emit('crew:matchInvitation', {
      groupId: String(groupId),
      battleId: String(battleId),
      leaderId: String(leaderId),
      leaderName: String(leaderName || 'Crew Leader'),
      difficulty: String(difficulty),
      memberCount: Number(memberCount) || 0,
    });
    ack?.({ ok: true });
  });

  socket.on('respondMatchInvite', (payload = {}, ack) => {
    const { groupId, battleId, playerId, accepted } = payload;
    if (!groupId || !battleId || !playerId) {
      ack?.({ ok: false, error: 'groupId, battleId and playerId are required' });
      return;
    }
    io.to(`crew:${groupId}`).emit('crew:inviteResponse', {
      groupId: String(groupId),
      battleId: String(battleId),
      playerId: String(playerId),
      accepted: Boolean(accepted),
    });
    ack?.({ ok: true });
  });

  socket.on('joinBattle', (payload = {}, ack) => {
    const { battleId, playerId, userName = 'Player', difficulty = 'standard' } = payload;
    if (!battleId || !playerId) {
      ack?.({ ok: false, error: 'battleId and playerId are required' });
      return;
    }

    joinedBattleId = String(battleId);
    joinedPlayerId = String(playerId);
    socket.join(joinedBattleId);

    const state = ensureBattleState(joinedBattleId, String(difficulty));
    state.players.set(joinedPlayerId, {
      socketId: socket.id,
      userName: String(userName),
      score: state.players.get(joinedPlayerId)?.score ?? 0,
      eliminated: false,
      lastScoreUpdateAt: 0,
    });

    emitTask(io, state);
    emitLeaderboard(io, state, 'player_joined');
    ack?.({ ok: true, battleId: joinedBattleId });
  });

  socket.on('updateScore', (payload = {}, ack) => {
    const { battleId, playerId, score } = payload;
    const normalizedBattleId = String(battleId || joinedBattleId || '');
    const normalizedPlayerId = String(playerId || joinedPlayerId || '');
    if (!normalizedBattleId || !normalizedPlayerId) {
      ack?.({ ok: false, error: 'battleId and playerId are required' });
      return;
    }

    const state = battleStates.get(normalizedBattleId);
    if (!state || !state.players.has(normalizedPlayerId)) {
      ack?.({ ok: false, error: 'Battle not found' });
      return;
    }

    const player = state.players.get(normalizedPlayerId);
    const now = Date.now();
    if (now - player.lastScoreUpdateAt < SCORE_UPDATE_THROTTLE_MS) {
      ack?.({ ok: true, throttled: true });
      return;
    }

    if (!player.eliminated) {
      player.score = Math.max(0, Number(score) || 0);
    }
    player.lastScoreUpdateAt = now;
    state.lastEventAt = now;
    maybeAdvanceRound(io, state);
    emitLeaderboard(io, state, 'score');
    ack?.({ ok: true, seq: state.seq });
  });

  socket.on('broadcastState', (_payload = {}, ack) => {
    if (!joinedBattleId) {
      ack?.({ ok: false, error: 'Join a battle first' });
      return;
    }
    const state = battleStates.get(joinedBattleId);
    if (!state) {
      ack?.({ ok: false, error: 'Battle not found' });
      return;
    }
    emitLeaderboard(io, state, 'manual_broadcast');
    ack?.({ ok: true, seq: state.seq });
  });

  socket.on('disconnect', () => {
    if (joinedPlayerId) crewMembers.delete(joinedPlayerId);
    if (!joinedBattleId || !joinedPlayerId) return;

    const state = battleStates.get(joinedBattleId);
    if (!state) return;

    state.players.delete(joinedPlayerId);
    if (state.players.size === 0) {
      battleStates.delete(joinedBattleId);
      return;
    }
    emitLeaderboard(io, state, 'player_disconnected');
  });
}
