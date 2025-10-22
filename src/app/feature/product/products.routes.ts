// src/app/features/product/products.routes.ts
import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { productsResolver } from '../../core/resolvers/products.resolver';
import { productResolver } from '../../core/resolvers/product.resolver';

export const PRODUCTS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./product-list/product-list').then(m => m.ProductList),
        title: 'Gestión de Productos - Panadería',
        resolve: {
            products: productsResolver
        }
    },
    {
        path: 'create',
        loadComponent: () => import('./product-form/product-form').then(m => m.ProductForm),
        title: 'Registrar Producto - Panadería',
        canActivate: [roleGuard],
        data: {
            expectedRoles: ['DEVELOPER', 'SUPERADMIN', 'ADMINISTRATOR', 'INVENTORY']
        }
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./product-edit/product-edit').then(m => m.ProductEdit),
        title: 'Editar Producto - Panadería',
        canActivate: [roleGuard],
        data: {
            expectedRoles: ['DEVELOPER', 'SUPERADMIN', 'ADMINISTRATOR', 'INVENTORY']
        },
        resolve: {
            product: productResolver
        }
    },
    {
        path: 'view/:id',
        loadComponent: () => import('./product-details/product-details').then(m => m.ProductDetails),
        title: 'Detalles del Producto - Panadería',
        resolve: {
            product: productResolver
        }
    }
];