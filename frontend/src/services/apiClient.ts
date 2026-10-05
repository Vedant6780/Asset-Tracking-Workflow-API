/**
 * Centralized API client with request/response interceptors.
 *
 * Provides:
 * - Automatic JWT token injection
 * - 401 handling with auto-logout
 * - Consistent error handling
 * - Request/response logging in development
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import env from '../config/env';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: env.API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token management
let authToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null): void => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token!);
        }
    });
    failedQueue = [];
};

export const setAuthToken = (token: string | null): void => {
    authToken = token;
};

export const getAuthToken = (): string | null => authToken;

// Request interceptor - inject auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        // Skip auth for login/register endpoints
        const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');

        if (authToken && !isAuthEndpoint) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }

        // Add request ID for tracing in development
        if (env.IS_DEVELOPMENT) {
            config.headers['X-Request-ID'] = crypto.randomUUID().slice(0, 8);
        }

        return config;
    },
    (error: Error) => {
        if (env.IS_DEVELOPMENT) {
            console.error('[API Request Error]', error);
        }
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401 and errors
apiClient.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
        if (env.IS_DEVELOPMENT) {
            console.log(`[API ${response.config.method?.toUpperCase()}] ${response.config.url} - ${response.status}`);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Skip if it's an auth endpoint
            if (originalRequest.url?.includes('/auth/')) {
                clearAuth();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Wait for token refresh
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to refresh token using current token
                // Note: Backend doesn't have refresh endpoint, so we just logout
                clearAuth();
                window.location.href = '/login';
                return Promise.reject(error);
            } catch (refreshError) {
                clearAuth();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
                processQueue(new Error('Token refresh failed'), null);
            }
        }

        // Transform error response
        if (error.response) {
            const { status, data } = error.response;
            const message = data?.detail || data?.message || error.message;

            // Create a standardized error
            const apiError = new Error(message) as ApiError;
            apiError.status = status;
            apiError.data = data;
            apiError.isApiError = true;

            if (env.IS_DEVELOPMENT) {
                console.error(`[API Error ${status}]`, message);
            }

            return Promise.reject(apiError);
        }

        // Network or other errors
        const networkError = new Error(error.message || 'Network error') as ApiError;
        networkError.status = 0;
        networkError.isApiError = true;
        networkError.isNetworkError = true;

        if (env.IS_DEVELOPMENT) {
            console.error('[API Network Error]', networkError.message);
        }

        return Promise.reject(networkError);
    }
);

function clearAuth(): void {
    authToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
}

// Type definitions
export interface ApiError extends Error {
    status?: number;
    data?: unknown;
    isApiError?: boolean;
    isNetworkError?: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

// Helper functions
export const api = {
    get: <T>(url: string, config?: AxiosRequestConfig) => apiClient.get<T>(url, config),
    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiClient.post<T>(url, data, config),
    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiClient.put<T>(url, data, config),
    patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiClient.patch<T>(url, data, config),
    delete: <T>(url: string, config?: AxiosRequestConfig) => apiClient.delete<T>(url, config),
};

export default apiClient;