/**
 * Global authentication context for Workflow Asset Tracker.
 *
 * This file provides:
 * - Global auth state management (user, token, role)
 * - Login/register/logout handlers
 * - Protected route components
 * - Session persistence
 * - Role-based access control
 *
 * Exporting:
 * - AuthContext - React context
 * - AuthProvider - Component wrapper
 * - useAuth - Custom hook for auth operations
 * - ProtectedRoute - Higher-order component
 * - RequireAuth - HOC with role checking
 * - usePermissions - Hook for permission checking
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import apiClient, { setAuthToken } from '../services/apiClient';
import type { RegisterResponse } from '../types/auth';

// Types
export interface User {
    id: number;
    username: string;
    role: 'operator' | 'manager' | 'admin';
    created_at: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
    role: string;
    username: string;
}

export interface AuthContextType {
    // State
    user: User | null;
    token: string | null;
    role: string | null;
    username: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, role: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;

    // Authorization
    hasRole: (role: 'operator' | 'manager' | 'admin') => boolean;
    isOperator: () => boolean;
    isManager: () => boolean;
    canAccess: (permission: string) => boolean;

    // Utilities
    getPermissions: () => string[];
    restoreSession: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                const storedRole = localStorage.getItem('role');
                const storedUsername = localStorage.getItem('username');

                if (storedToken && storedRole) {
                    // Set token in API client
                    setAuthToken(storedToken);

                    // Set local state
                    setToken(storedToken);
                    setRole(storedRole);
                    setUsername(storedUsername);

                    // Fetch current user details
                    try {
                        const response = await apiClient.get('/auth/me');
                        setUser(response.data);
                    } catch (error) {
                        // If token is invalid, clear everything
                        console.error('Token validation failed:', error);
                        clearAuthState();
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                clearAuthState();
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Clear auth state
    const clearAuthState = useCallback(() => {
        setAuthToken(null);
        setToken(null);
        setRole(null);
        setUsername(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
    }, []);

    // Login function
    const login = useCallback(async (username: string, password: string) => {
        try {
            const response = await apiClient.post<TokenResponse>('/auth/login', {
                username: username.trim(),
                password
            });

            const { access_token, role, username: responseUsername } = response.data;

            // Update state and storage
            setToken(access_token);
            setRole(role);
            setUsername(responseUsername);
            setAuthToken(access_token);

            localStorage.setItem('token', access_token);
            localStorage.setItem('role', role);
            localStorage.setItem('username', responseUsername);

            // Fetch user details
            const userResponse = await apiClient.get<User>('/auth/me');
            setUser(userResponse.data);

        } catch (error: any) {
            clearAuthState();
            throw new Error(error.response?.data?.detail || 'Login failed');
        }
    }, [clearAuthState]);

    // Register function
    const register = useCallback(async (
        username: string,
        password: string,
        role: string
    ) => {
        try {
            const response = await apiClient.post<RegisterResponse>('/auth/register', {
                username: username.trim(),
                password,
                role
            });

            const { access_token, role: userRole, username: responseUsername } = response.data;

            // Update state and storage
            setToken(access_token);
            setRole(userRole);
            setUsername(responseUsername);
            setAuthToken(access_token);

            localStorage.setItem('token', access_token);
            localStorage.setItem('role', userRole);
            localStorage.setItem('username', responseUsername);

            // Fetch user details
            const userResponse = await apiClient.get<User>('/auth/me');
            setUser(userResponse.data);

        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Registration failed');
        }
    }, []);

    // Logout function
    const logout = useCallback(() => {
        clearAuthState();
    }, [clearAuthState]);

    // Refresh user data
    const refreshUser = useCallback(async () => {
        try {
            const response = await apiClient.get<User>('/auth/me');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    }, []);

    // Authorization helpers
    const hasRole = useCallback((requiredRole: 'operator' | 'manager' | 'admin'): boolean => {
        if (!role) return false;

        // Normalize role: manager/admin are equivalent
        if (requiredRole === 'admin' || requiredRole === 'manager') {
            return role === 'admin' || role === 'manager';
        }

        return role === requiredRole;
    }, [role]);

    const isOperator = useCallback(() => role === 'operator', [role]);
    const isManager = useCallback(() => role === 'admin' || role === 'manager', [role]);

    // Permission checking
    const getPermissions = useCallback((): string[] => {
        if (!role) return [];

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
    }, [role]);

    const canAccess = useCallback((permission: string): boolean => {
        const permissions = getPermissions();
        return permissions.includes(permission);
    }, [getPermissions]);

    // Restore session from storage
    const restoreSession = useCallback(() => {
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');
        const storedUsername = localStorage.getItem('username');

        if (storedToken && storedRole) {
            setAuthToken(storedToken);
            setToken(storedToken);
            setRole(storedRole);
            setUsername(storedUsername);
        }
    }, []);

    const contextValue: AuthContextType = {
        // State
        user,
        token,
        role,
        username,
        isAuthenticated: !!token,
        isLoading,

        // Actions
        login,
        register,
        logout,
        refreshUser,

        // Authorization
        hasRole,
        isOperator,
        isManager,
        canAccess,

        // Utilities
        getPermissions,
        restoreSession
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

// Protected route component
export const ProtectedRoute = ({
    children,
    requiredRole
}: {
    children: ReactNode;
    requiredRole?: 'operator' | 'manager' | 'admin';
}) => {
    const { isAuthenticated, isLoading, hasRole } = useAuth();

    if (isLoading) {
        return <div className="loading-container">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && !hasRole(requiredRole)) {
        // Redirect to appropriate dashboard based on role
        if (hasRole('operator')) {
            return <Navigate to="/operator" replace />;
        } else {
            return <Navigate to="/manager" replace />;
        }
    }

    return children;
};

// Require auth HOC
export const RequireAuth = (Component: React.ComponentType) => {
    return (props: any) => {
        const { isAuthenticated, isLoading } = useAuth();

        if (isLoading) {
            return <div className="loading-container">Loading...</div>;
        }

        if (!isAuthenticated) {
            return <Navigate to="/login" replace />;
        }

        return <Component {...props} />;
    };
};

export default AuthContext;