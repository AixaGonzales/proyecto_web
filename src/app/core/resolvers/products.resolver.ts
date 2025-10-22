// src/app/core/resolvers/products.resolver.ts
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ProductService } from '../services/product.service';
import { catchError, of } from 'rxjs';

export const productsResolver: ResolveFn<any> = (route, state) => {
    const productService = inject(ProductService);
    const status = route.queryParamMap.get('status') || 'A';

    return productService.getProductsByStatus(status).pipe(
        catchError(error => {
            console.error('Error loading products:', error);
            return of([]);
        })
    );
};