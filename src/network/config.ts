// Network Configuration
// Backend URL is configured through Vite env variables to keep secrets out of source control.
const DEFAULT_BACKEND_URL = 'http://localhost:3001';
const backendUrl = import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL;

if (!import.meta.env.VITE_BACKEND_URL) {
  console.warn('VITE_BACKEND_URL not set. Falling back to local backend URL.');
}

export const API_URL = backendUrl;
export const BASE_URL = backendUrl;

// Connection status
export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error'
};

console.log(`Backend URL: ${API_URL}`);
