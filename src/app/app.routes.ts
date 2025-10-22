// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Layout } from './layout/main-layout/layout';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./feature/auth/login/login').then(m => m.Login),
        title: 'Iniciar Sesión - Panadería'
    },
    {
        path: '',
        component: Layout,
        canActivate: [authGuard],
        children: [
            // Dashboard / Home
            {
                path: '',
                loadComponent: () => import('./pages/home/home').then(m => m.MainMenu),
                title: 'Menú Principal - Panadería'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/home/home').then(m => m.MainMenu),
                title: 'Dashboard - Panadería'
            },

            // MÓDULO DE EMPLEADOS - Con Lazy Loading
            {
                path: 'employees',
                loadChildren: () => import('./feature/employee/employees.routes').then(m => m.EMPLOYEES_ROUTES)
            },

            // MÓDULO DE PRODUCTOS - Con Lazy Loading
            {
                path: 'products',
                loadChildren: () => import('./feature/product/products.routes').then(m => m.PRODUCTS_ROUTES)
            },

            // MÓDULO DE CLIENTES - Con Lazy Loading
            {
                path: 'customers',
                loadChildren: () => import('./feature/customer/customers.routes').then(m => m.CUSTOMERS_ROUTES)
            },

            // MÓDULO DE PEDIDOS - Con Lazy Loading
            {
                path: 'orders',
                loadChildren: () => import('./feature/order/orders.routes').then(m => m.ORDERS_ROUTES)
            },

            // Ruta por defecto
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];