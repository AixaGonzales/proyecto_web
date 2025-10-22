// src/app/features/employees/employees.routes.ts
import { Routes } from '@angular/router';
import { employeesResolver } from '../../core/resolvers/employee.resolver';
import { employeeResolver } from '../../core/resolvers/employee.resolver';

export const EMPLOYEES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./employee-list/employee-list').then(m => m.EmployeeList),
        resolve: {
            employees: employeesResolver
        }
    },
    {
        path: 'create',
        loadComponent: () => import('./employee-form/employee-form').then(m => m.EmployeeForm)
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./employee-form/employee-form').then(m => m.EmployeeForm),
        resolve: {
            employee: employeeResolver
        }
    },
    {
        path: 'view/:id',
        loadComponent: () => import('./employee-details/employee-details').then(m => m.EmployeeDetails),
        resolve: {
            employee: employeeResolver
        }
    }
];