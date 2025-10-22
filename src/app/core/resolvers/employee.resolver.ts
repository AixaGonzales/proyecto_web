// src/app/core/resolvers/employee.resolver.ts
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { catchError, of } from 'rxjs';

export const employeeResolver: ResolveFn<any> = (route, state) => {
  const employeeService = inject(EmployeeService);
  const id = route.paramMap.get('id');

  if (id) {
    return employeeService.getEmployeeById(+id).pipe(
      catchError(error => {
        console.error('Error loading employee:', error);
        return of(null);
      })
    );
  }

  return of(null);
};

export const employeesResolver: ResolveFn<any> = (route, state) => {
  const employeeService = inject(EmployeeService);
  const status = route.queryParamMap.get('status') || 'A';

  return employeeService.getEmployeesByStatus(status).pipe(
    catchError(error => {
      console.error('Error loading employees:', error);
      return of([]);
    })
  );
};