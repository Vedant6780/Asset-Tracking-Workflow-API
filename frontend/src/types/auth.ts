/**
 * Authentication type definitions for Workflow Asset Tracker.
 *
 * Contains all request/response type definitions for auth endpoints.
 */

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    role: string;
}

export interface UserResponse {
    id: number;
    username: string;
    role: string;
    created_at: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
    role: string;
    username: string;
}

export interface RegisterResponse {
    message: string;
    access_token: string;
    token_type: string;
    role: string;
    username: string;
    user: UserResponse;
}