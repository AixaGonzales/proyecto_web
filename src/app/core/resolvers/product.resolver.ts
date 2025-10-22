// src/app/core/resolvers/product.resolver.ts
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ProductService } from '../services/product.service';
import { catchError, of } from 'rxjs';

export const productResolver: ResolveFn<any> = (route, state) => {
    const productService = inject(ProductService);
    const id = route.paramMap.get('id');

    if (id) {
        return productService.getProductById(+id).pipe(
            catchError(error => {
                console.error('Error loading product:', error);
                return of(null);
            })
        );
    }

    return of(null);
};