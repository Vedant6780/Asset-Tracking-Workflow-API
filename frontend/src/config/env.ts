/**
 * Environment configuration for Workflow Asset Tracker.
 * 
 * This file centralizes all environment variables and configuration options.
 */

const env = {
    // API Configuration
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    API_VERSION: import.meta.env.VITE_API_VERSION || '/api/v1',
    WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL,

    // JWT Configuration
    JWT_EXPIRY_MINUTES: parseInt(import.meta.env.VITE_JWT_EXPIRY_MINUTES || '480'),

    // App Configuration
    APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'FleetTrack OS',

    // Feature Flags
    ENABLE_WEB_SOCKET: import.meta.env.VITE_ENABLE_WEB_SOCKET !== 'false',

    // Development
    IS_DEVELOPMENT: import.meta.env.MODE === 'development',
    IS_PRODUCTION: import.meta.env.MODE === 'production',
};

export default env;

// Helper functions for URL construction
export const getApiUrl = (endpoint: string): string => {
    const base = env.API_BASE_URL.replace(/\/+$/, '');
    const apiVersion = env.API_VERSION.startsWith('/') ? env.API_VERSION : `/${env.API_VERSION}`;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${apiVersion}${path}`;
};

export const getWsUrl = (endpoint: string = ''): string => {
    if (env.WS_BASE_URL) {
        return `${env.WS_BASE_URL}${endpoint}`;
    }

    const protocol = env.API_BASE_URL.startsWith('https') ? 'wss:' : 'ws:';
    const host = env.API_BASE_URL.replace(/^https?:\/\//, '');
    return `${protocol}//${host}${endpoint}`;
};

// Asset status options from backend
export const ASSET_STATUSES = [
    'Registered',
    'In Warehouse',
    'In Transit',
    'Delivered',
    'Under Maintenance',
    'Decommissioned',
    'Damaged',
] as const;

export type AssetStatus = typeof ASSET_STATUSES[number];