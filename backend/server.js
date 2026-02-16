import http from 'node:http';
import express from 'express';
import { initSockets } from './src/sockets/index.js';
import { emitBattleUpdate } from './src/sockets/handlers/battleHandler.js';

const DEFAULT_PORT = 4000;

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
  const { state: stateUpdate } = req.body ?? {};

  if (!battleId || typeof battleId !== 'string') {
    res.status(400).json({ error: 'battleId is required' });
    return;
  }

  emitBattleUpdate(io, battleId, {
    source: 'rest',
    state: stateUpdate ?? {},
    updatedAt: new Date().toISOString(),
  });

  res.status(202).json({ accepted: true, battleId });
});

const port = Number(process.env.PORT || DEFAULT_PORT);
server.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
