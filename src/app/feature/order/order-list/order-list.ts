import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Componentes y servicios
import { SearchFilter } from '../../../shared/search-filter/search-filter';
import { SolesPipe } from '../../../shared/pipes/currency-soles.pipe';
import { OrderDetailsDialog } from '../order-details-dialog/order-details-dialog';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/interfaces/order';
import { OrderNumberPipe } from '../../../shared/pipes/order-number.pipe';

@Component({
  selector: 'app-order-list',
  standalone: true,
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.scss'],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    // Angular Material
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    // Componentes y Pipes
    SearchFilter,
    SolesPipe,
    OrderDetailsDialog,
    OrderNumberPipe
  ]
})
export class OrderList implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = false;
  selectedOrder: Order | null = null;
  showDetailsDialog = false;
  currentFilter: string = 'all';

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.loading = true;
    this.orderService.getOrders()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (orders) => {
          this.orders = orders.filter(order => order.orderStatus === 'PE');
          this.filteredOrders = [...this.orders];
        },
        error: (err: any) => {
          console.error('Error cargando pedidos:', err);
          Swal.fire('Error', 'No se pudieron cargar los pedidos', 'error');
        }
      });
  }

  // Métodos para las estadísticas
  getTotalCount(): number {
    return this.orders.length;
  }

  getParaLlevarCount(): number {
    return this.orders.filter(order => order.deliveryType === 'Domicilio').length;
  }

  getRecojoLocalCount(): number {
    return this.orders.filter(order => order.deliveryType === 'Local').length;
  }

  getPendientesPagoCount(): number {
    return this.orders.filter(order => order.paymentStatus === 'PE').length;
  }

  // Métodos de filtrado
  filtrarTodos(): void {
    this.handleFilter('all');
  }

  filtrarParaLlevar(): void {
    this.handleFilter('delivery');
  }

  filtrarRecojoLocal(): void {
    this.handleFilter('local');
  }

  filtrarPendientesPago(): void {
    this.handleFilter('pending-payment');
  }

  // Acciones
  cancelarPedido(id: number): void {
    Swal.fire({
      title: '¿Cancelar pedido?',
      text: 'El pedido se marcará como cancelado',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderService.cancelOrder(id).subscribe({
          next: () => {
            this.cargarPedidos();
            Swal.fire('Cancelado', 'El pedido ha sido cancelado', 'success');
          },
          error: (err: any) => {
            console.error('Error cancelando pedido:', err);
            Swal.fire('Error', 'No se pudo cancelar el pedido', 'error');
          }
        });
      }
    });
  }

  editarPedido(order: Order): void {
    this.router.navigate(['/order/edit', order.idCustomerOrder]);
  }

  generarComprobante(order: Order): void {
    // Solo el botón - tú conectas el componente después
    console.log('Generar comprobante para pedido:', order.idCustomerOrder);
  }

  verDetalles(order: Order): void {
    this.selectedOrder = { ...order };
    this.showDetailsDialog = true;
  }

  closeDetailsDialog(): void {
    this.showDetailsDialog = false;
    this.selectedOrder = null;
  }

  handleSearch(texto: string): void {
    if (!texto) {
      this.filteredOrders = [...this.orders];
      return;
    }

    const searchText = texto.toLowerCase();
    this.filteredOrders = this.orders.filter(order => {
      const customerName = this.getCustomerName(order.customer).toLowerCase();
      
      return (
        customerName.includes(searchText) ||
        (order.idCustomerOrder.toString().includes(searchText)) ||
        (this.getPaymentStatusText(order.paymentStatus).toLowerCase().includes(searchText)) ||
        (order.deliveryType.toLowerCase().includes(searchText)) ||
        (order.notes?.toLowerCase().includes(searchText) || false) ||
        (order.advancePaymentMethod?.toLowerCase().includes(searchText) || false)
      );
    });
  }

  handleFilter(filterValue: string): void {
    this.currentFilter = filterValue;
    
    switch (filterValue) {
      case 'all':
        this.filteredOrders = [...this.orders];
        break;
      case 'delivery':
        this.filteredOrders = this.orders.filter(o => o.deliveryType === 'Domicilio');
        break;
      case 'local':
        this.filteredOrders = this.orders.filter(o => o.deliveryType === 'Local');
        break;
      case 'pending-payment':
        this.filteredOrders = this.orders.filter(o => o.paymentStatus === 'PE');
        break;
      default:
        this.filteredOrders = [...this.orders];
    }
  }

  getPaymentStatusText(status: string): string {
    return status === 'PE' ? 'Pendiente' : 'Pagado';
  }

  getPaymentStatusClass(status: string): string {
    return status === 'PE' ? 'pendiente' : 'completado';
  }

  getDeliveryTypeText(type: string): string {
    switch (type) {
      case 'Local': return 'Recojo';
      case 'Domicilio': return 'Para Llevar';
      default: return type;
    }
  }

  getCustomerName(customer: any): string {
    if (!customer) return 'Cliente no especificado';

    if (typeof customer === 'object' && customer.firstName) {
      return `${customer.firstName} ${customer.lastName}`.trim();
    }

    if (typeof customer === 'object' && customer.name) {
      return customer.name;
    }

    return 'Cliente no disponible';
  }
}