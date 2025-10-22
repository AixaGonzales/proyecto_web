import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReusableButton } from '../../../shared/reusable-button/reusable-button';
import { CustomerSelector } from '../../customer/customer-selector/customer-selector';
import { ProductSelector } from '../../product/product-selector/product-selector';
import { SolesPipe } from '../../../shared/pipes/currency-soles.pipe';
import { Customer } from '../../../core/interfaces/customer';
import { Product } from '../../../core/interfaces/product';
import { Order, OrderRequest } from '../../../core/interfaces/order';
import { OrderService } from '../../../core/services/order.service';
import { CustomerService } from '../../../core/services/customer.service';
import { ProductService } from '../../../core/services/product.service';
import { InfoColumn } from '../../../shared/info-column/info-column';

@Component({
  selector: 'app-order-form',
  standalone: true,
  templateUrl: './order-form.html',
  styleUrls: ['./order-form.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    ReusableButton,
    CustomerSelector,
    ProductSelector,
    SolesPipe,
    RouterModule,
    InfoColumn
  ],
})
export class OrderForm implements OnInit {
  @Output() orderCreated = new EventEmitter<void>();

  showCustomerSelector = false;
  showProductSelector = false;

  customers: Customer[] = [];
  products: Product[] = [];
  selectedProducts: Product[] = [];

  order: Order = {
    idCustomerOrder: 0,
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    deliveryTime: '12:00',
    deliveryType: 'Local',
    totalAmount: 0,
    advancePayment: 0,
    balanceAmount: 0,
    advancePaymentMethod: '',
    balancePaymentMethod: null,
    orderStatus: 'PE',
    paymentStatus: 'PE',
    balancePaymentDate: null,
    notes: null,
    cancellationReason: null,
    customer: {
      idCustomer: 0,
      firstName: '',
      lastName: '',
      phone: '',
      email: ''
    },
    deliveryAddress: {
      district: '',
      addrStreet: '',
      numberHouse: '',
      placeType: '',
      reference: ''
    }
  };

  totalDisplay: string = 'S/ 0';
  advanceDisplay: string = 'S/ 0';
  balanceDisplay: string = 'S/ 0';

  minOrderDate!: string;
  maxOrderDate!: string;

  constructor(
    private orderService: OrderService,
    private customerService: CustomerService,
    private productService: ProductService
  ) {
    const today = new Date();
    this.minOrderDate = this.formatDate(new Date(today.setDate(today.getDate() - 2)));
    this.maxOrderDate = this.formatDate(new Date(today.setDate(today.getDate() + 4)));
    this.updateDisplaysFromOrder();
  }

