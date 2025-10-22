// src/app/core/resolvers/orders.resolver.ts
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { OrderService } from '../services/order.service';
import { catchError, of } from 'rxjs';

export const ordersResolver: ResolveFn<any> = (route, state) => {
    const orderService = inject(OrderService);
    const status = route.queryParamMap.get('status') || 'A';

    return orderService.getOrdersByStatus(status).pipe(
        catchError(error => {
            console.error('Error loading orders:', error);
            return of([]);
        })
    );
};

export const orderResolver: ResolveFn<any> = (route, state) => {
    const orderService = inject(OrderService);
    const id = route.paramMap.get('id');

    if (id) {
        return orderService.getOrderById(+id).pipe(
            catchError(error => {
                console.error('Error loading order:', error);
                return of(null);
            })
        );
    }

    return of(null);
};