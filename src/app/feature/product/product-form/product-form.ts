import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces/product';
import { ReusableButton} from '../../../shared/reusable-button/reusable-button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    ReusableButton,
    RouterModule,
  ],
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.scss']
})
export class ProductForm implements OnInit {
  productForm!: FormGroup;
  isSubmitting: boolean = false;  // Asegúrate de tener esta propiedad
  selectedCategory: string | null = null;
  selectedCategoryLabel = '';

  category = [
    { value: 'A', viewValue: 'A' },
    { value: 'B', viewValue: 'B' },
    { value: 'C', viewValue: 'C' },
  ];

  constructor(private fb: FormBuilder, private productService: ProductService) { }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      nameProduct: ['', [Validators.required, Validators.minLength(3)]],
      price: [null, [Validators.required, this.positiveNumberValidator]],
      category: [null, Validators.required],
      units: [null, [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      creationDate: ['', Validators.required],
      status: ['A']
    });
  }

  // Validar si el formulario es válido
  isFormValid(): boolean {
    return this.productForm.valid;
  }

  // Resetear el formulario
  resetForm(): void {
    this.productForm.reset();  // Restablecer los valores del formulario
    this.productForm.patchValue({ status: 'A' });  // Opcional: restablecer el valor de 'status' a 'A'
    this.selectedCategory = null;
    this.selectedCategoryLabel = '';
    Swal.fire({
      icon: 'info',
      title: 'Formulario limpiado',
      text: 'El formulario ha sido limpiado correctamente.',
      confirmButtonText: 'Aceptar',
      timer: 3000,
      timerProgressBar: true,
    });
  }


  isFormChanged(): boolean {
  // Verifica si el formulario ha sido modificado comparando los valores
  return this.productForm.dirty; // 'dirty' es true si el formulario ha cambiado
}

  // Validador personalizado para el precio
  positiveNumberValidator(control: AbstractControl): ValidationErrors | null {
    return control.value && control.value > 0 ? null : { positiveNumber: 'El precio debe ser un número positivo' };
  }

  // Método de envío del formulario
  onSubmit(): void {
    if (this.productForm.valid) {
      this.isSubmitting = true;  // Cambiar el estado a "enviando"

      const product: Product = this.productForm.value;
      this.productService.createProduct(product).subscribe(
        () => {
          this.resetForm();
          this.selectedCategory = null;
          this.selectedCategoryLabel = '';
          this.productForm.markAsPristine();
          this.productForm.markAsUntouched();
          this.productForm.updateValueAndValidity();
          this.isSubmitting = false;  // Cambiar el estado a "no enviando"

          Swal.fire({
            icon: 'success',
            title: 'Producto creado correctamente',
            text: 'El producto ha sido creado en el sistema.',
            confirmButtonText: 'Aceptar',
            timer: 3000,
            timerProgressBar: true
          });
        },
        (error) => {
          this.isSubmitting = false;  // Cambiar el estado a "no enviando"
          console.error('Error al crear el producto:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error al crear el producto',
            text: 'Ha ocurrido un error al crear el producto en el sistema.',
            confirmButtonText: 'Aceptar'
          });
        }
      );
    }
  }

  // Lógica para manejar el cambio de categoría
  clearDocumentSelection() {
    this.selectedCategory = null;
    this.selectedCategoryLabel = '';
  }

  // Redes sociales
  openWhatsApp() {
    const phoneNumber = '51930574584';
    const message = 'Hola, tengo un problema con el sistema de ventas.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURI(message)}`;
    window.open(url, '_blank');
  }

  openGmail() {
    const subject = 'Problema con el sistema de ventas';
    const body = 'Hola, tengo un problema con el sistema de ventas.';
    const url = `mailto:support@panaderia.com?subject=${encodeURI(subject)}&body=${encodeURI(body)}`;
    window.open(url, '_blank');
  }

  openFacebook() {
    const url = 'https://www.facebook.com/messages/t/yourpage';
    window.open(url, '_blank');
  }
}
