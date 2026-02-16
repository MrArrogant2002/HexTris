import { Server } from 'socket.io';
import { registerBattleHandlers } from './handlers/battleHandler.js';

export function initSockets(httpServer) {
  const configuredOrigins = process.env.SOCKET_ALLOWED_ORIGINS;
  if (!configuredOrigins && process.env.NODE_ENV === 'production') {
    console.warn('SOCKET_ALLOWED_ORIGINS is not set in production; defaulting to localhost origin.');
  }
  const allowedOrigins = (configuredOrigins || 'http://localhost:5173')
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
