// src/app/core/resolvers/customer-list.resolver.ts
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { CustomerService } from '../services/customer.service';
import { catchError, of } from 'rxjs';

export const customerListResolver: ResolveFn<any> = (route, state) => {
  const customerService = inject(CustomerService);
  const status = route.queryParamMap.get('status') || 'A';

  return customerService.getCustomersByStatus(status).pipe(
    catchError(error => {
      console.error('Error loading customers:', error);
      return of([]);
    })
  );
};