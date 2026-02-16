// Appwrite Configuration
(window as any).appwriteConfig = {
  endpoint: '',
  projectId: '',
  databaseId: '',  // Update this after creating the database
  usersCollectionId: ''  // Update this after creating the collection
};

// Server Configuration
(window as any).serverConfig = {
  url: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
};
