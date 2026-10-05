/**
 * AuthContext — React context for authentication state.
 * Stores token, role, and username in localStorage and provides
 * login/register/logout functions with protected route logic.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { authFetch } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [role, setRole] = useState(() => localStorage.getItem('role'));
    const [username, setUsername] = useState(() => localStorage.getItem('username'));

    const login = useCallback(async (usernameInput, password) => {
        const res = await authFetch('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: usernameInput.trim(), password }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Invalid username or password');
        }

        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', data.username);
        setToken(data.access_token);
        setRole(data.role);
        setUsername(data.username);

        return data;
    }, []);

    const register = useCallback(async (usernameInput, password, roleInput) => {
        const res = await authFetch('/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username: usernameInput.trim(),
                password,
                role: roleInput,
            }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Failed to create account');
        }

        const data = await res.json();
        if (data.access_token) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('username', data.username);
            setToken(data.access_token);
            setRole(data.role);
            setUsername(data.username);
        }

        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        setToken(null);
        setRole(null);
        setUsername(null);
    }, []);

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ token, role, username, isAuthenticated, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export default AuthContext;
