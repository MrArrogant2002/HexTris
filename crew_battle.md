# Crew Battle Multiplayer Design

## 1) Room Creation & Join Flow
- Leader creates a Crew Battle room and receives a shareable room code.
- Members join by room code.
- Room size: **minimum 5 players**, **maximum 30 players**.
- Minimum-5 gate keeps challenge pacing and reward economy healthy; for QA/beta, allow an optional `testRoom` flag with 2–4 players.
- Leader can only start once minimum player count is met.

## 2) Match Start Rules
- Leader starts the match for all joined members at once.
- Every player receives the **same map seed, same difficulty, same timers**, and same task schedule.
- Gameplay is individual (no shared board), but all players are in one synchronized session timeline.

## 3) Level Scaling by Member Count
- Match levels scale by player count to keep sessions fair and exciting (inclusive ranges):
  - **5–9 players:** 3 stages
  - **10–14 players:** 4 stages
  - **15–20 players:** 5 stages
  - **21–30 players:** 6 stages
- Each next stage increases wave pressure and challenge frequency equally for everyone.

## 4) Challenge Tasks & Power Rewards
- All players receive periodic shared tasks (example: clear X blocks in Y seconds, perform combo streak, clear multi-color set).
- Completing a task grants one tactical battle power.
- Battle power effect: **reduce one opponent’s score by 100 points**.
- Balance note: keep this value server-configurable (`scoreAttackValue`) so live-ops can tune by mode/season if score inflation changes.
- Recommended anti-abuse limits:
  - Cannot target the same opponent more than 2 times in a row.
  - Optional 8–12 second cooldown between attacks.
  - Last 15 seconds can be “no-attack” lock for final ranking integrity.

## 5) Ranking & Rewards
- At match completion, winners are selected by room size:
  - Small lobby: **Top 1**
  - Medium lobby: **Top 3**
  - Large lobby: **Top 5**
  - Very large lobby: **Top 10**
  - Full-scale lobby: **Top 15**
- Reward model (diamonds) should scale with both placement and room size.
- Suggested reward logic:
  - Base reward by placement tier
  - Multiplicative bonus by lobby bracket
  - Participation diamonds for non-top players to keep retention high

## 6) Additional Game Plans
- **Rematch Vote:** 70%+ players voting rematch reopens same room quickly.
- **Crew Streak Bonus:** consecutive top placements grant streak diamonds.
- **Task Variety Rotation:** daily rotating task pools to avoid repetition.
- **Fair Matchmaking Guardrails:** optional rank-band checks before room start.
- **Post-Match Highlights:** show biggest combo, best comeback, and most tactical attacks.
- **Spectator Mode (late join):** allow non-participants to watch until next round.

## 7) State Sync & Technical Notes
- Use authoritative room state (leader actions validated server-side).
- Broadcast checkpoints: room_created, member_joined, member_left, match_started, stage_changed, task_spawned, task_completed, score_attack_applied, match_finished.
- Keep deterministic gameplay by sharing seed + synchronized stage timeline.
- Persist results for leaderboard, rewards, and anti-cheat review.

## 8) Live Scoreboard (Socket Design)
- **Best option for game flow:** use **Socket.IO (WebSocket transport)** with server-authoritative scoring.
- Why this is best for Crew Battle:
  - Low-latency rank movement (smooth “race” feeling during active clears).
  - Built-in reconnect/heartbeat behavior improves match continuity on mobile networks.
  - Room-based broadcasts map directly to room-code gameplay.
  - Graceful downgrade path to polling when real-time transport is unstable.
- Each room subscribes to a channel key like: `crew:{roomCode}:scoreboard`.
- Server is authoritative: clients send score events, server validates and then broadcasts.
- Recommended event flow:
  - `score_update_client` `{ playerId, score, combo, timestamp }`
  - `score_update_server` `{ playerId, validatedScore, rankDelta, roomSeq }`
  - `score_attack_applied` `{ attackerId, targetId, amount, targetNewScore, roomSeq }`
  - `scoreboard_snapshot` `{ topPlayers, yourRank, remainingTime, roomSeq }`
- Update cadence:
  - Push incremental updates on every valid scoring action.
  - Push full snapshot every **2 seconds** on WS/SSE modes for consistency recovery.
- Connection reliability:
  - On disconnect, client attempts reconnect with room token.
  - After reconnect, client requests latest `scoreboard_snapshot` and resumes delta stream.
- Fallback when WebSocket is unavailable:
  - If WS handshake fails or reconnect exceeds 10 seconds, switch to **SSE**.
  - If SSE stream fails 2 consecutive times, switch to short polling (every 2 seconds).
  - In polling mode, polling responses act as the snapshot source (no extra snapshot push loop).
  - Keep background WS retry every 15 seconds; upgrade back to WS when healthy.
- Security and fairness:
  - Reject impossible score jumps and stale timestamps server-side.
  - Sequence-number events **per room stream** (`roomSeq`); expected value is consecutive integers.
  - Client logic: if `incoming.roomSeq <= lastRoomSeq` ignore as stale; if `incoming.roomSeq > lastRoomSeq + 1`, request immediate `scoreboard_snapshot`.
  - Keep a short audit log of score-changing actions for anti-cheat review.

