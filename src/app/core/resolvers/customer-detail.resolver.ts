// src/app/core/resolvers/customer-detail.resolver.ts
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { CustomerService } from '../services/customer.service';
import { catchError, of } from 'rxjs';

export const customerDetailResolver: ResolveFn<any> = (route, state) => {
    const customerService = inject(CustomerService);
    const id = route.paramMap.get('id');

    if (id) {
        return customerService.getCustomerById(+id).pipe(
            catchError(error => {
                console.error('Error loading customer:', error);
                return of(null);
            })
        );
    }

    return of(null);
};