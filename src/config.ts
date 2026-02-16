const appwriteEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const appwriteProjectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const appwriteDatabaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const appwriteUsersCollectionId = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

if (!appwriteEndpoint || !appwriteProjectId) {
  console.error('Missing Appwrite environment variables. Check your .env configuration.');
}

if (!backendUrl) {
  console.error('Missing backend URL environment variable. Set VITE_BACKEND_URL in your .env file.');
}

// Appwrite Configuration
(window as any).appwriteConfig = {
  endpoint: appwriteEndpoint,
  projectId: appwriteProjectId,
  databaseId: appwriteDatabaseId,
  usersCollectionId: appwriteUsersCollectionId
};

// Server Configuration
(window as any).serverConfig = {
  url: backendUrl
};
