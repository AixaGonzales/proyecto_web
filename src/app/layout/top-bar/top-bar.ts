import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../../core/services/customer.service';
import { interval } from 'rxjs';
import { NotificationsPanel } from '../../shared/notifications-panel/notifications-panel'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    RouterModule,
    NotificationsPanel

  ],
  templateUrl: './top-bar.html',
  styleUrls: ['./top-bar.scss']
})
export class TopBar implements OnInit {
  // Estado de sesión y datos del usuario
  isLoggedIn: boolean = true;
  userName: string = 'Juan Pérez';
  notificationCount: number = 0;
  profileImage: string | null = null;

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadNotificationCount();
    // Actualizar cada hora
    interval(3600000).subscribe(() => this.loadNotificationCount());
  }

  loadNotificationCount(): void {
    this.customerService.getUpcomingBirthdays(0).subscribe({
      next: (today) => {
        this.customerService.getUpcomingBirthdays(3).subscribe({
          next: (upcoming) => {
            this.notificationCount = today.length + upcoming.length;
          }
        });
      },
      error: (err) => console.error('Error loading notifications count', err)
    });
  }

  logout(): void {
    this.isLoggedIn = false;
    this.userName = '';
    this.profileImage = null;
    console.log('Sesión cerrada');
  }

  login(): void {
    this.isLoggedIn = true;
    this.userName = 'Juan Pérez';
    this.notificationCount = 3;
    console.log('Sesión iniciada');
  }
}