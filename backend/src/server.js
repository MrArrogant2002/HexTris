/**
 * Backend entrypoint (Express + HTTP + Socket.io).
 * Keeps HTTP route wiring separate from real-time socket setup.
 */

import http from 'node:http';
import express from 'express';
import { initSockets } from './sockets/index.js';

const app = express();
app.use(express.json());

// Example REST endpoint. Wire your normal route modules here.
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const server = http.createServer(app);

// Only responsibility here: attach sockets to HTTP server.
const { emitBattleUpdate } = initSockets(server, {
  corsOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
});

// Example: trigger live battle update from REST controller.
app.post('/api/battles/:battleId/broadcast', (req, res) => {
  const { battleId } = req.params;
  emitBattleUpdate(battleId, {
    reason: 'rest_broadcast',
    ...req.body,
  });
  res.status(202).json({ ok: true, battleId });
});

const PORT = Number(process.env.PORT || 3001);
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Crew Battle backend listening on :${PORT}`);
});
