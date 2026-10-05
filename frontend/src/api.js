/**
 * Centralized API helpers — fetch wrapper and WebSocket factory.
 */

export const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/**
 * Make an authenticated fetch request.
 */
export async function authFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    // Check if this is an authentication route (login, register)
    const isAuthRoute = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');

    if (response.status === 401 && !isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        window.location.href = '/';
        throw new Error('Session expired. Please sign in again.');
    }

    return response;
}

/**
 * Create a WebSocket connection for the live dashboard.
 */
export function createDashboardSocket(onMessage, onOpen, onClose) {
    const token = localStorage.getItem('token');
    
    let wsUrl = import.meta.env.VITE_WS_URL;
    if (!wsUrl) {
        const wsHost = API_BASE.replace(/^https?:\/\//, '');
        const wsProtocol = API_BASE.startsWith('https') ? 'wss:' : 'ws:';
        wsUrl = `${wsProtocol}//${wsHost}/api/v1/ws/dashboard`;
    }

    const ws = new WebSocket(`${wsUrl}?token=${token}`);

    ws.onopen = () => {
        console.log('🟢 WebSocket connected');
        onOpen?.();

        // Heartbeat every 30s
        const heartbeat = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send('ping');
            } else {
                clearInterval(heartbeat);
            }
        }, 30000);
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            onMessage?.(data);
        } catch (e) {
            // Heartbeat pong — ignore
        }
    };

    ws.onclose = () => {
        console.log('🔴 WebSocket disconnected');
        onClose?.();
    };

    ws.onerror = (err) => {
        console.error('WebSocket error:', err);
    };

    return ws;
}
