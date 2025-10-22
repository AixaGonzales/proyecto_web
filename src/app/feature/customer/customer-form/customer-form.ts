// src/app/feature/customer/customer-form/customer-form.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { ReusableButton } from '../../../shared/reusable-button/reusable-button';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer, Address } from '../../../core/interfaces/customer';
import Swal from 'sweetalert2';
import { InfoColumn } from '../../../shared/info-column/info-column';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    ReusableButton,
    RouterModule,
    InfoColumn
  ],
  templateUrl: './customer-form.html',
  styleUrls: ['./customer-form.scss'],
})
export class CustomerForm {
  customer: Partial<Customer> = {
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 'Seleccione género',
    documentType: undefined,
    documentNumber: '',
    phone: '',
    address: {
      district: '',
      addrStreet: '',
      numberHouse: '',
      placeType: '',
      reference: ''
    },
    registrationDate: new Date(),
    email: '',
    status: 'A',
    notes: 'Cliente nuevo',
  };

  selectedDocument: string | null = null;
  selectedDocumentLabel = '';
  private notesManuallyChanged = false;

  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' | 'warning' = 'info';

  documentTypes = [
    { value: 'DNI', viewValue: 'DNI' },
    { value: 'CEDULA', viewValue: 'Cédula' },
    { value: 'PASAPORTE', viewValue: 'Pasaporte' },
  ];

  documentMinLength = 8;
  documentMaxLength = 8;
  documentPattern = '[0-9]+';
  documentPlaceholder = 'Ingrese número';

  genderOptions = [
    { value: 'Seleccione género', viewValue: 'Seleccione género', disabled: true },
    { value: 'M', viewValue: 'Masculino' },
    { value: 'F', viewValue: 'Femenino' },
  ];

  isSubmitting: boolean = false;

  maxBirthDate = new Date();
  minBirthDate = new Date(
    this.maxBirthDate.getFullYear() - 99,
    this.maxBirthDate.getMonth(),
    this.maxBirthDate.getDate()
  );
  adultBirthDate = new Date(
    this.maxBirthDate.getFullYear() - 18,
    this.maxBirthDate.getMonth(),
    this.maxBirthDate.getDate()
  );

  phoneError: string = '';

  constructor(
    private customerService: CustomerService,
    private router: Router
  ) { }

  validateBirthDate(): boolean {
    if (!this.customer.birthDate) return false;

    const birthDate = new Date(this.customer.birthDate);
    return birthDate <= this.adultBirthDate && birthDate >= this.minBirthDate;
  }

  calculateAge(birthDate: string | Date): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  updateDocumentType() {
    switch (this.selectedDocument) {
      case 'DNI':
        this.documentMinLength = 8;
        this.documentMaxLength = 8;
        this.documentPattern = '^[0-9]{8}$';
        this.documentPlaceholder = 'Ingrese su DNI';
        this.selectedDocumentLabel = 'DNI';
        break;
      case 'CEDULA':
        this.documentMinLength = 8;
        this.documentMaxLength = 12;
        this.documentPattern = '^[0-9]{8,12}$';
        this.documentPlaceholder = 'Ingrese su Cédula';
        this.selectedDocumentLabel = 'Cédula';
        break;
      case 'PASAPORTE':
        this.documentMinLength = 9;
        this.documentMaxLength = 9;
        this.documentPattern = '^[a-zA-Z0-9]{9}$';
        this.documentPlaceholder = 'Ingrese su Pasaporte';
        this.selectedDocumentLabel = 'Pasaporte';
        this.formatDocumentToUpperCase();
        break;
      default:
        this.resetDocumentValidation();
    }
  }

  checkDocumentLength() {
    if (!this.customer.documentNumber || !this.selectedDocument) return;

    const length = this.customer.documentNumber.length;

    if (this.selectedDocument === 'DNI' && length !== 8) {
      // El mensaje de error ya se muestra en el HTML
    } else if (this.selectedDocument === 'CEDULA' && (length < 8 || length > 12)) {
      // El mensaje de error ya se muestra en el HTML
    } else if (this.selectedDocument === 'PASAPORTE' && length !== 9) {
      // El mensaje de error ya se muestra en el HTML
    }
  }

  private resetDocumentValidation() {
    this.documentMinLength = 8;
    this.documentMaxLength = 8;
    this.documentPattern = '[0-9]+';
    this.documentPlaceholder = 'Ingrese número';
    this.selectedDocumentLabel = '';
  }

  clearDocumentSelection() {
    this.selectedDocument = null;
    this.selectedDocumentLabel = '';
    this.customer.documentNumber = '';
  }

  onFieldChange(form: NgForm) {
    this.phoneError = '';

    if (form.controls['phone']) {
      form.controls['phone'].markAllAsTouched();
    }

    if (form.controls['documentNumber']) {
      form.controls['documentNumber'].markAsTouched();
    }

    this.checkDocumentLength();

    if (this.selectedDocument === 'PASAPORTE' && this.customer.documentNumber) {
      this.customer.documentNumber = this.customer.documentNumber.toUpperCase();
      this.customer.documentNumber = this.removeAccents(this.customer.documentNumber);
    }
  }

