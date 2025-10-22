// src/app/layout/sidebar/sidebar.ts
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar implements OnInit {
  isExpanded = false;
  isMobile = false;
  authService = inject(AuthService);

  ngOnInit() {
    this.checkScreenSize();

    // Debug para verificar el usuario
    const user = this.authService.currentUser();
    console.log('🔍 Usuario en sidebar:', user);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isExpanded = true;
    }
  }

  logout(): void {
    this.authService.logout();
  }

  getRoleIcon(): string {
    const user = this.authService.currentUser();
    if (!user || !user.roles || user.roles.length === 0) return 'person';

    const mainRole = user.roles[0].toUpperCase();

    // LÓGICA DE ICONOS POR ROL
    if (mainRole.includes('ADMIN')) return 'admin_panel_settings';
    if (mainRole.includes('PANADERO')) return 'bakery_dining';
    if (mainRole.includes('CAJERO')) return 'point_of_sale';
    if (mainRole.includes('GERENTE')) return 'manage_accounts';
    if (mainRole.includes('SUPERVISOR')) return 'supervisor_account';
    if (mainRole.includes('COLABORADOR')) return 'engineering';
    if (mainRole.includes('DESARROLLADOR') || mainRole.includes('DEVELOPER')) return 'code';
    if (mainRole.includes('USER')) return 'person';

    return 'person';
  }

  getUserRoleDisplay(): string {
    const user = this.authService.currentUser();
    if (!user || !user.roles || user.roles.length === 0) {
      return 'USUARIO';
    }

    const mainRole = user.roles[0].toUpperCase();

    // LÓGICA DE NOMBRES EN MAYÚSCULA
    if (mainRole.includes('ROLE_SUPERADMIN') || mainRole.includes('SUPERADMIN')) return 'SUPER ADMIN';
    if (mainRole.includes('ROLE_ADMIN') || mainRole.includes('ADMIN')) return 'ADMINISTRADOR';
    if (mainRole.includes('GERENTE')) return 'GERENTE';
    if (mainRole.includes('SUPERVISOR')) return 'SUPERVISOR';
    if (mainRole.includes('PANADERO')) return 'PANADERO';
    if (mainRole.includes('CAJERO')) return 'CAJERO';
    if (mainRole.includes('COLABORADOR')) return 'COLABORADOR';
    if (mainRole.includes('DESARROLLADOR') || mainRole.includes('DEVELOPER')) return 'DESARROLLADOR';
    if (mainRole.includes('ROLE_USER') || mainRole.includes('USER')) return 'USUARIO';

    // Si no coincide con ninguno, mostrar en mayúscula sin prefijos
    return mainRole.replace('ROLE_', '').replace('_', ' ');
  }

  // En sidebar.ts - método getUserName()
  getUserName(): string {
    const user = this.authService.currentUser();

    // ✅ CORRECCIÓN: Extraer solo la parte del username del email
    if (user?.username && user.username.trim() !== '') {
      // Si el username es un email, mostrar solo la parte antes del @
      return user.username.split('@')[0]; // ← Esto mostrará "victor_2202"
    }

    return 'Usuario';
  }
}