/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_API_VERSION: string;
    readonly VITE_WS_URL: string;
    readonly VITE_WS_BASE_URL: string;
    readonly VITE_JWT_EXPIRY_MINUTES: string;
    readonly VITE_APP_ENV: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_ENABLE_WEB_SOCKET: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
    readonly MODE: string;
}