// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const expectedRoles = route.data['expectedRoles'] as string[];

    if (!expectedRoles || expectedRoles.length === 0) {
        return true;
    }

    // Usar la propiedad userRoles del AuthService con signals
    const userRoles = authService.userRoles();
    const hasRequiredRole = expectedRoles.some(role =>
        userRoles.includes(role)
    );

    if (hasRequiredRole) {
        return true;
    }

    router.navigate(['/unauthorized']);
    return false;
};