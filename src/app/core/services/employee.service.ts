// src/app/core/services/employee.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee, EmployeeRequest, Role } from '../interfaces/employee';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/v1/api/employee`;

  private roleIcons: { [key: string]: string } = {
    'DEVELOPER': 'code',
    'SUPERADMIN': 'admin_panel_settings',
    'ADMINISTRATOR': 'manage_accounts',
    'CASHIER': 'point_of_sale',
    'INVENTORY': 'inventory_2',
    'BAKER': 'bakery_dining',
    'EMPLOYEE': 'badge',
    'CLIENT': 'person',
    'SUPPLIER': 'local_shipping'
  };

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  getActiveEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/active`);
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: EmployeeRequest): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}/save`, employee);
  }

  updateEmployee(id: number, employee: EmployeeRequest): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/update/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/delete/${id}`, {});
  }

  restoreEmployee(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/restore/${id}`, {});
  }

  getEmployeesByStatus(status: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/status/${status}`);
  }

  getEmployeesByGender(gender: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/gender/${gender}`);
  }

  assignRoleToEmployee(id: number, roleName: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/assign-role`, null, {
      params: { roleName }
    });
  }

  updateEmployeeEmail(id: number, newEmail: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/email`, { newEmail });
  }

  getEmployeeUserInfo(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/user-info`);
  }

  getAvailableRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${environment.apiBaseUrl}/v1/api/roles`).pipe(
      map(roles => roles || [])
    );
  }

  getRoleIcon(roleName: string | undefined): string {
    if (!roleName) return 'person';
    return this.roleIcons[roleName] || 'person';
  }

  getDisplayRoleName(roleName: string | undefined): string {
    if (!roleName) return 'Empleado';

    const roleMap: { [key: string]: string } = {
      'DEVELOPER': 'Desarrollador',
      'SUPERADMIN': 'Super Admin',
      'ADMINISTRATOR': 'Administrador',
      'CASHIER': 'Cajero',
      'INVENTORY': 'Inventario',
      'BAKER': 'Panadero',
      'EMPLOYEE': 'Empleado',
      'CLIENT': 'Cliente',
      'SUPPLIER': 'Proveedor'
    };
    return roleMap[roleName] || roleName;
  }
}