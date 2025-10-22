// src/app/core/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderRequest } from '../interfaces/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private baseUrl = `${environment.apiBaseUrl}${environment.endpoints.order}`;

  constructor(private http: HttpClient) { }

  // Obtener todos los pedidos
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}`);
  }

  // Obtener pedido por ID
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  // Crear nuevo pedido
  createOrder(order: OrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/save`, order);
  }

  // Actualizar pedido existente
  updateOrder(order: OrderRequest): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/update`, order);
  }

  // Eliminar pedido (marcar como cancelado) - PATCH
  cancelOrder(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/delete/${id}`, {});
  }

  // Restaurar pedido cancelado - PATCH
  restoreOrder(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/restore/${id}`, {});
  }

  // Obtener pedidos cancelados
  getCancelledOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/canceled`);
  }

  // Obtener pedidos por estado
  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/status/${status}`);
  }

  // Buscar pedidos por tipo de entrega
  getOrdersByDeliveryType(deliveryType: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/delivery-type/${deliveryType}`);
  }

  // Buscar pedidos por cliente
  getOrdersByCustomerId(customerId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/customer/${customerId}`);
  }

  // Obtener detalles completos del pedido
  getOrderFullDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/full-details/${id}`);
  }

  // Obtener items del pedido
  getOrderItems(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/items/${id}`);
  }

  // Calcular total del pedido
  calculateOrderTotal(id: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/total/${id}`);
  }

  // Health check
  healthCheck(): Observable<string> {
    return this.http.get(`${this.baseUrl}/health`, { responseType: 'text' });
  }
}