import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces/product';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';  // Asegúrate de importar Validators
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MatDividerModule } from '@angular/material/divider';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';



@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterModule,
    MatDividerModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,

  ],
  templateUrl: './product-edit.html',
  styleUrls: ['./product-edit.scss']
})
export class ProductEdit implements OnInit {
  productForm: FormGroup;
  loading = false;

  // Definimos las categorías y otras opciones
  category = [
    { value: 'A', viewValue: 'Panes' },
    { value: 'B', viewValue: 'Bocaditos' },
    { value: 'C', viewValue: 'Tortas' }
  ];

  constructor(
    public dialogRef: MatDialogRef<ProductEdit>,
    @Inject(MAT_DIALOG_DATA) public data: { product: Product },
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      nameProduct: [data.product.nameProduct, [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern('[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+')
      ]],
      price: [data.product.price, [
        Validators.required,
        Validators.min(0.50),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)  // Valida precios con hasta 2 decimales
      ]],
      description: [data.product.description, [
        Validators.required,
        Validators.maxLength(200)
      ]],
      category: [data.product.category, Validators.required],
      units: [data.product.units, [
        Validators.required,
        Validators.min(1)
      ]],
      creationDate: [data.product.creationDate, Validators.required],
      status: [data.product.status, Validators.required],
    });
  }

  ngOnInit(): void { }

  // Función para actualizar el producto
  updateProduct(): void {
    // Verificar si el formulario es válido
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();

      // Mostrar mensaje de error específico para campos requeridos
      const requiredFields = {
        'nameProduct': 'Nombre del Producto',
        'price': 'Precio',
        'description': 'Descripción',
        'category': 'Categoría',
        'units': 'Unidades',
        'status': 'Estado',
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([field]) => this.productForm.get(field)?.errors?.['required'])
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

    // Obtener los datos del formulario
    const formData = this.productForm.getRawValue();

    this.loading = true;
    const updatedProduct = { ...this.data.product, ...formData };

    // Mostrar confirmación antes de actualizar
    Swal.fire({
      title: '¿Actualizar producto?',
      text: '¿Está seguro que desea guardar los cambios?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Realizar la actualización
        this.productService.updateProduct(updatedProduct).subscribe({
          next: (result) => {
            this.loading = false;
            Swal.fire({
              icon: 'success',
              title: '¡Producto actualizado!',
              text: 'Los cambios se guardaron correctamente.',
              showConfirmButton: false,
              timer: 1500
            });
            this.dialogRef.close(result);
          },
          error: (err) => {
            this.loading = false;
            console.error('Error actualizando producto:', err);

            let errorMessage = 'No se pudo actualizar el producto';
            if (err.status === 409) {
              errorMessage = 'El producto ya existe';
            } else if (err.status === 400) {
              errorMessage = 'Datos inválidos enviados al servidor';
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
