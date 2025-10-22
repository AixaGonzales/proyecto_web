// src/app/core/services/auth.service.ts
import { Injectable, signal, computed, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User } from '../interfaces/user';
import { LoginRequest, LoginResponse, RegisterRequest, AuthResponse } from '../interfaces/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private readonly AUTH_KEY = 'panaderia_auth_data';

  private currentUserSignal = signal<User | null>(null);

  public currentUser = computed(() => this.currentUserSignal());
  public isAuthenticated = computed(() => !!this.currentUserSignal());
  public userRoles = computed(() => this.currentUserSignal()?.roles || []);

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject('PLATFORM_ID') private platformId: any
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAuth();
    }
  }

  
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const url = `${environment.authUrl}/login`;

    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap({
        next: (response) => {
          console.log('🔍 Respuesta del login:', response);
          this.handleLoginSuccess(response);
        },
        error: (error) => this.handleLoginError(error)
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    const url = `${environment.authUrl}/register`;
    return this.http.post<AuthResponse>(url, userData);
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  hasRole(role: string): boolean {
    return this.userRoles().some(userRole =>
      userRole.toUpperCase().includes(role.toUpperCase())
    );
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  getToken(): string | null {
    return this.currentUserSignal()?.token || null;
  }

  private initializeAuth(): void {
    try {
      const authData = localStorage.getItem(this.AUTH_KEY);
      if (authData) {
        const user: User = JSON.parse(authData);
        console.log('📂 Usuario cargado desde cache:', user);
        this.currentUserSignal.set(user);
      }
    } catch (error) {
      console.error('Error parsing auth data:', error);
      this.clearAuthData();
    }
  }

  private handleLoginSuccess(response: LoginResponse): void {
    // ✅ CORRECCIÓN DEFINITIVA: Solo guardar username, NO email
    const user: User = {
      id: Date.now(),
      username: response.username, // ← Solo esto se mostrará
      roles: response.roles,
      token: response.token
    };

    console.log('✅ Usuario creado para mostrar:', user);
    this.currentUserSignal.set(user);

    if (isPlatformBrowser(this.platformId)) {
      this.saveAuthData(user);
    }
  }

  private handleLoginError(error: any): void {
    console.error('Authentication error:', error);
    this.clearAuthData();
  }

  private saveAuthData(user: User): void {
    try {
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
      console.log('💾 Usuario guardado en cache');
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  }
  

  private clearAuthData(): void {
    this.currentUserSignal.set(null);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(this.AUTH_KEY);
        console.log('🗑️ Cache limpiado');
      } catch (error) {
        console.error('Error clearing auth data:', error);
      }
    }
  }
}