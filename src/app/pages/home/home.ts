// src/app/pages/home/home.ts
import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import Chart from 'chart.js/auto';
import { CustomerService } from '../../core/services/customer.service';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class MainMenu implements OnInit, AfterViewInit, OnDestroy {
  private authService = inject(AuthService);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  
  customerCount: number = 0;
  private customerCountSubscription: Subscription | undefined;
  userName: string = '';
  isLoading: boolean = true;

  weeklySalesChart: Chart | undefined;
  topProductsChart: Chart | undefined;

  menuCards = [
    {
      title: 'Clientes',
      description: 'Gestión completa de clientes',
      icon: 'groups',
      route: '/customers',
      color: '#b95a3f'
    },
    {
      title: 'Pedidos',
      description: 'Gestión de pedidos',
      icon: 'shopping_cart',
      route: '/orders',
      color: '#f5a25d'
    },
    {
      title: 'Productos',
      description: 'Gestión de productos',
      icon: 'store',
      route: '/products',
      color: '#d57f6d'
    },
    {
      title: 'Ventas',
      description: 'Gestión de ventas',
      icon: 'attach_money',
      route: '/ventas',
      color: '#a6492c'
    },
    {
      title: 'Reportes',
      description: 'Ver reportes de ventas',
      icon: 'assessment',
      route: '/reportes',
      color: '#f9c67a'
    },
    {
      title: 'Inventario',
      description: 'Gestionar inventarios',
      icon: 'inventory',
      route: '/inventario',
      color: '#f0a370'
    },
    {
      title: 'Proveedores',
      description: 'Gestionar proveedores',
      icon: 'people',
      route: '/proveedores',
      color: '#bd5d44'
    },
    {
      title: 'Añadir Proveedor',
      description: 'Registrar un nuevo proveedor',
      icon: 'local_shipping',
      route: '/añadir-proveedor',
      color: '#bc937d'
    },
    {
      title: 'Estadísticas',
      description: 'Ver estadísticas de ventas',
      icon: 'trending_up',
      route: '/estadisticas',
      color: '#d8c2a6'
    },
    {
      title: 'Colaboradores',
      description: 'Ver colaboradores',
      icon: 'group',
      route: '/colaboradores',
      color: '#ac664e'
    },
    {
      title: 'Registrar Factura',
      description: 'Añadir una nueva factura de venta',
      icon: 'receipt',
      route: '/registrar-factura',
      color: '#a36248'
    },
    {
      title: 'Recetas y Costos de Producción',
      description: 'Gestionar las recetas y calcular los costos de producción',
      icon: 'kitchen',
      route: '/recetas-costos',
      color: '#f78e59'
    },
    {
      title: 'Calendario de Pedidos',
      description: 'Ver y gestionar los pedidos según las fechas',
      icon: 'calendar_today',
      route: '/calendario-pedidos',
      color: '#c4876b'
    },
    {
      title: 'Gestión de Pagos',
      description: 'Registrar y gestionar pagos de ventas realizadas',
      icon: 'payment',
      route: '/gestionar-pagos',
      color: '#d0916b'
    },
    {
      title: 'Devoluciones',
      description: 'Gestionar devoluciones de productos',
      icon: 'undo',
      route: '/devoluciones',
      color: '#cf7f63'
    }
  ];

  ngOnInit(): void {
    // ✅ CORRECCIÓN: Extraer solo la parte del username del email
    const user = this.authService.currentUser();
    if (user?.username) {
      // Si el username es un email, mostrar solo la parte antes del @
      this.userName = user.username.split('@')[0];
    } else {
      this.userName = 'Usuario';
    }

    console.log('👤 Usuario procesado:', {
      usernameOriginal: user?.username,
      usernameMostrado: this.userName
    });

    // ✅ CORRECCIÓN: Suscripción corregida
    this.customerCountSubscription = this.customerService.newCustomersCount$.pipe(
      startWith(Number(localStorage.getItem('lastCustomerCount') || 0))
    ).subscribe((count: number) => {
      this.customerCount = count;
    });

    // ✅ CORRECCIÓN: Fuerza una actualización al entrar al componente
    this.customerService.loadNewCustomers();

    setTimeout(() => {
      this.isLoading = false;
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.customerCountSubscription) {
      this.customerCountSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.createWeeklySalesChart();
    this.createTopProductsChart();
  }

  private createWeeklySalesChart(): void {
    const ctx = document.getElementById('weeklySalesChart') as HTMLCanvasElement;

    if (ctx) {
      this.weeklySalesChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          datasets: [{
            label: 'Ventas en $',
            data: [1200, 1900, 1700, 2100, 2500, 2200, 1800],
            backgroundColor: 'rgba(185, 90, 63, 0.2)',
            borderColor: 'rgba(185, 90, 63, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#FFF5E1',
            pointBorderColor: '#B95A3F',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: '#FFF5E1',
              titleColor: '#333',
              bodyColor: '#666',
              borderColor: '#B95A3F',
              borderWidth: 1,
              padding: 10,
              usePointStyle: true,
              callbacks: {
                label: (context: any) => {
                  return ` $${context.parsed.y.toLocaleString()}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                callback: (value: any) => {
                  return `$${value}`;
                }
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }
  }

  private createTopProductsChart(): void {
    const ctx = document.getElementById('topProductsChart') as HTMLCanvasElement;

    if (ctx) {
      this.topProductsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Pan Integral', 'Croissants', 'Baguette', 'Donas', 'Torta Chocolate'],
          datasets: [{
            label: 'Unidades Vendidas',
            data: [120, 90, 75, 60, 45],
            backgroundColor: [
              'rgba(185, 90, 63, 0.7)',
              'rgba(245, 162, 93, 0.7)',
              'rgba(213, 127, 109, 0.7)',
              'rgba(166, 73, 44, 0.7)',
              'rgba(188, 93, 68, 0.7)'
            ],
            borderColor: [
              'rgba(185, 90, 63, 1)',
              'rgba(245, 162, 93, 1)',
              'rgba(213, 127, 109, 1)',
              'rgba(166, 73, 44, 1)',
              'rgba(188, 93, 68, 1)'
            ],
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: '#FFF5E1',
              titleColor: '#333',
              bodyColor: '#666',
              borderColor: '#B95A3F',
              borderWidth: 1,
              padding: 10
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                precision: 0
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}