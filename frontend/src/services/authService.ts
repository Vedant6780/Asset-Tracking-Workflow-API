/**
 * Authentication service - handles all auth-related API calls.
 *
 * Provides functions for:
 * - User registration
 * - User login
 * - Fetching current user profile
 * - Logout (client-side)
 * - Role-based access checking
 */

import { api } from './apiClient';
import type {
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserResponse
} from '../types/auth';

// Register a new user
export const register = async (
    data: RegisterRequest
): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
};

// Login user
export const login = async (
    data: LoginRequest
): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/login', data);
    return response.data;
};

// Get current user profile
export const getCurrentUser = async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/auth/me');
    return response.data;
};

// Logout - client-side token clearing
export const logout = (): void => {
    // Token is cleared by apiClient interceptor on 401
    // We also clear localStorage here for consistency
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
};

// Check if user has required role
export const hasRole = (requiredRole: string): boolean => {
    const userRole = localStorage.getItem('role');
    if (!userRole) return false;

    // Manager/Admin equivalence check (backend treats both as admin)
    if (requiredRole === 'admin' || requiredRole === 'manager') {
        return userRole === 'admin' || userRole === 'manager';
    }
    return userRole === requiredRole;
};

// Check if user is operator
export const isOperator = (): boolean => {
    return localStorage.getItem('role') === 'operator';
};

// Check if user is manager/admin
export const isManager = (): boolean => {
    const role = localStorage.getItem('role');
    return role === 'admin' || role === 'manager';
};

// Get user permissions
export const getPermissions = (): string[] => {
    const role = localStorage.getItem('role');
    switch (role) {
        case 'operator':
            return [
                'asset:lookup',
                'asset:update_status',
                'auth:read_own_profile'
            ];
        case 'manager':
        case 'admin':
            return [
                'asset:list',
                'asset:create',
                'asset:read',
                'asset:update_status',
                'asset:delete',
                'audit:read',
                'auth:read_own_profile',
                'user:read'
            ];
        default:
            return [];
    }
};