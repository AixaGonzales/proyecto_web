// src/app/feature/employee/employee-edit/employee-edit.ts
import { Component, OnInit, inject } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/interfaces/employee';

@Component({
    selector: 'app-employee-edit',
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
        MatProgressSpinnerModule,
        MatIconModule
    ],
    templateUrl: './employee-edit.html',
    styleUrls: ['./employee-edit.scss']
})
export class EmployeeEdit implements OnInit {
    private fb = inject(FormBuilder);
    private employeeService = inject(EmployeeService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private snackBar = inject(MatSnackBar);

    employeeForm!: FormGroup;
    employeeId!: number;
    isLoading = true;
    isSubmitting = false;

    documentTypes = ['DNI', 'CE', 'RUC'];
    positions = ['PANADERO', 'CAJERO', 'SUPERVISOR', 'GERENTE', 'REPARTIDOR', 'COLABORADOR'];
    generos = ['MASCULINO', 'FEMENINO', 'OTRO'];

    ngOnInit(): void {
        console.log('🎯 EmployeeEdit Component: Inicializando');
        this.initForm();
        this.loadEmployeeData();
    }

    initForm(): void {
        this.employeeForm = this.fb.group({
            firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            documentType: ['DNI', Validators.required],
            documentNumber: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
            email: ['', [Validators.email]],
            phone: ['', [Validators.pattern('^[0-9+\\-\\s()]*$')]],
            address: ['', [Validators.maxLength(200)]],
            position: ['', Validators.required],
            hireDate: ['', Validators.required],
            status: ['A', Validators.required],
            fechaNacimiento: [''],
            genero: ['']
        });
    }

    loadEmployeeData(): void {
        this.employeeId = Number(this.route.snapshot.params['id']);

        if (this.employeeId) {
            console.log('🔍 Cargando empleado con ID:', this.employeeId);
            this.employeeService.getEmployeeById(this.employeeId).subscribe({
                next: (employee: Employee) => {
                    console.log('✅ Empleado cargado:', employee);
                    this.patchFormWithEmployeeData(employee);
                    this.isLoading = false;
                },
                error: (error: any) => {
                    console.error('❌ Error cargando empleado', error);
                    this.snackBar.open('Error al cargar el empleado', 'Cerrar', {
                        duration: 3000,
                        panelClass: ['error-snackbar']
                    });
                    this.isLoading = false;
                    this.router.navigate(['/employees']);
                }
            });
        } else {
            console.error('❌ ID de empleado no válido');
            this.snackBar.open('ID de empleado no válido', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/employees']);
        }
    }

    private patchFormWithEmployeeData(employee: Employee): void {
        const hireDate = employee.hireDate ? new Date(employee.hireDate) : new Date();
        const fechaNacimiento = employee.fechaNacimiento ? new Date(employee.fechaNacimiento) : '';

        this.employeeForm.patchValue({
            firstName: employee.firstName || '',
            lastName: employee.lastName || '',
            documentType: employee.documentType || 'DNI',
            documentNumber: employee.documentNumber || '',
            email: employee.email || '',
            phone: employee.phone || '',
            address: employee.address || '',
            position: employee.position || '',
            hireDate: hireDate,
            status: employee.status || 'A',
            fechaNacimiento: fechaNacimiento,
            genero: employee.genero || ''
        });

        console.log('📝 Formulario actualizado con datos del empleado');
    }

    onSubmit(): void {
        if (this.employeeForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;
            console.log('📤 Enviando formulario de edición');

            const formData = this.employeeForm.value;

            const employeeData: Employee = {
                idEmployee: this.employeeId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                documentType: formData.documentType,
                documentNumber: formData.documentNumber,
                email: formData.email,
                phone: formData.phone || undefined,
                address: formData.address || undefined,
                position: formData.position,
                hireDate: this.formatDateForBackend(formData.hireDate),
                status: formData.status,
                fechaNacimiento: formData.fechaNacimiento ? this.formatDateForBackend(formData.fechaNacimiento) : undefined,
                genero: formData.genero || undefined
            };

            console.log('📦 Datos a enviar:', employeeData);

            this.employeeService.updateEmployee(this.employeeId, employeeData).subscribe({
                next: (updatedEmployee: Employee) => {
                    console.log('✅ Empleado actualizado exitosamente:', updatedEmployee);
                    this.snackBar.open('Empleado actualizado exitosamente', 'Cerrar', {
                        duration: 3000,
                        panelClass: ['success-snackbar']
                    });
                    this.router.navigate(['/employees']);
                },
                error: (error: any) => {
                    console.error('❌ Error actualizando empleado:', error);
                    let errorMessage = 'Error al actualizar el empleado';

                    if (error.error && typeof error.error === 'string') {
                        errorMessage = error.error;
                    } else if (error.error && error.error.message) {
                        errorMessage = error.error.message;
                    } else if (error.message) {
                        errorMessage = error.message;
                    }

                    this.snackBar.open(errorMessage, 'Cerrar', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    });
                    this.isSubmitting = false;
                },
                complete: () => {
                    this.isSubmitting = false;
                }
            });
        } else {
            this.markFormGroupTouched();
            this.snackBar.open('Por favor complete todos los campos requeridos correctamente', 'Cerrar', {
                duration: 3000,
                panelClass: ['warning-snackbar']
            });
        }
    }

    onCancel(): void {
        if (this.employeeForm.dirty) {
            const confirm = window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres cancelar?');
            if (confirm) {
                this.router.navigate(['/employees']);
            }
        } else {
            this.router.navigate(['/employees']);
        }
    }

    private formatDateForBackend(date: Date): string {
        if (!date) return '';

        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);

        return `${year}-${month}-${day}`;
    }

    private markFormGroupTouched(): void {
        Object.keys(this.employeeForm.controls).forEach(key => {
            const control = this.employeeForm.get(key);
            control?.markAsTouched();
        });
    }

    // Getters para facilitar el acceso en el template
    get firstName() { return this.employeeForm.get('firstName'); }
    get lastName() { return this.employeeForm.get('lastName'); }
    get documentNumber() { return this.employeeForm.get('documentNumber'); }
    get email() { return this.employeeForm.get('email'); }
    get phone() { return this.employeeForm.get('phone'); }
    get address() { return this.employeeForm.get('address'); }
    get position() { return this.employeeForm.get('position'); }
    get hireDate() { return this.employeeForm.get('hireDate'); }
    get fechaNacimiento() { return this.employeeForm.get('fechaNacimiento'); }
    get genero() { return this.employeeForm.get('genero'); }
    get isFormDirty(): boolean { return this.employeeForm.dirty; }
}