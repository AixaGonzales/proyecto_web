// src/app/feature/customer/customer-edit/customer-edit.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Customer } from '../../../core/interfaces/customer';
import { CustomerService } from '../../../core/services/customer.service';
import Swal from 'sweetalert2';

import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-customer-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule
  ],
  templateUrl: './customer-edit.html',
  styleUrls: ['./customer-edit.scss']
})
export class CustomerEdit implements OnInit {
  customerForm: FormGroup;
  loading = false;

  notesOptions = [
    'Cliente nuevo',
    'Prefiere contacto telefónico',
    'Prefiere contacto por WhatsApp',
    'Cliente potencial',
    'Cliente difícil',
    'Cliente con habilidades especiales'
  ];

  constructor(
    public dialogRef: MatDialogRef<CustomerEdit>,
    @Inject(MAT_DIALOG_DATA) public data: { customer: Customer },
    private customerService: CustomerService,
    private fb: FormBuilder
  ) {
    this.customerForm = this.fb.group({
      firstName: [this.capitalizeFirstLetter(data.customer.firstName), [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ][a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/),
        this.maxSpacesValidator(2),
        (control: AbstractControl) => {
          const value = control.value;
          if (value && value.trim().length < 2) {
            return { minLength: true };
          }
          return null;
        }
      ]],
      lastName: [this.capitalizeFirstLetter(data.customer.lastName), [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ][a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/),
        this.maxSpacesValidator(3),
        (control: AbstractControl) => {
          const value = control.value;
          if (value && value.trim().length < 2) {
            return { minLength: true };
          }
          return null;
        }
      ]],
      birthDate: [data.customer.birthDate, Validators.required],
      gender: [data.customer.gender, Validators.required],
      documentType: [data.customer.documentType, Validators.required],
      documentNumber: [data.customer.documentNumber, [
        Validators.required,
        Validators.pattern(/^[0-9]{8,11}$/)
      ]],
      phone: [data.customer.phone, [
        Validators.required,
        Validators.pattern(/^9\d{8}$/),
        Validators.minLength(9),
        Validators.maxLength(9)
      ]],
      email: [data.customer.email, [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        Validators.maxLength(100)
      ]],
      notes: [data.customer.notes || '', [
        Validators.maxLength(200)
      ]],
      district: [data.customer.address?.district || '', Validators.required],
      addrStreet: [data.customer.address?.addrStreet || '', Validators.required],
      numberHouse: [data.customer.address?.numberHouse || '', Validators.required],
      placeType: [data.customer.address?.placeType || 'Casa', Validators.required],
      reference: [data.customer.address?.reference || '']
    });
  }

  ngOnInit(): void { }

  formatNameToTitleCase(controlName: string) {
    const control = this.customerForm.get(controlName);
    if (control) {
      let value = control.value;

      if (!value) {
        return;
      }

      value = value.trim();

      value = value.toLowerCase()
        .split(' ')
        .filter((word: string) => word.length > 0)
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      control.setValue(value);
    }
  }

  maxSpacesValidator(max: number) {
    return (control: AbstractControl) => {
      const value = control.value || '';
      const spaces = value.split(' ').length - 1;
      return spaces <= max ? null : { maxSpaces: true };
    };
  }

  capitalizeFirstLetter(value: string): string {
    if (!value) return '';

    return value.trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  blockInvalidChars(event: KeyboardEvent, type: 'letters' | 'numbers' | 'phone') {
    if (type === 'letters') {
      const input = event.target as HTMLInputElement;
      const cursorPos = input.selectionStart;

      if (cursorPos === 0 && event.key === ' ') {
        event.preventDefault();
        return;
      }

      const allowedChars = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;
      if (!allowedChars.test(event.key) && !this.isControlKey(event)) {
        event.preventDefault();
      }
    } else if (type === 'numbers') {
      const allowedChars = /^[0-9]$/;
      if (!allowedChars.test(event.key) && !this.isControlKey(event)) {
        event.preventDefault();
      }
    } else if (type === 'phone') {
      const input = event.target as HTMLInputElement;
      const allowedChars = /^[0-9]$/;

      if (input.value.length === 0 && event.key !== '9') {
        event.preventDefault();
        return;
      }

      if (input.value.length >= 9 && !this.isControlKey(event)) {
        event.preventDefault();
        return;
      }

      if (!allowedChars.test(event.key) && !this.isControlKey(event)) {
        event.preventDefault();
      }
    }
  }

  private isControlKey(event: KeyboardEvent): boolean {
    return [
      'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight',
      'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'
    ].includes(event.key);
  }

  updateCustomer(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();

      const requiredFields = {
        'firstName': 'Nombre',
        'lastName': 'Apellido',
        'birthDate': 'Fecha de nacimiento',
        'gender': 'Género',
        'documentType': 'Tipo de documento',
        'documentNumber': 'Número de documento',
        'phone': 'Teléfono',
        'district': 'Distrito',
        'addrStreet': 'Calle/Avenida',
        'numberHouse': 'Número',
        'placeType': 'Tipo de lugar'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([field]) => this.customerForm.get(field)?.errors?.['required'])
        .map(([_, name]) => name);

      if (missingFields.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos obligatorios',
          html: `Los siguientes campos son requeridos:<br><strong>${missingFields.join(', ')}</strong>`,
          timer: 2500
        });
      }
      return;
    }

    const updatedCustomer = {
      idCustomer: this.data.customer.idCustomer,
      firstName: this.capitalizeFirstLetter(this.customerForm.value.firstName),
      lastName: this.capitalizeFirstLetter(this.customerForm.value.lastName),
      birthDate: this.customerForm.value.birthDate,
      gender: this.customerForm.value.gender,
      documentType: this.customerForm.value.documentType,
      documentNumber: this.customerForm.value.documentNumber,
      phone: this.customerForm.value.phone,
      email: this.customerForm.value.email,
      notes: this.customerForm.value.notes || null,
      registrationDate: this.data.customer.registrationDate,
      status: this.data.customer.status,
      address: {
        idAddress: this.data.customer.address?.idAddress || 0,
        district: this.customerForm.value.district,
        addrStreet: this.customerForm.value.addrStreet,
        numberHouse: this.customerForm.value.numberHouse,
        placeType: this.customerForm.value.placeType,
        reference: this.customerForm.value.reference
      }
    };

    this.loading = true;

    Swal.fire({
      title: '¿Actualizar cliente?',
      text: '¿Está seguro que desea guardar los cambios?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.customerService.updateCustomer(updatedCustomer).pipe(
          switchMap(updated =>
            this.customerService.getCustomerWithAge(updated.idCustomer!).pipe(
              map((customerWithAge: Customer & { age: number }) => ({ 
                ...updated, 
                age: customerWithAge.age 
              })),
              catchError(() => of({ ...updated, age: this.data.customer.age }))
            )
          )
        ).subscribe({
          next: (fullyUpdatedCustomer) => {
            this.loading = false;

            Swal.fire({
              icon: 'success',
              title: '¡Cliente actualizado!',
              text: 'Los cambios se guardaron correctamente.',
              showConfirmButton: false,
              timer: 1500
            });

            this.dialogRef.close(fullyUpdatedCustomer);
          },
          error: (err) => {
            this.loading = false;
            console.error('Error updating customer:', err);

            let errorMessage = 'No se pudo actualizar el cliente';
            if (err.status === 409) {
              errorMessage = 'El teléfono ya está registrado';
            } else if (err.status === 400) {
              errorMessage = 'Datos inválidos';
            } else if (err.status === 404) {
              errorMessage = 'Cliente no encontrado';
            }

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMessage,
              timer: 2500
            });
          }
        });
      } else {
        this.loading = false;
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}