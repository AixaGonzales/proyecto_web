// src/app/core/services/customer.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, shareReplay, retry, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Customer, Address } from '../interfaces/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}${environment.endpoints.customer}`;

  // ✅ SIGNALS PARA ESTADO REACTIVO
  private customersSignal = signal<Customer[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // ✅ BEHAVIORSUBJECTS PARA COMPATIBILIDAD
  private customersSubject = new BehaviorSubject<Customer[]>([]);
  private newCustomersCountSubject = new BehaviorSubject<number>(0);
  private birthdayNotificationsSubject = new BehaviorSubject<{ today: Customer[], upcoming: Customer[] }>({
    today: [],
    upcoming: []
  });

  // ✅ OBSERVABLES PÚBLICOS - TODOS LOS QUE NECESITAS
  public customers$ = this.customersSubject.asObservable();
  public newCustomersCount$ = this.newCustomersCountSubject.asObservable();
  public birthdayNotifications$ = this.birthdayNotificationsSubject.asObservable();

  // Computed signals (derivados)
  public customers = this.customersSignal.asReadonly();
  public loading = this.loadingSignal.asReadonly();
  public error = this.errorSignal.asReadonly();

  // Computed para datos filtrados
  public activeCustomers = computed(() =>
    this.customers().filter(c => c.status === 'A')
  );

  public inactiveCustomers = computed(() =>
    this.customers().filter(c => c.status !== 'A')
  );

  public totalCustomers = computed(() => this.customers().length);

  constructor() {
    this.loadCustomers();
  }

  // ===== OPERACIONES CRUD =====

  loadCustomers(): void {
    if (this.loadingSignal()) return;

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http.get<Customer[]>(this.apiUrl).pipe(
      retry(2),
      catchError(error => this.handleError(error)),
      shareReplay(1)
    ).subscribe({
      next: (customers) => {
        const processedCustomers = this.processCustomers(customers);
        this.customersSignal.set(processedCustomers);
        this.customersSubject.next(processedCustomers); // ✅ Actualizar BehaviorSubject
        this.updateNewCustomersCount(processedCustomers);
        this.checkBirthdaysWithCustomers(processedCustomers);
        this.loadingSignal.set(false);
      },
      error: () => this.loadingSignal.set(false)
    });
  }

  getCustomerById(id: number): Observable<Customer> {
    this.loadingSignal.set(true);
    return this.http.get<Customer>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadingSignal.set(false)),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  createCustomer(customerData: any): Observable<Customer> {
    this.loadingSignal.set(true);

    const payload = {
      ...customerData,
      status: 'A',
      registrationDate: new Date().toISOString().split('T')[0]
    };

    return this.http.post<Customer>(`${this.apiUrl}/save`, payload).pipe(
      tap(newCustomer => {
        const processedCustomer = this.processSingleCustomer(newCustomer);
        this.customersSignal.update(customers => [...customers, processedCustomer]);
        this.customersSubject.next(this.customersSignal()); // ✅ Actualizar BehaviorSubject
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  updateCustomer(updatedCustomer: Customer): Observable<Customer> {
    this.loadingSignal.set(true);

    return this.http.put<Customer>(`${this.apiUrl}/update`, updatedCustomer).pipe(
      tap(updated => {
        const processedCustomer = this.processSingleCustomer(updated);
        this.customersSignal.update(customers =>
          customers.map(customer =>
            customer.idCustomer === processedCustomer.idCustomer ? processedCustomer : customer
          )
        );
        this.customersSubject.next(this.customersSignal()); // ✅ Actualizar BehaviorSubject
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  deleteCustomer(id: number): Observable<any> {
    this.loadingSignal.set(true);

    return this.http.patch<any>(`${this.apiUrl}/delete/${id}`, {}).pipe(
      tap(() => {
        this.customersSignal.update(customers =>
          customers.map(customer =>
            customer.idCustomer === id ? { ...customer, status: 'I' } : customer
          )
        );
        this.customersSubject.next(this.customersSignal()); // ✅ Actualizar BehaviorSubject
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  restoreCustomer(id: number): Observable<any> {
    this.loadingSignal.set(true);

    return this.http.patch<any>(`${this.apiUrl}/restore/${id}`, {}).pipe(
      tap(() => {
        this.customersSignal.update(customers =>
          customers.map(customer =>
            customer.idCustomer === id ? { ...customer, status: 'A' } : customer
          )
        );
        this.customersSubject.next(this.customersSignal()); // ✅ Actualizar BehaviorSubject
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  // ===== MÉTODOS NUEVOS PARA COMPATIBILIDAD =====

  getCustomerWithAge(id: number): Observable<Customer & { age: number }> {
    return this.getCustomerById(id).pipe(
      map(customer => {
        const age = this.calculateAge(customer.birthDate);
        return { ...customer, age };
      })
    );
  }

  loadNewCustomers(): void {
    this.getCustomersByStatus('A').subscribe(customers => {
      const newCustomers = customers.filter(c => this.isNewCustomer(c));
      this.newCustomersCountSubject.next(newCustomers.length);
    });
  }

  // ✅ CORREGIDO: Método público sin parámetros
  checkBirthdays(): void {
    // Si ya tenemos clientes cargados, usarlos
    if (this.customers().length > 0) {
      this.checkBirthdaysWithCustomers(this.customers());
    } else {
      // Si no, cargar clientes primero
      this.getAllCustomers().subscribe(customers => {
        const processedCustomers = this.processCustomers(customers);
        this.checkBirthdaysWithCustomers(processedCustomers);
      });
    }
  }

  // ===== MÉTODOS DE UTILIDAD =====

  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getCustomersByStatus(status: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/status/${status}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getCustomerAge(id: number): Observable<number> {
    return this.getCustomerById(id).pipe(
      map(customer => this.calculateAge(customer.birthDate)),
      catchError(() => of(0))
    );
  }

  private processCustomers(customers: Customer[]): Customer[] {
    return customers.map(customer => this.processSingleCustomer(customer));
  }

  private processSingleCustomer(customer: Customer): Customer {
    return {
      ...customer,
      age: this.calculateAge(customer.birthDate),
      address: this.normalizeAddress(customer.address)
    };
  }

  private calculateAge(birthDate: string | Date): number {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  private normalizeAddress(address: Address): Address {
    return {
      idAddress: address.idAddress || 0,
      district: address.district || 'No especificado',
      addrStreet: address.addrStreet || 'No especificado',
      numberHouse: address.numberHouse || 'N/A',
      placeType: address.placeType || 'No especificado',
      reference: address.reference || 'No especificado'
    };
  }

  private updateNewCustomersCount(customers: Customer[]): void {
    const newCustomers = customers.filter(c => this.isNewCustomer(c));
    this.newCustomersCountSubject.next(newCustomers.length);
  }

  // ✅ CORREGIDO: Método privado que recibe parámetros
  private checkBirthdaysWithCustomers(customers: Customer[]): void {
    const today: Customer[] = [];
    const upcoming: Customer[] = [];

    customers.forEach(customer => {
      if (this.isBirthdayToday(customer)) {
        today.push(customer);
      } else if (this.isBirthdayUpcoming(customer)) {
        upcoming.push(customer);
      }
    });

    this.birthdayNotificationsSubject.next({ today, upcoming });
  }

  private isNewCustomer(customer: Customer): boolean {
    // Lógica para determinar si es cliente nuevo (últimos 30 días)
    if (customer.registrationDate) {
      const registrationDate = new Date(customer.registrationDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return registrationDate >= thirtyDaysAgo;
    }
    return false;
  }

  private isBirthdayToday(customer: Customer): boolean {
    if (!customer.birthDate) return false;

    const today = new Date();
    const birthDate = new Date(customer.birthDate);
    return birthDate.getMonth() === today.getMonth() &&
      birthDate.getDate() === today.getDate();
  }

  private isBirthdayUpcoming(customer: Customer): boolean {
    if (!customer.birthDate) return false;

    const today = new Date();
    const birthDate = new Date(customer.birthDate);
    const upcomingDate = new Date(today);
    upcomingDate.setDate(today.getDate() + 7); // Próximos 7 días

    // Ajustar año para comparación
    birthDate.setFullYear(today.getFullYear());
    if (birthDate < today) {
      birthDate.setFullYear(today.getFullYear() + 1);
    }

    return birthDate <= upcomingDate && birthDate > today;
  }

  // ===== MÉTODOS DE COMPATIBILIDAD =====
  loadCustomersFromApi(): void {
    this.loadCustomers();
  }

  reportPdf(): Observable<Blob> {
    this.loadingSignal.set(true);
    return this.http.get(`${this.apiUrl}/pdf`, { responseType: 'blob' }).pipe(
      tap(() => this.loadingSignal.set(false)),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  softDeleteCustomer(id: number): Observable<any> {
    return this.deleteCustomer(id);
  }

  getUpcomingBirthdays(days: number = 7): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/upcoming-birthdays/${days}`).pipe(
      catchError(error => {
        console.error('Error obteniendo cumpleaños:', error);
        return of([]);
      })
    );
  }

  getNewCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customer-new`).pipe(
      catchError(error => {
        console.error('Error obteniendo nuevos clientes:', error);
        return of([]);
      })
    );
  }

  // ===== MANEJO DE ERRORES =====
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Error de conexión. Verifique su internet.';
          break;
        case 400:
          errorMessage = 'Datos inválidos. Verifique la información.';
          break;
        case 401:
          errorMessage = 'No autorizado. Por favor, inicie sesión.';
          break;
        case 403:
          errorMessage = 'No tiene permisos para esta acción.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 409:
          errorMessage = 'El cliente ya existe (documento o email duplicado).';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    this.errorSignal.set(errorMessage);
    console.error('Error en CustomerService:', error);
    return throwError(() => new Error(errorMessage));
  }
}