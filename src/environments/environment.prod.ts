// src/environments/environment.prod.ts
export const environment = {
    production: true,
    apiBaseUrl: 'https://tudominio.com/api',
    authUrl: 'https://tudominio.com/auth',
    endpoints: {
        customer: '/customer',
        order: '/order',
        product: '/product',
        employee: '/employee',
        address: '/v1/api/address'
    }
};