/**
 * Socket.io bootstrap for Crew Battle.
 * Exposes io-safe helpers so handlers/controllers don't need to import io directly.
 */

import { Server } from 'socket.io';
import { registerBattleHandler } from './battleHandler.js';

let ioInstance = null;

export function initSockets(httpServer, options = {}) {
  if (ioInstance) {
    // eslint-disable-next-line no-console
    console.warn('initSockets called more than once. Reusing existing Socket.io instance.');
    return {
      io: ioInstance,
      emitBattleUpdate,
      getIO,
    };
  }

  const corsOrigin = options.corsOrigin || ['http://localhost:5173'];

  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    registerBattleHandler(io, socket);
  });

  return {
    io,
    emitBattleUpdate,
    getIO,
  };
}

export function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized. Call initSockets(server) first.');
  }
  return ioInstance;
}

export function emitBattleUpdate(battleId, payload) {
  if (!battleId) return;
  if (!ioInstance) return;
  ioInstance.to(battleId).emit('broadcastState', {
    battleId,
    ...payload,
  });
}
