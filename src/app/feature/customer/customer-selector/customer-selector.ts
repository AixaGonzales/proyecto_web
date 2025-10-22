// src/app/feature/customer/customer-selector/customer-selector.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Customer } from '../../../core/interfaces/customer';

@Component({
  selector: 'app-customer-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './customer-selector.html',
  styleUrls: ['./customer-selector.scss'],
})
export class CustomerSelector implements OnChanges {
  @Input() customers: Customer[] = [];
  @Input() selectedCustomer: Customer | null = null;
  @Output() customerSelected = new EventEmitter<Customer>();
  @Output() cancel = new EventEmitter<void>();

  searchTerm = '';
  filteredCustomers: Customer[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['customers']) {
      this.filterCustomers();
    }
  }

  handleSearch(event: any): void {
    this.searchTerm = event.target?.value || '';
    this.filterCustomers();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterCustomers();
  }

  filterCustomers(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      this.filteredCustomers = this.customers.filter(customer =>
        customer.firstName.toLowerCase().includes(term) ||
        customer.lastName.toLowerCase().includes(term) ||
        customer.email?.toLowerCase().includes(term) ||
        customer.documentNumber?.includes(term) ||
        customer.phone?.includes(term)
      );
    } else {
      this.filteredCustomers = [...this.customers];
    }
  }

  selectCustomer(customer: Customer): void {
    this.selectedCustomer = customer;
    this.customerSelected.emit(customer);
  }

  isSelected(customer: Customer): boolean {
    return this.selectedCustomer?.idCustomer === customer.idCustomer;
  }

  cancelSelection(): void {
    this.cancel.emit();
  }

  getCustomerImage(gender: string): string {
    const normalizedGender = gender.toLowerCase();
    if (normalizedGender === 'f' || normalizedGender === 'femenino') {
      return 'assets/images/female-avatar.png';
    } else {
      return 'assets/images/male-avatar.png';
    }
  }

  getGenderDisplay(gender: string): string {
    const normalizedGender = gender.toLowerCase();
    switch (normalizedGender) {
      case 'm':
      case 'masculino':
        return 'M';
      case 'f':
      case 'femenino':
        return 'F';
      default:
        return gender;
    }
  }

  getDocTypeDisplay(docType: string): string {
    const type = docType.trim().toLowerCase();
    switch (type) {
      case 'dni':
        return 'DNI';
      case 'cedula':
      case 'cédula':
        return 'CÉDULA';
      case 'pasaporte':
        return 'PASAPORTE';
      default:
        return docType.toUpperCase();
    }
  }
}