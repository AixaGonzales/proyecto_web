// src/app/features/orders/orders.routes.ts
import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./order-list/order-list').then(m => m.OrderList),
        title: 'Gestión de Pedidos - Panadería'
    },
    {
        path: 'create',
        loadComponent: () => import('./order-form/order-form').then(m => m.OrderForm),
        title: 'Crear Pedido - Panadería'
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./order-form/order-form').then(m => m.OrderForm),
        title: 'Editar Pedido - Panadería'
    },
    {
        path: 'view/:id',
        loadComponent: () => import('./order-details-dialog/order-details-dialog').then(m => m.OrderDetailsDialog),
        title: 'Detalles del Pedido - Panadería'
    }
];