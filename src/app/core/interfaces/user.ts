// src/app/core/interfaces/user.ts
export interface User {
    id: number;
    username: string;  // ← Solo este campo para mostrar
    roles: string[];
    token: string;
    status?: string;
    creationDate?: string;
    // ✅ Correcto: sin email
}