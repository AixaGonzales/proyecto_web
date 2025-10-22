// order-details-dialog.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { CustomerDetails } from '../../customer/customer-details/customer-details';

@Component({
  selector: 'app-order-details-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './order-details-dialog.html',
  styleUrls: ['./order-details-dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ])
  ]
})
export class OrderDetailsDialog{
  @Input() data: any = null;
  @Output() closeDialog = new EventEmitter<void>();

  showProductsDialog = false;
  showClientDialog = false;

  constructor(private dialog: MatDialog) {}

  close(): void {
    this.showProductsDialog = false;
    this.showClientDialog = false;
    this.closeDialog.emit();
  }

  getStatusClass(status: string): string {
    if (!status) return '';

    const statusLower = status.toLowerCase();
    if (statusLower.includes('complet') || statusLower.includes('entreg')) return 'completed';
    if (statusLower.includes('pendiente')) return 'pending';
    if (statusLower.includes('cancel')) return 'cancelled';
    return '';
  }

  getPaymentStatusClass(statusPago: 'N' | 'A' | 'P'): string {
    if (!statusPago) return '';

    switch (statusPago) {
      case 'P': return 'paid';
      case 'A': return 'advance';
      case 'N': return 'unpaid';
      default: return '';
    }
  }

  getPaymentStatusText(statusPago: 'N' | 'A' | 'P'): string {
    if (!statusPago) return 'Sin información';

    switch (statusPago) {
      case 'P': return 'Pagado';
      case 'A': return 'Adelanto';
      case 'N': return 'No pagado';
      default: return 'Sin información';
    }
  }

  getPaymentMethodText(method: string | null): string {
    if (!method) return 'No especificado'; // Por si paymentMethodAdvance es null

    // Opcional: convertir códigos a nombres legibles (si usas "EF", "TJ", etc.)
    const methodMap: Record<string, string> = {
      'EF': 'Efectivo',
      'TJ': 'Tarjeta',
      'TR': 'Transferencia',
      'YP': 'Yape/Plin',
      'Efectivo': 'Efectivo', // Por si ya viene el nombre completo
      'Tarjeta': 'Tarjeta',
      // Agrega más mapeos si es necesario
    };

    return methodMap[method] || method; // Devuelve el mapeo o el valor original
  }

  trackByProduct(index: number, product: any): any {
    return product?.id || index;
  }



  showCustomerDetails(): void {
    if (!this.data?.customer) return;

    this.dialog.open(CustomerDetails, {
      width: '500px',
      data: this.data.customer,
      panelClass: 'customer-details-dialog'
    });
  }

}