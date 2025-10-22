// src/app/features/auth/login/login.component.ts
import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

// Services
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/interfaces/auth';

// SweetAlert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoading = signal(false);
  hidePassword = signal(true);

  private returnUrl: string = '/';
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.createLoginForm();
  }

  ngOnInit(): void {
    // Obtener la URL de retorno si existe
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.returnUrl = params['returnUrl'] || '/';
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Maneja el envío del formulario de login
   */
  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    // ✅ CORREGIDO: Usar 'username' en lugar de 'email'
    const credentials: LoginRequest = {
      username: this.loginForm.get('username')?.value,  // ← CAMBIO AQUÍ
      password: this.loginForm.get('password')?.value
    };

    console.log('📤 Enviando credenciales:', credentials);

    this.authService.login(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.handleLoginSuccess(),
        error: (error) => this.handleLoginError(error)
      });
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  /**
   * Crea el formulario de login
   */
  private createLoginForm(): FormGroup {
    return this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Maneja el éxito del login
   */
  private handleLoginSuccess(): void {
    this.isLoading.set(false);

    Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: 'Inicio de sesión exitoso',
      confirmButtonText: 'Aceptar',
      timer: 1500,
      timerProgressBar: true,
    }).then(() => {
      this.router.navigateByUrl(this.returnUrl);
    });
  }

  /**
   * Maneja errores del login
   */
  private handleLoginError(error: any): void {
    this.isLoading.set(false);

    console.log('❌ Error completo:', error);

    const errorMessage = error.error?.message || error.error?.error || 'Error de autenticación';

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage,
      confirmButtonText: 'Aceptar'
    });

    // Resetear el campo de contraseña en caso de error
    this.loginForm.get('password')?.reset();
  }

  // Getters para fácil acceso a los controles del formulario
  get usernameControl() {
    return this.loginForm.get('username');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }
}