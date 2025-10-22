// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    console.log('🔄 Interceptor ejecutado para:', req.url);
    console.log('🔑 Token disponible:', token ? 'SÍ' : 'NO');

    // Agregar token a todas las requests al backend
    if (token && isBackendRequest(req.url)) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('✅ Token agregado a la request');
        return next(authReq);
    }

    return next(req);
};

/**
 * Verifica si la request es para el backend
 */
function isBackendRequest(url: string): boolean {
    return url.includes('localhost:8085') ||
        url.includes('/api/') ||
        url.includes('/auth/');
}