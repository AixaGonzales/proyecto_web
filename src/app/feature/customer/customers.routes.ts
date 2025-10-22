// src/app/feature/customer/customers.routes.ts
import { Routes } from '@angular/router';
import { customerListResolver } from '../../core/resolvers/customer-list.resolver';
import { customerDetailResolver } from '../../core/resolvers/customer-detail.resolver';
import { roleGuard } from '../../core/guards/role.guard';

export const CUSTOMERS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./customer-list/customer-list').then(m => m.CustomerList),
        title: 'Lista de Clientes - Panadería',
        resolve: {
            customers: customerListResolver
        }
    },
    {
        path: 'customer-form',
        loadComponent: () => import('./customer-form/customer-form').then(m => m.CustomerForm),
        title: 'Formulario de Cliente - Panadería',
        canActivate: [roleGuard],
        data: {
            expectedRoles: ['DEVELOPER', 'SUPERADMIN', 'ADMINISTRATOR']
        }
    },
    {
        path: 'customer-new',
        loadComponent: () => import('./customers-new/customers-new').then(m => m.CustomersNew),
        title: 'Clientes Nuevos - Panadería',
        resolve: {
            customers: customerListResolver
        }
    },
    {
        path: 'customer-edit/:id',
        loadComponent: () => import('./customer-form/customer-form').then(m => m.CustomerForm),
        title: 'Editar Cliente - Panadería',
        canActivate: [roleGuard],
        data: {
            expectedRoles: ['DEVELOPER', 'SUPERADMIN', 'ADMINISTRATOR']
        },
        resolve: {
            customer: customerDetailResolver
        }
    },
    {
        path: 'customer-details/:id',
        loadComponent: () => import('./customer-details/customer-details').then(m => m.CustomerDetails),
        title: 'Detalles del Cliente - Panadería',
        resolve: {
            customer: customerDetailResolver
        }
    }
];