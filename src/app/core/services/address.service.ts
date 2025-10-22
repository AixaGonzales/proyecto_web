// src/app/services/address.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Address } from '../interfaces/customer'; // Ajusta la ruta según tu estructura

@Injectable({
    providedIn: 'root'
})
export class AddressService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiBaseUrl}${environment.endpoints.address}`;

    // Obtener todas las direcciones
    getAllAddresses(): Observable<Address[]> {
        return this.http.get<Address[]>(this.apiUrl).pipe(
            catchError(this.handleError)
        );
    }

    // Obtener dirección por ID
    getAddressById(id: number): Observable<Address> {
        return this.http.get<Address>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    // Crear nueva dirección
    createAddress(address: Address): Observable<Address> {
        return this.http.post<Address>(`${this.apiUrl}/save`, address).pipe(
            catchError(this.handleError)
        );
    }

    // Actualizar dirección
    updateAddress(address: Address): Observable<Address> {
        return this.http.put<Address>(`${this.apiUrl}/update`, address).pipe(
            catchError(this.handleError)
        );
    }

    // Eliminar dirección
    deleteAddress(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/delete/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    // Manejo de errores
    private handleError(error: HttpErrorResponse) {
        console.error('Error en la solicitud HTTP:', error);

        let errorMessage = 'Error desconocido';

        if (error.status === 401) {
            errorMessage = 'Error 401: No autorizado. Verifica tus credenciales';
        } else if (error.status === 403) {
            errorMessage = 'Error 403: Prohibido. No tienes permisos para este recurso';
        } else if (error.status === 404) {
            errorMessage = 'Error 404: Recurso no encontrado';
        } else if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else {
            errorMessage = `Error ${error.status}: ${error.message}`;
        }

        return throwError(() => new Error(errorMessage));
    }
}