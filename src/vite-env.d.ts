/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string;
  readonly VITE_APPWRITE_PROJECT_ID: string;
  readonly VITE_APPWRITE_DATABASE_ID: string;
  readonly VITE_APPWRITE_USERS_COLLECTION_ID: string;
  readonly VITE_APPWRITE_GROUPS_COLLECTION_ID: string;
  readonly VITE_APPWRITE_GROUPSCORES_COLLECTION_ID: string;
  readonly VITE_BACKEND_URL: string;
  readonly VITE_BACKEND_SOCKET_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
