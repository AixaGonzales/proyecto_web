// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();

    console.log('🔄 Interceptor ejecutado para:', req.url);
    console.log('🔑 Token disponible:', token ? 'SÍ' : 'NO');

    // ✅ SOLUCIÓN DEFINITIVA: NO interferir con el login
    if (req.url.includes('/auth/login')) {
        console.log('🚫 Request de login - interceptor no interviene');
        return next(req);
    }

    let clonedReq = req;

    // Solo agregar token si existe y no es login
    if (token && req.url.includes('localhost:8085')) {
        clonedReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('✅ Token agregado a la request');
    }

    return next(clonedReq).pipe(
        catchError((error) => {
            console.log('❌ Error en la request:', error.status);
            if (error.status === 401) {
                console.log('🔐 Token expirado o inválido - Redirigiendo al login');
                authService.logout();
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};