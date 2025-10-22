// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    showSuccess(message: string): void {
        // Implementar con tu librería de notificaciones (Toastr, Snackbar, etc.)
        console.log('✅ Success:', message);
        alert(`✅ ${message}`); // Temporal - reemplazar con tu implementación
    }

    showError(message: string): void {
        console.error('❌ Error:', message);
        alert(`❌ ${message}`); // Temporal - reemplazar con tu implementación
    }

    showWarning(message: string): void {
        console.warn('⚠️ Warning:', message);
        alert(`⚠️ ${message}`); // Temporal - reemplazar con tu implementación
    }

    showInfo(message: string): void {
        console.log('ℹ️ Info:', message);
        alert(`ℹ️ ${message}`); // Temporal - reemplazar con tu implementación
    }
}