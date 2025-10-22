// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8085/v1/api',
  authUrl: 'http://localhost:8085/auth',
  appName: 'Sistema Panadería',
  version: '1.0.0',
  endpoints: {
    customer: '/customer',
    order: '/order',
    product: '/product',
    employee: '/employee',
    address: '/address'
  },
  features: {
    enableNotifications: true,
    enableReports: true,
    enableBirthdayAlerts: true
  }
};