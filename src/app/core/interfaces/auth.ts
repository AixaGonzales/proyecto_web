// src/app/core/interfaces/auth.ts
export interface LoginRequest {
    username: string;    // Para el frontend usamos 'email' pero puede ser username o email
    password: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    tokenType: string;
    email: string;    // Respuesta del backend
    username: string; // Respuesta del backend  
    roles: string[];
    timestamp: string;
    message?: string;
}

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    message: string;
    username: string;
    roles: string[];
}

export interface ErrorResponse {
    error: string;
    message: string;
    success: boolean;
    timestamp: string;
}

export interface MessageResponse {
    message: string;
}