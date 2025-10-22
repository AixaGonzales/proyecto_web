// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const notificationService = inject(NotificationService);
    const authService = inject(AuthService);
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'Ha ocurrido un error inesperado';

            if (error.error instanceof ErrorEvent) {
                // Error del lado del cliente
                errorMessage = `Error: ${error.error.message}`;
            } else {
                // Error del lado del servidor
                switch (error.status) {
                    case 0:
                        errorMessage = 'Error de conexión - Verifique su internet';
                        break;
                    case 400:
                        errorMessage = error.error?.message || 'Solicitud incorrecta';
                        break;
                    case 401:
                        errorMessage = 'Sesión expirada - Por favor inicie sesión nuevamente';
                        authService.logout();
                        router.navigate(['/login']);
                        break;
                    case 403:
                        errorMessage = 'No tiene permisos para realizar esta acción';
                        break;
                    case 404:
                        errorMessage = 'Recurso no encontrado';
                        break;
                    case 409:
                        errorMessage = error.error?.message || 'Conflicto - El recurso ya existe';
                        break;
                    case 500:
                        errorMessage = 'Error interno del servidor';
                        break;
                    default:
                        errorMessage = `Error ${error.status}: ${error.message}`;
                }
            }

            // Mostrar notificación solo para errores que no sean de autenticación
            if (error.status !== 401) {
                notificationService.showError(errorMessage);
            }

            return throwError(() => error);
        })
    );
};