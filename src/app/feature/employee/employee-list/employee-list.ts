// src/app/features/employees/employee-list/employee-list.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/interfaces/employee';
import { SearchFilter } from '../../../shared/search-filter/search-filter';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatTableModule,
    MatMenuModule,
    SearchFilter
  ],
  providers: [DatePipe],
  templateUrl: './employee-list.html',
  styleUrls: ['./employee-list.scss']
})
export class EmployeeList implements OnInit {
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private datePipe = inject(DatePipe);

  // Estados
  employees = signal<Employee[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  currentFilter: 'todos' | 'activo' | 'inactivo' = 'activo';

  // Estadísticas
  stats = computed(() => {
    const allEmployees = this.employees();
    const active = allEmployees.filter(e => e.status === 'A');
    const inactive = allEmployees.filter(e => e.status === 'I');
    
    return {
      total: allEmployees.length,
      active: active.length,
      inactive: inactive.length
    };
  });

  // Empleados filtrados
  filteredEmployees = computed(() => {
    let filtered = this.employees();
    const term = this.searchTerm().toLowerCase();

    // Filtro por búsqueda
    if (term) {
      filtered = filtered.filter(emp =>
        emp.firstName.toLowerCase().includes(term) ||
        emp.lastName.toLowerCase().includes(term) ||
        emp.documentNumber.includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        this.getRoleName(emp).toLowerCase().includes(term)
      );
    }

    // Filtro por estado
    if (this.currentFilter === 'activo') {
      filtered = filtered.filter(emp => emp.status === 'A');
    } else if (this.currentFilter === 'inactivo') {
      filtered = filtered.filter(emp => emp.status === 'I');
    }

    return filtered;
  });

  displayedColumns: string[] = ['avatar', 'name', 'document', 'contact', 'role', 'status', 'actions'];

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading.set(true);
    
    this.employeeService.getActiveEmployees().subscribe({
      next: (employees) => {
        this.employees.set(employees);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando empleados:', error);
        this.showError('Error al cargar los empleados');
        this.isLoading.set(false);
      }
    });
  }

  // Handlers para el componente de búsqueda - CORREGIDOS
  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  onFilterChange(filter: 'todos' | 'activo' | 'inactivo'): void {
    this.currentFilter = filter;
  }

  // Navegación y acciones
  editEmployee(id: number | undefined): void {
    if (id) this.router.navigate(['/employees/edit', id]);
  }

  viewEmployee(id: number | undefined): void {
    if (id) this.router.navigate(['/employees/view', id]);
  }

  createEmployee(): void {
    this.router.navigate(['/employees/create']);
  }

  downloadReport(): void {
    this.showSuccess('La funcionalidad de descarga de reportes estará disponible pronto');
  }

  // Resto de métodos utilitarios...
  getStatusColor(status: string = 'A'): 'success' | 'warn' {
    return status === 'A' ? 'success' : 'warn';
  }

  getStatusText(status: string = 'A'): string {
    return status === 'A' ? 'Activo' : 'Inactivo';
  }

  getGenderText(gender: string = 'M'): string {
    const genderMap: { [key: string]: string } = {
      'M': 'Masculino', 'F': 'Femenino', 'O': 'Otro'
    };
    return genderMap[gender] || 'No especificado';
  }

  getRoleName(employee: Employee): string {
    return this.employeeService.getDisplayRoleName(employee.roleName);
  }

  getRoleIcon(employee: Employee): string {
    return this.employeeService.getRoleIcon(employee.roleName);
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'No especificada';
    return this.datePipe.transform(date, 'dd/MM/yyyy') || date;
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  trackByEmployeeId(index: number, employee: Employee): number | undefined {
    return employee.idEmployee;
  }

  // Acciones de empleados (activate/deactivate)
  async deactivateEmployee(employee: Employee): Promise<void> {
    if (!employee.idEmployee) return;

    const result = await Swal.fire({
      title: '¿Desactivar Empleado?',
      html: `¿Está seguro de desactivar a <strong>${employee.firstName} ${employee.lastName}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      this.employeeService.deleteEmployee(employee.idEmployee).subscribe({
        next: () => {
          this.showSuccess('Empleado desactivado exitosamente');
          this.loadEmployees();
        },
        error: (error) => {
          this.showError('Error al desactivar empleado');
        }
      });
    }
  }

  async activateEmployee(employee: Employee): Promise<void> {
    if (!employee.idEmployee) return;

    const result = await Swal.fire({
      title: '¿Activar Empleado?',
      html: `¿Está seguro de activar a <strong>${employee.firstName} ${employee.lastName}</strong>?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      this.employeeService.restoreEmployee(employee.idEmployee).subscribe({
        next: () => {
          this.showSuccess('Empleado activado exitosamente');
          this.loadEmployees();
        },
        error: (error) => {
          this.showError('Error al activar empleado');
        }
      });
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
}