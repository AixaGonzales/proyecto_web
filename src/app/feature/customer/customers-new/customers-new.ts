import { Component, inject, OnInit } from '@angular/core';
import { CustomerService } from '../../../core/services/customer.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { CustomerDetails } from '../customer-details/customer-details';
import { Customer } from '../../../core/interfaces/customer';

@Component({
  selector: 'app-customers-new',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './customers-new.html',
  styleUrls: ['./customers-new.scss']
})
export class CustomersNew implements OnInit {
  customers: Customer[] = [];
  customerCount: number = 0; // Añade esta propiedad
  private customerService = inject(CustomerService);

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

loadCustomers(): void {
  this.customerService.getNewCustomers().subscribe({
    next: (data) => {
      this.customers = data.sort((a, b) => b.idCustomer! - a.idCustomer!); // Orden descendente por ID
      this.customerCount = data.length;
    },
    error: (err) => {
      console.error('Error loading customers:', err);
    }
  });
}

  openCustomerDetails(customer: Customer): void {
    this.dialog.open(CustomerDetails, {
      width: '600px',
      maxHeight: '90vh',
      data: customer,
      panelClass: 'customer-details-dialog',
      autoFocus: false
    });
  }
}