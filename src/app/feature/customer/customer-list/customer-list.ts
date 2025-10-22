// src/app/feature/customer/customer-list/customer-list.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';

import { Observable, of, forkJoin, Subscription } from 'rxjs';
import { switchMap, map, catchError, tap } from 'rxjs/operators';

import { SearchFilter, CustomFilter } from '../../../shared/search-filter/search-filter';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer, Address } from '../../../core/interfaces/customer';

import Swal from 'sweetalert2';
import { TopBar } from "../../../layout/top-bar/top-bar";
import { CustomerDetails } from '../customer-details/customer-details';
import { CustomerEdit } from '../customer-edit/customer-edit';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    FormsModule,
    SearchFilter,
    TopBar,
    RouterModule,
  ],
  templateUrl: './customer-list.html',
  styleUrls: ['./customer-list.scss']
})
export class CustomerList implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  // ✅ USANDO SIGNALS
  customers = signal<Customer[]>([]);
  filteredCustomers = signal<Customer[]>([]);
  searchTerm = signal<string>('');
  currentFilter = signal<'all' | 'active' | 'inactive'>('active');
  isLoading = signal<boolean>(true);

  private subscriptions: Subscription = new Subscription();

  // Filtros configurables
  customerFilters: CustomFilter[] = [
    {
      key: 'documentType',
      label: 'Tipo de Documento',
      value: null,
      type: 'select',
      options: [
        { value: null, label: 'Todos los tipos' },
        { value: 'DNI', label: 'DNI' },
        { value: 'CÉDULA', label: 'Cédula' },
        { value: 'PASAPORTE', label: 'Pasaporte' }
      ],
      icon: 'badge'
    },
    {
      key: 'gender',
      label: 'Género',
      value: null,
      type: 'select',
      options: [
        { value: null, label: 'Todos los géneros' },
        { value: 'M', label: 'Masculino' },
        { value: 'F', label: 'Femenino' }
      ],
      icon: 'female'
    },
    {
      key: 'ageRange',
      label: 'Rango de Edad',
      value: { min: null, max: null },
      type: 'range',
      placeholder: 'edad',
      icon: 'cake'
    },
    {
      key: 'status',
      label: 'Estado',
      value: 'A',
      type: 'select',
      options: [
        { value: null, label: 'Todos los estados' },
        { value: 'A', label: 'Solo activos' },
        { value: 'I', label: 'Solo inactivos' }
      ],
      icon: 'circle'
    }
  ];

  ngOnInit(): void {
    // ✅ LOS DATOS VIENEN DEL RESOLVER
    this.loadCustomersFromResolver();

    // También nos suscribimos a cambios en tiempo real
    this.subscribeToCustomerUpdates();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ==================== CARGA DESDE RESOLVER ====================
  private loadCustomersFromResolver(): void {
    this.isLoading.set(true);

    const routeSub = this.route.data.subscribe(({ customers }) => {
      if (customers && Array.isArray(customers)) {
        this.processCustomers(customers);
      } else {
        // Fallback: cargar desde el servicio
        this.loadCustomersFromService();
      }
    });

    this.subscriptions.add(routeSub);
  }

  private loadCustomersFromService(): void {
    const serviceSub = this.customerService.customers$.subscribe((customers: Customer[]) => {
      this.processCustomers(customers);
    });
    this.subscriptions.add(serviceSub);
  }

  private subscribeToCustomerUpdates(): void {
    const updateSub = this.customerService.customers$.subscribe((customers: Customer[]) => {
      this.customers.set(customers);
      this.applyFilters();
    });
    this.subscriptions.add(updateSub);
  }

  // ==================== PROCESAR CLIENTES ====================
  private processCustomers(customers: Customer[]): void {
    console.log('🔄 Procesando', customers.length, 'clientes...');

    if (customers.length === 0) {
      this.handleNoCustomers();
      return;
    }

    this.customers.set(customers);
    this.applyFilters();
    this.isLoading.set(false);

    Swal.fire({
      icon: 'success',
      title: 'Clientes cargados',
      text: `Se cargaron ${customers.length} clientes`,
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }

  // ==================== MÉTODOS DE FILTRADO Y BÚSQUEDA ====================
  onSearchChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm.toLowerCase());
    this.applyFilters();
  }

  onCustomFilterChange(event: { key: string; value: any }): void {
    const filter = this.customerFilters.find(f => f.key === event.key);
    if (filter) {
      filter.value = event.value;

      if (filter.key === 'status') {
        if (filter.value === 'A') this.currentFilter.set('active');
        else if (filter.value === 'I') this.currentFilter.set('inactive');
        else this.currentFilter.set('all');
      }
    }
    this.applyFilters();
  }

  onClearAllFilters(): void {
    this.searchTerm.set('');
    this.currentFilter.set('active');

    this.customerFilters.forEach(filter => {
      if (filter.type === 'range') {
        filter.value = { min: null, max: null };
      } else if (filter.key === 'status') {
        filter.value = 'A';
      } else {
        filter.value = null;
      }
    });

    this.applyFilters();

    Swal.fire({
      icon: 'success',
      title: 'Filtros limpiados',
      text: 'Mostrando todos los clientes activos',
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }

  applyFilters(): void {
    let filtered = [...this.customers()];

    // Filtro por estado
    const statusFilter = this.customerFilters.find(f => f.key === 'status');
    if (statusFilter?.value) {
      filtered = filtered.filter(customer => customer.status === statusFilter.value);
    }

    // Filtro por búsqueda
    const search = this.searchTerm();
    if (search) {
      filtered = filtered.filter(customer =>
        this.customerMatchesSearch(customer, search)
      );
    }

    // Otros filtros personalizados
    filtered = this.applyCustomFilters(filtered);

    this.filteredCustomers.set(filtered);
  }

  private applyCustomFilters(customers: Customer[]): Customer[] {
    let filtered = customers;

    this.customerFilters.forEach(filter => {
      if (filter.key === 'status') return;

      if (filter.key === 'documentType' && filter.value) {
        filtered = filtered.filter(customer =>
          customer.documentType?.toUpperCase() === filter.value
        );
      }

      if (filter.key === 'gender' && filter.value) {
        filtered = filtered.filter(customer =>
          customer.gender?.toUpperCase() === filter.value
        );
      }

      if (filter.key === 'ageRange' && filter.value) {
        const min = filter.value.min;
        const max = filter.value.max;

        filtered = filtered.filter(customer => {
          if (!customer.age) return false;
          const age = customer.age;
          const minValid = min === null || min === '' || age >= min;
          const maxValid = max === null || max === '' || age <= max;
          return minValid && maxValid;
        });
      }
    });

    return filtered;
  }

  private customerMatchesSearch(customer: Customer, searchTerm: string): boolean {
    const searchableFields = [
      customer.firstName,
      customer.lastName,
      customer.documentNumber,
      customer.phone,
      customer.email,
      customer.address?.district,
      customer.address?.addrStreet,
      customer.address?.reference
    ];

    return searchableFields.some(field =>
      field?.toLowerCase().includes(searchTerm)
    );
  }

  // ==================== MÉTODOS DE TARJETAS INTERACTIVAS ====================
  showAllCustomers(): void {
    this.currentFilter.set('all');
    const statusFilter = this.customerFilters.find(f => f.key === 'status');
    if (statusFilter) {
      statusFilter.value = null;
    }
    this.applyFilters();
  }

  showActiveCustomers(): void {
    this.currentFilter.set('active');
    const statusFilter = this.customerFilters.find(f => f.key === 'status');
    if (statusFilter) {
      statusFilter.value = 'A';
    }
    this.applyFilters();
  }

  showInactiveCustomers(): void {
    this.currentFilter.set('inactive');
    const statusFilter = this.customerFilters.find(f => f.key === 'status');
    if (statusFilter) {
      statusFilter.value = 'I';
    }
    this.applyFilters();
  }

  getTotalCustomers(): number {
    return this.customers().length;
  }

  getActiveCustomersCount(): number {
    return this.customers().filter(c => c.status === 'A').length;
  }

  getInactiveCustomersCount(): number {
    return this.customers().filter(c => c.status !== 'A').length;
  }

  hasActiveFilters(): boolean {
    return this.searchTerm().trim() !== '' ||
      this.customerFilters.some(filter =>
        filter.key !== 'status' &&
        this.getFilterDisplayValue(filter)
      ) ||
      this.currentFilter() !== 'active';
  }

  hasActiveFiltersExceptStatus(): boolean {
    return this.searchTerm().trim() !== '' ||
      this.customerFilters.some(filter =>
        filter.key !== 'status' &&
        this.getFilterDisplayValue(filter)
      );
  }

  // ==================== MÉTODOS DE UTILIDAD PÚBLICOS ====================
  getGenderDisplay(gender: string | undefined): string {
    if (!gender) return 'No especificado';
    switch (gender.toUpperCase()) {
      case 'M': return 'Masculino';
      case 'F': return 'Femenino';
      default: return gender;
    }
  }

  getDocumentTypeDisplay(documentType: string | undefined): string {
    if (!documentType) return 'N/A';
    switch (documentType.toUpperCase()) {
      case 'DNI': return 'DNI';
      case 'CÉDULA': return 'Cédula';
      case 'PASAPORTE': return 'Pasaporte';
      default: return documentType;
    }
  }

  getFilterDisplayValue(filter: CustomFilter): string {
    if (filter.options && filter.value) {
      const option = filter.options.find(opt => opt.value === filter.value);
      return option ? option.label : filter.value;
    }

    if (filter.type === 'range') {
      const min = filter.value?.min;
      const max = filter.value?.max;
      if (min != null && min !== '' && max != null && max !== '') return `${min} - ${max}`;
      if (min != null && min !== '') return `Desde ${min}`;
      if (max != null && max !== '') return `Hasta ${max}`;
      return '';
    }

    return filter.value?.toString() || '';
  }

  formatBirthDate(birthDate: string | Date): string {
    if (!birthDate) return 'N/A';

    const date = new Date(birthDate);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // ==================== MÉTODOS DE ACCIONES ====================
  reportPdf(): void {
    this.isLoading.set(true);

    this.customerService.reportPdf().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-clientes-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isLoading.set(false);

        Swal.fire({
          icon: 'success',
          title: 'Reporte descargado',
          text: 'El reporte PDF se ha descargado correctamente',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      },
      error: (error: any) => {
        console.error('Error al descargar reporte PDF:', error);
        this.isLoading.set(false);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo descargar el reporte PDF',
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    });
  }

  openDetailsDialog(customerId: number): void {
    this.customerService.getCustomerById(customerId).subscribe({
      next: (customer) => {
        this.dialog.open(CustomerDetails, {
          width: '600px',
          data: { customer }
        });
      },
      error: (error: any) => {
        console.error('Error al cargar detalles del cliente:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los detalles del cliente',
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    });
  }

  openEditDialog(customerId: number, currentStatus: string): void {
    if (currentStatus !== 'A') {
      Swal.fire({
        icon: 'warning',
        title: 'Cliente inactivo',
        text: 'No se puede editar un cliente inactivo',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      return;
    }

    this.customerService.getCustomerById(customerId).subscribe({
      next: (customer) => {
        const dialogRef = this.dialog.open(CustomerEdit, {
          width: '700px',
          data: { customer }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result === 'success') {
            this.customerService.loadCustomers();
            Swal.fire({
              icon: 'success',
              title: 'Cliente actualizado',
              text: 'Los datos del cliente se actualizaron correctamente',
              timer: 2000,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
            });
          }
        });
      },
      error: (error: any) => {
        console.error('Error al cargar datos del cliente para editar:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos del cliente',
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    });
  }

  deleteCustomer(customerId: number): void {
    Swal.fire({
      title: '¿Desactivar cliente?',
      text: 'El cliente se marcará como inactivo pero no se eliminará del sistema',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.customerService.softDeleteCustomer(customerId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Cliente desactivado',
              text: 'El cliente ha sido marcado como inactivo',
              timer: 2000,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
            });
          },
          error: (error: any) => {
            console.error('Error al desactivar cliente:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo desactivar el cliente',
              timer: 3000,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
            });
          }
        });
      }
    });
  }

  restoreCustomer(customerId: number): void {
    Swal.fire({
      title: '¿Reactivar cliente?',
      text: 'El cliente se volverá a marcar como activo en el sistema',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.customerService.restoreCustomer(customerId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Cliente reactivado',
              text: 'El cliente ha sido marcado como activo nuevamente',
              timer: 2000,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
            });
          },
          error: (error: any) => {
            console.error('Error al reactivar cliente:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo reactivar el cliente',
              timer: 3000,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
            });
          }
        });
      }
    });
  }

  trackById(index: number, customer: Customer): number {
    return customer.idCustomer!;
  }

  // ==================== MANEJO DE ERRORES ====================
  private handleNoCustomers(): void {
    this.customers.set([]);
    this.filteredCustomers.set([]);
    this.isLoading.set(false);

    Swal.fire({
      icon: 'info',
      title: 'Sin clientes',
      text: 'No hay clientes registrados en el sistema.',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }
}