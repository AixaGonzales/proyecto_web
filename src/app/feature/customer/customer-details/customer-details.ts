// src/app/feature/customer/customer-details/customer-details.ts
import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Customer } from '../../../core/interfaces/customer';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './customer-details.html',
  styleUrls: ['./customer-details.scss'],
  providers: [DatePipe]
})
export class CustomerDetails {
  constructor(
    public dialogRef: MatDialogRef<CustomerDetails>,
    @Inject(MAT_DIALOG_DATA) public customer: Customer,
    private datePipe: DatePipe
  ) { }

  closeDialog(): void {
    this.dialogRef.close();
  }

  getGenderText(gender?: string): string {
    if (!gender) return 'No especificado';
    const genderMap: Record<string, string> = {
      'M': 'Masculino',
      'F': 'Femenino',
    };
    return genderMap[gender] || gender;
  }

  calculateAge(birthDate: string | Date): number {
    if (!birthDate) return 0;

    const birthDateObj = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }

    return age;
  }

  formatDate(date: string | Date): string {
    if (!date) return 'No especificada';
    return this.datePipe.transform(date, 'dd/MM/yyyy') || 'Fecha inválida';
  }
}