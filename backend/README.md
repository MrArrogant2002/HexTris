# Crew Battle Socket Backend Structure

## File Tree

```text
backend/
└── src/
    ├── server.js
    └── sockets/
        ├── index.js
        └── battleHandler.js
```

## `server.js`

```js
import http from 'node:http';
import express from 'express';
import { initSockets } from './sockets/index.js';

const app = express();
app.use(express.json());

const server = http.createServer(app);
const { emitBattleUpdate } = initSockets(server, {
  corsOrigin: [process.env.CLIENT_ORIGIN || 'http://localhost:5173'],
});

app.post('/api/battles/:battleId/broadcast', (req, res) => {
  emitBattleUpdate(req.params.battleId, {
    reason: 'rest_broadcast',
    ...req.body,
  });
  res.status(202).json({ ok: true });
});
```

## `sockets/index.js`

```js
import { Server } from 'socket.io';
import { registerBattleHandler } from './battleHandler.js';

let ioInstance = null;

export function initSockets(httpServer, options = {}) {
  const io = new Server(httpServer, {
    cors: {
      origin: options.corsOrigin || ['http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance = io;
  io.on('connection', (socket) => registerBattleHandler(io, socket));

  return { io, emitBattleUpdate, getIO };
}

export function getIO() {
  if (!ioInstance) throw new Error('Socket.io not initialized');
  return ioInstance;
}

export function emitBattleUpdate(battleId, payload) {
  if (!ioInstance || !battleId) return;
  ioInstance.to(battleId).emit('broadcastState', { battleId, ...payload });
}
```

## `sockets/battleHandler.js`

```js
const battleStates = new Map();

export function registerBattleHandler(io, socket) {
  let joinedBattleId = null;
  let joinedPlayerId = null;

  socket.on('joinBattle', ({ battleId, playerId } = {}, ack) => {
    // validate payload, join room, build battle state, emit broadcastState
  });

  socket.on('attack', ({ targetPlayerId, damage } = {}, ack) => {
    // validate room and target, apply damage, emit broadcastState
  });

  socket.on('broadcastState', (payload = {}, ack) => {
    // server-authoritative room broadcast
  });

  socket.on('disconnect', () => {
    // remove disconnected player and clean empty rooms
  });
}
```

## Triggering battle updates from REST controllers

Use the `emitBattleUpdate` helper returned by `initSockets(server)` (or `getIO()` from `sockets/index.js`) inside HTTP controllers/services. This avoids circular imports and keeps Socket.io access centralized.