## 9) Appwrite Database Schema (Required Attributes)

### Users Collection (`VITE_APPWRITE_USERS_COLLECTION_ID`)
- `userId` (string, required, unique)
- `name` (string, required)
- `email` (Appwrite Email attribute type, required, unique)
- `singlePlayerHighScore` (integer, required, default `0`)
- `totalDiamonds` (integer, required, default `500`)
- `gamesPlayed` (integer, required, default `0`)
- `totalPlayTime` (integer, required, default `0`)
- `themesUnlocked` (string array, required, default `["classic"]`)
- `selectedTheme` (string, required, default `"classic"`)
- `timerAttackBest` (integer, required, default `0`)
- `inventory_continue` (integer, required, default `0`)
- `inventory_extraLife` (integer, required, default `0`)
- `inventory_pulse` (integer, required, default `0`)
- `inventory_tempo` (integer, required, default `0`)
- `inventory_aegis` (integer, required, default `0`)
- `inventory_nova` (integer, required, default `0`)
- `inventory_shift` (integer, optional legacy field; keep for existing deployments, may be omitted in new deployments)

### Groups Collection (`VITE_APPWRITE_GROUPS_COLLECTION_ID`)
- `roomCode` (string, required, unique)
- `groupName` (string, required)
- `createdBy` (string, required)
- `memberIds` (string array, required)
- `memberCount` (integer, required)
- `isActive` (boolean, required, default `true`)

### Group Scores Collection (`VITE_APPWRITE_GROUPSCORES_COLLECTION_ID`)
- `userId` (string, required)
- `groupId` (string, required)
- `userName` (string, required)
- `bestScore` (integer, required, default `0`)
- `gamesPlayed` (integer, required, default `0`)
- `difficulty` (string, required)
- `lastPlayedAt` (Appwrite DateTime attribute type, optional)

### Recommended Indexes
- Users: `userId` (unique), `singlePlayerHighScore` (desc for global leaderboard)
- Groups: `roomCode` (unique), `memberIds` (contains, acceptable for current max 30 members per room), `$createdAt` (desc)
- Group Scores: `(groupId, bestScore desc)`, `(userId, groupId)` for upsert/query efficiency

## 10) Backend Socket.io Modular Structure (Implemented)

### Exact File Tree
```text
backend/
├── server.js
└── src/
    └── sockets/
        ├── index.js
        └── handlers/
            └── battleHandler.js
```

### `server.js`
```js
import http from 'node:http';
import express from 'express';
import { initSockets } from './src/sockets/index.js';
import { emitBattleUpdate } from './src/sockets/handlers/battleHandler.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const server = http.createServer(app);

// Main server only delegates socket wiring to a single init call.
const { io } = initSockets(server);

// Example REST endpoint that can push a real-time battle update.
app.post('/api/battles/:battleId/state', (req, res) => {
  const { battleId } = req.params;
  const { state } = req.body ?? {};
  if (!battleId || typeof battleId !== 'string') {
    res.status(400).json({ error: 'battleId is required' });
    return;
  }

  emitBattleUpdate(io, battleId, {
    source: 'rest',
    state: state ?? {},
    updatedAt: new Date().toISOString(),
  });

  res.status(202).json({ accepted: true, battleId });
});
```

### `sockets/index.js`
```js
import { Server } from 'socket.io';
import { registerBattleHandlers } from './handlers/battleHandler.js';

export function initSockets(httpServer) {
  const allowedOrigins = (process.env.SOCKET_ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.emit('socket:connected', { socketId: socket.id });
  });

  registerBattleHandlers(io);
  return { io };
}
```

### `sockets/handlers/battleHandler.js`
```js
const battleStateByRoom = new Map();

function getBattleState(battleId) {
  if (!battleStateByRoom.has(battleId)) {
    battleStateByRoom.set(battleId, { battleId, players: new Map(), lastEventAt: Date.now() });
  }
  return battleStateByRoom.get(battleId);
}

function buildStatePayload(state) {
  return {
    battleId: state.battleId,
    players: Array.from(state.players.values()).sort((a, b) => b.hp - a.hp),
    updatedAt: new Date(state.lastEventAt).toISOString(),
  };
}

export function emitBattleUpdate(io, battleId, payload = {}) {
  io.to(battleId).emit('battle:update', { battleId, ...payload });
}

export function registerBattleHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('joinBattle', ({ battleId, playerId, name }) => { /* validate + join room */ });
    socket.on('attack', ({ battleId, attackerId, targetId, damage }) => { /* apply damage + emit state */ });
    socket.on('broadcastState', ({ battleId }) => { /* emit room state */ });
    socket.on('disconnect', () => { /* cleanup disconnected player */ });
  });
}
```

### Triggering battle update from REST controller
- Capture `io` from `initSockets(server)` in `server.js` and pass it to REST modules/services as needed.
- Call `emitBattleUpdate(io, battleId, payload)` from your REST controller after DB writes.
- This keeps HTTP and socket paths decoupled while sharing the same room-scoped event contract.