  ngOnInit() {
    this.loadActiveCustomers();
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
      },
    });
  }

  loadActiveCustomers() {
    this.customerService.getCustomersByStatus('A').subscribe({
      next: (data) => {
        this.customers = data;
      },
      error: (error) => {
        console.error('Error cargando clientes activos:', error);
      },
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onAdvanceInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    if (!value.startsWith('S/')) {
      value = 'S/' + value.replace(/[^0-9]/g, '');
    }

    const numericPart = value.replace(/^S\/\s?/, '').replace(/\D/g, '');
    this.advanceDisplay = `S/ ${this.formatNumber(parseInt(numericPart || '0', 10))}`;
  }

  onAdvanceBlur(): void {
    const valueWithoutCurrency = this.advanceDisplay.replace(/S\/\s?/g, '').replace(/\./g, '');

    if (valueWithoutCurrency.trim() === '') {
      this.order.advancePayment = 0;
    } else {
      const numericValue = parseInt(valueWithoutCurrency, 10);

      if (!isNaN(numericValue)) {
        this.order.advancePayment = numericValue;
      }
    }

    this.updateDisplaysFormatted();
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const position = input.selectionStart || 0;
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];

    if (position <= 3 && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      return;
    }

    if (!/^[0-9]$/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  updateDisplaysFormatted(): void {
    this.advanceDisplay = `S/ ${this.formatNumber(this.order.advancePayment)}`;
    this.totalDisplay = `S/ ${this.formatNumber(this.order.totalAmount)}`;
    this.balanceDisplay = `S/ ${this.formatNumber(this.order.totalAmount - this.order.advancePayment)}`;
    this.order.balanceAmount = this.order.totalAmount - this.order.advancePayment;

    // Update payment status based on advance
    if (this.order.advancePayment > 0 && this.order.advancePayment < this.order.totalAmount) {
      this.order.paymentStatus = 'PE'; // Pendiente con adelanto
    } else if (this.order.advancePayment >= this.order.totalAmount) {
      this.order.paymentStatus = 'PE'; // Pendiente pero pagado completo
    } else {
      this.order.paymentStatus = 'PE'; // Pendiente sin pago
    }
  }

  updateDisplaysFromOrder(): void {
    this.advanceDisplay = 'S/ 0';
    this.totalDisplay = 'S/ 0';
    this.balanceDisplay = 'S/ 0';
  }

  formatNumber(value: number): string {
    return value.toLocaleString('es-PE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  openClientSelector(): void {
    this.showCustomerSelector = true;
  }

  onClienteSeleccionado(customer: Customer): void {
    this.order.customer = {
      idCustomer: customer.idCustomer,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email
    };
    this.showCustomerSelector = false;
  }

  onCancelSelector(): void {
    this.showCustomerSelector = false;
  }

  openProductSelector(): void {
    this.showProductSelector = true;
  }

  onProductsSelected(products: Product[]): void {
    this.selectedProducts = products;
    this.showProductSelector = false;
    this.calculateTotal();
  }

  cancelProductSelection(): void {
    this.showProductSelector = false;
  }

  calculateTotal(): void {
    this.order.totalAmount = this.selectedProducts.reduce((sum: number, p: Product) => sum + (p.price || 0), 0);
    this.updateDisplaysFormatted();
  }

  resetForm(): void {
    this.order = {
      idCustomerOrder: 0,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      deliveryTime: '12:00',
      deliveryType: 'Local',
      totalAmount: 0,
      advancePayment: 0,
      balanceAmount: 0,
      advancePaymentMethod: '',
      balancePaymentMethod: null,
      orderStatus: 'PE',
      paymentStatus: 'PE',
      balancePaymentDate: null,
      notes: null,
      cancellationReason: null,
      customer: {
        idCustomer: 0,
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
      },
      deliveryAddress: {
        district: '',
        addrStreet: '',
        numberHouse: '',
        placeType: '',
        reference: ''
      }
    };
    this.selectedProducts = [];
    this.updateDisplaysFromOrder();
  }

  cancelOrder(): void {
    if (confirm('¿Está seguro que desea cancelar este pedido?')) {
      this.order.orderStatus = 'CA';
      this.order.cancellationReason = 'Cancelado por el usuario';
      
      // Convertir Order a OrderRequest para el update
      const orderRequest: OrderRequest = this.convertToOrderRequest(this.order);
      
      this.orderService.updateOrder(orderRequest).subscribe({
        next: () => {
          alert('Pedido cancelado correctamente.');
          this.orderCreated.emit();
        },
        error: (err: any) => {
          alert('Error al cancelar el pedido: ' + err.message);
        }
      });
    }
  }

  onSubmit(form: any): void {
    if (!form.valid) {
      return;
    }

    this.order.orderDate = new Date().toISOString().split('T')[0];

    // Convertir Order a OrderRequest
    const orderRequest: OrderRequest = this.convertToOrderRequest(this.order);

    if (this.order.idCustomerOrder && this.order.idCustomerOrder !== 0) {
      this.orderService.updateOrder(orderRequest).subscribe({
        next: () => {
          alert('Pedido actualizado correctamente.');
          this.resetForm();
          this.orderCreated.emit();
        },
        error: (err: any) => {
          alert('Error al actualizar el pedido: ' + err.message);
        }
      });
    } else {
      this.orderService.createOrder(orderRequest).subscribe({
        next: () => {
          alert('Pedido guardado correctamente.');
          this.resetForm();
          this.orderCreated.emit();
        },
        error: (err: any) => {
          alert('Error al guardar el pedido: ' + err.message);
        }
      });
    }
  }

  // Método para convertir Order a OrderRequest
  private convertToOrderRequest(order: Order): OrderRequest {
    return {
      idCustomerOrder: order.idCustomerOrder || undefined,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate,
      deliveryTime: order.deliveryTime,
      deliveryType: order.deliveryType,
      totalAmount: order.totalAmount,
      advancePayment: order.advancePayment,
      balanceAmount: order.balanceAmount,
      advancePaymentMethod: order.advancePaymentMethod,
      balancePaymentMethod: order.balancePaymentMethod || undefined,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      balancePaymentDate: order.balancePaymentDate || undefined,
      notes: order.notes || undefined,
      cancellationReason: order.cancellationReason || undefined,
      customer: {
        idCustomer: order.customer.idCustomer
      },
      deliveryAddress: {
        district: order.deliveryAddress.district,
        addrStreet: order.deliveryAddress.addrStreet,
        numberHouse: order.deliveryAddress.numberHouse,
        placeType: order.deliveryAddress.placeType,
        reference: order.deliveryAddress.reference
      }
    };
  }
}