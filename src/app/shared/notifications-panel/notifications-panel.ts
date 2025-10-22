// src/app/shared/notifications-panel/notifications-panel.ts
import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { CustomerService } from '../../core/services/customer.service';
import { Subscription } from 'rxjs';
import { Customer } from '../../core/interfaces/customer';

export interface Notification {
  id: string;
  message: string;
  date: Date;
  icon: string;
  type: 'birthday_today' | 'birthday_upcoming';
  customerId?: number;
  daysRemaining: number;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatChipsModule
  ],
  templateUrl: './notifications-panel.html',
  styleUrls: ['./notifications-panel.scss']
})
export class NotificationsPanel implements OnInit, OnDestroy {
  private customerService = inject(CustomerService);

  notifications: Notification[] = [];
  unreadCount: number = 0;
  loading = true;
  hasNotifications = false;

  private notificationSubscription!: Subscription;

  readonly notificationTypes = {
    birthday_today: {
      icon: 'cake',
      color: '#E16B47',
      bgColor: '#FFF5E1',
      priority: 'high' as const
    },
    birthday_upcoming: {
      icon: 'notifications',
      color: '#F5A25D',
      bgColor: '#FFF9F0',
      priority: 'medium' as const
    }
  };

  ngOnInit(): void {
    this.loadBirthdayNotifications();
    this.setupNotificationSubscription();
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  private setupNotificationSubscription(): void {
    this.notificationSubscription = this.customerService.birthdayNotifications$.subscribe({
      next: ({ today, upcoming }: { today: Customer[], upcoming: Customer[] }) => {
        this.processNotifications(today, upcoming);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar notificaciones:', err);
        this.loading = false;
      }
    });
  }

  private processNotifications(today: Customer[], upcoming: Customer[]): void {
    this.notifications = [];

    // 1. Cumpleaños de HOY (Alta prioridad)
    today.forEach(customer => {
      this.notifications.push(this.createNotification(
        customer,
        `🎂 ¡Hoy es el cumpleaños de ${customer.firstName} ${customer.lastName}!`,
        0,
        'birthday_today'
      ));
    });

    // 2. Cumpleaños PRÓXIMOS (Media prioridad)
    upcoming.forEach(customer => {
      const daysRemaining = this.calculateDaysRemaining(customer.birthDate);

      if (daysRemaining >= 1 && daysRemaining <= 3) {
        const dayText = daysRemaining === 1 ? 'mañana' : `en ${daysRemaining} días`;
        this.notifications.push(this.createNotification(
          customer,
          `⏰ ${customer.firstName} ${customer.lastName} cumple años ${dayText}`,
          daysRemaining,
          'birthday_upcoming'
        ));
      }
    });

    // Ordenar por prioridad y fecha
    this.notifications.sort((a, b) => {
      // Primero por no leídas
      if (a.read !== b.read) return a.read ? 1 : -1;
      // Luego por prioridad
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    this.updateNotificationStats();
  }

  private createNotification(customer: Customer, message: string, daysRemaining: number, type: 'birthday_today' | 'birthday_upcoming'): Notification {
    const notificationType = this.notificationTypes[type];

    return {
      id: `notif_${customer.idCustomer}_${Date.now()}`,
      message,
      date: new Date(),
      icon: notificationType.icon,
      type,
      customerId: customer.idCustomer,
      daysRemaining,
      read: false,
      priority: notificationType.priority
    };
  }

  private calculateDaysRemaining(birthDate: string | Date): number {
    const birth = new Date(birthDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = birth.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private updateNotificationStats(): void {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
    this.hasNotifications = this.notifications.length > 0;
  }

  markAsRead(notification: Notification): void {
    notification.read = true;
    this.updateNotificationStats();
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => notification.read = true);
    this.updateNotificationStats();
  }

  clearAll(): void {
    this.notifications = [];
    this.updateNotificationStats();
  }

  // ✅ CORREGIDO: Ahora usa el método público sin parámetros
  loadBirthdayNotifications(): void {
    this.customerService.checkBirthdays();
  }

  getNotificationIcon(notification: Notification): string {
    return this.notificationTypes[notification.type]?.icon || 'notifications';
  }

  getNotificationColor(notification: Notification): string {
    return this.notificationTypes[notification.type]?.color || '#666';
  }
}