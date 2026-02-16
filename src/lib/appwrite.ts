/**
 * Appwrite SDK Configuration
 * Initializes Appwrite client, account, and databases services
 */

import { Client, Account, Databases } from 'appwrite';

const appwriteEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || '';
const appwriteProjectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(appwriteEndpoint)
  .setProject(appwriteProjectId);

// Initialize services
const account = new Account(client);
const databases = new Databases(client);

// Export for use throughout the app
export { client, account, databases };
