// src/app/feature/employee/employee-details/employee-details.ts
import { Component, Inject, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { EmployeeWithRole } from '../../../core/interfaces/employee';

@Component({
    selector: 'app-employee-details',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatDividerModule,
        MatChipsModule,
        DatePipe
    ],
    templateUrl: './employee-details.html',
    styleUrls: ['./employee-details.scss']
})
export class EmployeeDetails {
    private dialogRef = inject(MatDialogRef<EmployeeDetails>);

    constructor(
        @Inject(MAT_DIALOG_DATA) public employee: EmployeeWithRole
    ) { }

    getRoleDisplay(role: string): string {
        const roleMap: { [key: string]: string } = {
            'DEVELOPER': 'Desarrollador',
            'SUPERADMIN': 'Super Admin',
            'ADMINISTRATOR': 'Administrador',
            'ADMINISTRADOR': 'Administrador',
            'CASHIER': 'Cajero',
            'CAJERO': 'Cajero',
            'BAKER': 'Panadero',
            'PANADERO': 'Panadero',
            'INVENTORY': 'Inventario',
            'INVENTARIO': 'Inventario',
            'EMPLOYEE': 'Empleado',
            'COLABORADOR': 'Colaborador',
            'SUPPLIER': 'Proveedor',
            'PROVEEDOR': 'Proveedor',
            'CLIENT': 'Cliente'
        };

        return roleMap[role] || role;
    }

    getRoleColor(role: string): string {
        const colorMap: { [key: string]: string } = {
            'DEVELOPER': 'role-developer',
            'SUPERADMIN': 'role-superadmin',
            'ADMINISTRATOR': 'role-administrador',
            'ADMINISTRADOR': 'role-administrador',
            'CASHIER': 'role-cajero',
            'CAJERO': 'role-cajero',
            'BAKER': 'role-panadero',
            'PANADERO': 'role-panadero',
            'INVENTORY': 'role-inventario',
            'INVENTARIO': 'role-inventario',
            'EMPLOYEE': 'role-colaborador',
            'COLABORADOR': 'role-colaborador',
            'SUPPLIER': 'role-proveedor',
            'PROVEEDOR': 'role-proveedor'
        };

        return colorMap[role] || 'role-default';
    }

    getStatusText(status: string = 'A'): string {
        return status === 'A' ? 'Activo' : 'Inactivo';
    }

    getStatusBadgeClass(status: string = 'A'): string {
        return status === 'A' ? 'badge-active' : 'badge-inactive';
    }

    getGenderDisplay(gender?: string): string {
        if (!gender) return 'No especificado';
        const genderMap: { [key: string]: string } = {
            'M': 'Masculino',
            'F': 'Femenino',
            'O': 'Otro'
        };
        return genderMap[gender] || gender;
    }

    getPositionDisplay(position?: string): string {
        if (!position) return 'No especificado';
        const positionMap: { [key: string]: string } = {
            'GERENTE': 'Gerente',
            'SUPERVISOR': 'Supervisor',
            'ASISTENTE': 'Asistente',
            'OPERARIO': 'Operario'
        };
        return positionMap[position] || position;
    }

    close(): void {
        this.dialogRef.close();
    }
}