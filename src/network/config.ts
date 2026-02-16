// Network Configuration
// Always target deployed backend for both REST and socket endpoints.
const DEPLOYED_BACKEND_URL = 'https://hextris-backend.onrender.com';
export const API_URL = DEPLOYED_BACKEND_URL;
export const BASE_URL = DEPLOYED_BACKEND_URL;

// Connection status
export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error'
};

console.log(`Backend URL: ${API_URL}`);
