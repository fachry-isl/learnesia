/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_PUBLIC_URL: string;
  readonly VITE_API_PRIVATE_URL: string;
  readonly VITE_ADMIN_PATH: string;
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
