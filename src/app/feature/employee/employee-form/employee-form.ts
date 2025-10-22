// src/app/feature/employee/employee-form/employee-form.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee, EmployeeRequest } from '../../../core/interfaces/employee';

@Component({
    selector: 'app-employee-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSnackBarModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatDividerModule
    ],
    templateUrl: './employee-form.html',
    styleUrls: ['./employee-form.scss']
})
export class EmployeeForm implements OnInit {
    private fb = inject(FormBuilder);
    private employeeService = inject(EmployeeService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private snackBar = inject(MatSnackBar);

    employeeForm!: FormGroup;
    isEditMode = signal(false);
    isLoading = signal(false);
    isSubmitting = signal(false);
    employeeId = signal<number | null>(null);

    // Opciones para los selects
    documentTypes = [
        { value: 'DNI', label: 'DNI' },
        { value: 'CE', label: 'Carnet de Extranjería' },
        { value: 'RUC', label: 'RUC' }
    ];

    genderOptions = [
        { value: 'M', label: 'Masculino' },
        { value: 'F', label: 'Femenino' },
        { value: 'O', label: 'Otro' }
    ];

    positionOptions = [
        { value: 'GERENTE', label: 'Gerente' },
        { value: 'SUPERVISOR', label: 'Supervisor' },
        { value: 'PANADERO', label: 'Panadero' },
        { value: 'CAJERO', label: 'Cajero' },
        { value: 'REPARTIDOR', label: 'Repartidor' },
        { value: 'AYUDANTE', label: 'Ayudante' },
        { value: 'ADMINISTRATIVO', label: 'Administrativo' }
    ];

    roleOptions = [
        { value: 1, label: 'Desarrollador' },
        { value: 2, label: 'Super Admin' },
        { value: 3, label: 'Administrador' },
        { value: 4, label: 'Cajero' },
        { value: 5, label: 'Panadero' },
        { value: 6, label: 'Inventario' },
        { value: 7, label: 'Empleado' }
    ];

    ngOnInit(): void {
        this.initForm();
        this.checkEditMode();
    }

    private initForm(): void {
        this.employeeForm = this.fb.group({
            // Información Personal
            firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
            lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
            documentType: ['DNI', Validators.required],
            documentNumber: ['', [Validators.required, Validators.pattern('^[0-9]{8,11}$')]],
            birthDate: [''],
            gender: ['M'],

            // Información de Contacto
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.pattern('^[0-9]{9}$')]],
            address: ['', [Validators.maxLength(200)]],

            // Información Laboral
            position: ['PANADERO', Validators.required],
            idRole: [7, Validators.required],
            hireDate: [new Date(), Validators.required],

            // Contacto de Emergencia
            emergencyContactName: [''],
            emergencyContactPhone: ['']
        });
    }

    private checkEditMode(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id && !isNaN(+id)) {
            this.isEditMode.set(true);
            this.employeeId.set(+id);
            this.loadEmployeeData(+id);
        }
    }

    private loadEmployeeData(id: number): void {
        this.isLoading.set(true);
        this.employeeService.getEmployeeById(id).subscribe({
            next: (employee) => {
                this.employeeForm.patchValue({
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    documentType: employee.documentType,
                    documentNumber: employee.documentNumber,
                    email: employee.email,
                    phone: employee.phone || '',
                    address: employee.address || '',
                    idRole: employee.idRole || 7,
                    hireDate: employee.hireDate ? new Date(employee.hireDate) : new Date(),
                    birthDate: employee.birthDate ? new Date(employee.birthDate) : '',
                    gender: employee.gender || 'M',
                    position: employee.position || 'PANADERO',
                    emergencyContactName: employee.emergencyContactName || '',
                    emergencyContactPhone: employee.emergencyContactPhone || ''
                });
                this.isLoading.set(false);
            },
            error: (error) => {
                console.error('Error loading employee:', error);
                this.showError('Error al cargar los datos del empleado');
                this.isLoading.set(false);
            }
        });
    }

    onSubmit(): void {
        if (this.employeeForm.valid) {
            this.isSubmitting.set(true);

            const formData = this.employeeForm.value;
            const employeeRequest: EmployeeRequest = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                documentType: formData.documentType,
                documentNumber: formData.documentNumber,
                email: formData.email.trim(),
                phone: formData.phone || undefined,
                address: formData.address || undefined,
                idRole: formData.idRole,
                hireDate: this.formatDate(formData.hireDate),
                birthDate: formData.birthDate ? this.formatDate(formData.birthDate) : undefined,
                gender: formData.gender,
                position: formData.position,
                emergencyContactName: formData.emergencyContactName || undefined,
                emergencyContactPhone: formData.emergencyContactPhone || undefined
            };

            if (this.isEditMode() && this.employeeId()) {
                this.updateEmployee(employeeRequest);
            } else {
                this.createEmployee(employeeRequest);
            }
        } else {
            this.markFormGroupTouched();
            this.showError('Por favor complete todos los campos requeridos correctamente');
        }
    }

    private createEmployee(employeeRequest: EmployeeRequest): void {
        this.employeeService.createEmployee(employeeRequest).subscribe({
            next: (employee) => {
                this.showSuccess('Empleado creado exitosamente');
                this.router.navigate(['/employees']);
            },
            error: (error) => {
                console.error('Error creating employee:', error);
                this.handleError(error, 'crear');
                this.isSubmitting.set(false);
            }
        });
    }

    private updateEmployee(employeeRequest: EmployeeRequest): void {
        if (!this.employeeId()) return;

        this.employeeService.updateEmployee(this.employeeId()!, employeeRequest).subscribe({
            next: (employee) => {
                this.showSuccess('Empleado actualizado exitosamente');
                this.router.navigate(['/employees']);
            },
            error: (error) => {
                console.error('Error updating employee:', error);
                this.handleError(error, 'actualizar');
                this.isSubmitting.set(false);
            }
        });
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    private handleError(error: any, action: string): void {
        let errorMessage = `Error al ${action} el empleado`;

        if (error.error) {
            if (typeof error.error === 'string') {
                errorMessage = error.error;
            } else if (error.error.message) {
                errorMessage = error.error.message;
            }
        }

        this.showError(errorMessage);
    }

    private markFormGroupTouched(): void {
        Object.keys(this.employeeForm.controls).forEach(key => {
            const control = this.employeeForm.get(key);
            control?.markAsTouched();
        });
    }

    onCancel(): void {
        if (this.employeeForm.dirty) {
            if (confirm('¿Está seguro de que desea cancelar? Se perderán los cambios no guardados.')) {
                this.router.navigate(['/employees']);
            }
        } else {
            this.router.navigate(['/employees']);
        }
    }

    private showSuccess(message: string): void {
        this.snackBar.open(message, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
        });
    }

    private showError(message: string): void {
        this.snackBar.open(message, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
        });
    }

    // Getters para acceder fácilmente a los controles del formulario
    get firstName() { return this.employeeForm.get('firstName'); }
    get lastName() { return this.employeeForm.get('lastName'); }
    get documentNumber() { return this.employeeForm.get('documentNumber'); }
    get email() { return this.employeeForm.get('email'); }
    get phone() { return this.employeeForm.get('phone'); }
    get address() { return this.employeeForm.get('address'); }
    get position() { return this.employeeForm.get('position'); }
    get hireDate() { return this.employeeForm.get('hireDate'); }
    get birthDate() { return this.employeeForm.get('birthDate'); }
    get gender() { return this.employeeForm.get('gender'); }
    get idRole() { return this.employeeForm.get('idRole'); }
    get emergencyContactName() { return this.employeeForm.get('emergencyContactName'); }
    get emergencyContactPhone() { return this.employeeForm.get('emergencyContactPhone'); }
}