  onNotesChange() {
    this.notesManuallyChanged = true;
  }

  onSubmit(form: NgForm) {
    this.clearAlert();

    Object.keys(form.controls).forEach((key) => {
      form.controls[key].markAsTouched();
    });

    if (!this.customer.birthDate || !this.validateBirthDate()) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha de nacimiento inválida',
        text: 'La edad debe estar entre 18 y 99 años.',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }

    if (this.customer.firstName && /\s{2,}/.test(this.customer.firstName)) {
      Swal.fire({
        icon: 'error',
        title: 'Nombre inválido',
        text: 'El nombre no debe tener espacios consecutivos.',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }

    if (this.customer.lastName && /\s{2,}/.test(this.customer.lastName)) {
      Swal.fire({
        icon: 'error',
        title: 'Apellido inválido',
        text: 'El apellido no debe tener espacios consecutivos.',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }

    if (this.customer.gender === 'Seleccione género') {
      Swal.fire({
        icon: 'error',
        title: 'Género inválido',
        text: 'El género es requerido.',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }

    if (this.customer.phone?.length !== 9) {
      Swal.fire({
        icon: 'error',
        title: 'Teléfono inválido',
        text: 'El teléfono debe tener exactamente 9 dígitos.',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }

    if (!this.validateEmailLengthAndFormat(this.customer.email || '')) {
      Swal.fire({
        icon: 'error',
        title: 'Correo electrónico inválido',
        text: 'El correo electrónico no es válido.',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }

    if (this.selectedDocument && this.customer.documentNumber?.length) {
      const documentLength = this.customer.documentNumber.length;
      if (this.selectedDocument === 'DNI' && documentLength !== 8) {
        Swal.fire({
          icon: 'error',
          title: 'DNI inválido',
          text: 'El número de DNI debe tener exactamente 8 dígitos.',
          confirmButtonText: 'Aceptar',
          timer: 3000,
          timerProgressBar: true
        });
        return;
      }

      if (this.selectedDocument === 'PASAPORTE' && documentLength !== 9) {
        Swal.fire({
          icon: 'error',
          title: 'Pasaporte inválido',
          text: 'El número de pasaporte debe tener exactamente 9 caracteres alfanuméricos.',
          confirmButtonText: 'Aceptar',
          timer: 3000,
          timerProgressBar: true
        });
        return;
      }

      if (this.selectedDocument === 'CEDULA' && (documentLength < 8 || documentLength > 12)) {
        Swal.fire({
          icon: 'error',
          title: 'Cédula inválida',
          text: 'El número de cédula debe tener entre 8 y 12 dígitos.',
          confirmButtonText: 'Aceptar',
          timer: 3000,
          timerProgressBar: true
        });
        return;
      }
    }

    if (form.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.customer.documentType = this.selectedDocument ?? undefined;

      this.customerService.createCustomer(this.customer as Customer).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Cliente registrado correctamente',
            text: 'El cliente ha sido registrado en el sistema.',
            confirmButtonText: 'Aceptar',
            timer: 3000,
            timerProgressBar: true
          }).then(() => {
            this.router.navigate(['/customers']);
          });
          
          form.resetForm();
          this.resetCustomer();
          form.controls['notes'].setValue('Cliente nuevo');

          Object.keys(form.controls).forEach((key) => {
            form.controls[key].markAsPristine();
            form.controls[key].markAsUntouched();
          });

          form.controls['phone'].setValue('');
          form.controls['phone'].setErrors(null);

          this.isSubmitting = false;
        },
        error: (err) => {
          if (err.status === 500) {
            Swal.fire({
              icon: 'error',
              title: 'Error al registrar cliente',
              text: 'Hubo un problema al registrar el cliente. Por favor, intente nuevamente.',
              confirmButtonText: 'Aceptar',
              timer: 3000,
              timerProgressBar: true
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error desconocido',
              text: 'Por favor, intente nuevamente más tarde.',
              confirmButtonText: 'Aceptar',
              timer: 3000,
              timerProgressBar: true
            });
          }
          this.isSubmitting = false;
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Hay campos obligatorios sin completar. Por favor, revisa el formulario.',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true
      });
      Object.keys(form.controls).forEach((key) => {
        form.controls[key].markAsTouched();
      });
    }
  }

  resetCustomer() {
    this.customer = {
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: 'Seleccione género',
      documentType: undefined,
      documentNumber: '',
      phone: '',
      address: {
        district: '',
        addrStreet: '',
        numberHouse: '',
        placeType: '',
        reference: ''
      },
      registrationDate: new Date(),
      email: '',
      status: 'A',
      notes: 'Cliente nuevo',
    };

    this.selectedDocument = null;
    this.selectedDocumentLabel = '';
    this.documentMinLength = 8;
    this.documentMaxLength = 8;
    this.documentPattern = '[0-9]+';
    this.documentPlaceholder = 'Ingrese número';
  }

  resetForm(form: NgForm) {
    form.resetForm({
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: 'Seleccione género',
      documentNumber: '',
      phone: '',
      address: '',
      email: '',
      notes: 'Cliente nuevo'
    });

    this.selectedDocument = null;
    this.selectedDocumentLabel = '';

    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsPristine();
      form.controls[key].markAsUntouched();
    });

    Swal.fire({
      icon: 'info',
      title: 'Formulario limpiado',
      text: 'El formulario ha sido limpiado correctamente.',
      confirmButtonText: 'Aceptar',
      timer: 3000,
      timerProgressBar: true,
    });
  }

  private showAlert(message: string, type: 'success' | 'error' | 'info' | 'warning') {
    this.alertMessage = message;
    this.alertType = type;
  }

  private clearAlert() {
    this.alertMessage = '';
  }

  onAlertClosed() {
    this.clearAlert();
  }

  capitalizeFirstLetter(field: 'firstName' | 'lastName') {
    if (this.customer[field] && typeof this.customer[field] === 'string') {
      this.customer[field] = this.customer[field]
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  }

  validateNameInput(event: KeyboardEvent) {
    const key = event.key;
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]$/.test(key)) {
      event.preventDefault();
    }
  }

  validateEmailInput(event: KeyboardEvent) {
    const emailInput = event.target as HTMLInputElement;
    const email = emailInput.value;

    if (/ñ/.test(email) || /Ñ/.test(email)) {
      emailInput.setCustomValidity('invalidChar');
    } else {
      emailInput.setCustomValidity('');
    }
  }

  validateEmailLengthAndFormat(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  validatePasteName(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text') || '';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(pastedText)) {
      event.preventDefault();
    }
  }

  validateDocumentInput(event: KeyboardEvent) {
    const key = event.key;
    const normalizedKey = this.removeAccents(key);

    if (this.selectedDocument === 'DNI' || this.selectedDocument === 'CEDULA') {
      if (!/^\d$/.test(normalizedKey)) {
        event.preventDefault();
      }
    } else if (this.selectedDocument === 'PASAPORTE') {
      if (!/^[a-zA-Z0-9]$/.test(normalizedKey)) {
        event.preventDefault();
      }
    }
  }

  validatePasteDocument(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text') || '';

    if (this.selectedDocument === 'DNI' || this.selectedDocument === 'CEDULA') {
      if (!/^\d+$/.test(pastedText)) {
        event.preventDefault();
      }
    } else if (this.selectedDocument === 'PASAPORTE') {
      if (!/^[a-zA-Z0-9]+$/.test(pastedText)) {
        event.preventDefault();
      }
    }
  }

  formatDocumentToUpperCase() {
    if (this.selectedDocument === 'PASAPORTE' && this.customer.documentNumber) {
      this.customer.documentNumber = this.customer.documentNumber.toUpperCase();
      this.customer.documentNumber = this.removeAccents(this.customer.documentNumber);
    }
  }

  removeAccents(input: string): string {
    const accentsMap: { [key: string]: string } = {
      'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
      'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
      'à': 'a', 'è': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u',
      'À': 'A', 'È': 'E', 'Ì': 'I', 'Ò': 'O', 'Ù': 'U',
      'ñ': 'n', 'Ñ': 'N'
    };

    return input.split('').map(char => accentsMap[char] || char).join('');
  }

  validatePhoneInput(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const currentValue = input.value;

    if (currentValue.length === 0 && event.key !== '9') {
      event.preventDefault();
      this.phoneError = 'El número debe comenzar con 9';
    } else if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      this.phoneError = 'Solo se permiten números';
    } else {
      this.phoneError = '';
    }
  }

  validatePastePhone(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text') || '';
    if (!/^\d+$/.test(pastedText)) {
      event.preventDefault();
    }
  }

  isFormChanged(form: NgForm): boolean {
    const defaultValues = {
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: 'Seleccione género',
      documentNumber: '',
      phone: '',
      address: '',
      email: '',
      notes: 'Cliente nuevo'
    };

    const hasChanges = (Object.keys(defaultValues) as Array<keyof typeof defaultValues>).some(key => {
      const formValue = form.value[key];
      const defaultValue = defaultValues[key];

      return formValue !== defaultValue &&
        formValue !== null &&
        formValue !== undefined &&
        formValue !== '';
    });

    const hasDocumentChanges = this.selectedDocument !== null;

    return hasChanges || hasDocumentChanges;
  }

  isFormValid(): boolean {
    return (
      !!this.customer.firstName &&
      !!this.customer.lastName &&
      this.customer.gender !== 'Seleccione género' &&
      !!this.selectedDocument &&
      !!this.customer.documentNumber &&
      !!this.customer.phone &&
      !!this.customer.email &&
      !!this.customer.birthDate &&
      this.validateBirthDate() &&
      !!this.customer.notes &&
      !this.isSubmitting
    );
  }
}