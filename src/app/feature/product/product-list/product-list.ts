import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { SearchFilterProduct } from '../../../shared/search-filter-product/search-filter-product';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces/product';

import { ProductForm } from '../product-form/product-form';

import Swal from 'sweetalert2';
import { ReusableButton } from '../../../shared/reusable-button/reusable-button';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ProductEdit } from '../product-edit/product-edit';
import { ProductDetails } from '../product-details/product-details'; // Ajusta esta ruta si es necesario
import { StatusTransformPipe } from '../../../core/pipes/status-transform.pipe';



// Importaciones RxJS necesarias
import { Observable, of, forkJoin } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { TopBar } from "../../../layout/top-bar/top-bar";


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatCardModule,
    MatDialogModule,
    SearchFilterProduct,
    FormsModule,
    RouterModule,
    StatusTransformPipe
  ],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss']
})
export class ProductList implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  filterValue = '';
  showDetailsDialog = false;
  selectedProduct: Product | null = null;

  // Declaración de columnas (que se mostrarán en el diálogo)
  fieldsToShow = [
    { label: 'Producto', key: 'nameProduct' },
    { label: 'Descripción', key: 'description' },
    { label: 'Precio', key: 'price' },
    { label: 'Categoría', key: 'category' },
    { label: 'Unidades', key: 'units' },
    { label: 'Fecha de Creación', key: 'creationDate' },
    { label: 'Estado', key: 'status' }
  ];

  constructor(
    private productService: ProductService,
    private dialog: MatDialog
  ) { }


  reportPdf() {
    Swal.fire({
      title: '¿Descargar Reporte?',
      text: '¿Estás seguro que deseas descargar el reporte de productos en formato PDF?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, descargar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Mostrar loader mientras se genera el PDF
        Swal.fire({
          title: 'Generando reporte...',
          html: 'Por favor espera mientras se genera el documento.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.productService.reportPdf().subscribe({
          next: (blob: Blob) => {
            Swal.close(); // Cerrar el loader
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Reporte de Productos.pdf';
            link.click();
            URL.revokeObjectURL(url);

            // Opcional: Notificación de éxito
            Swal.fire({
              icon: 'success',
              title: 'Descarga completada',
              text: 'El reporte se ha descargado correctamente.',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo generar el reporte. Por favor intenta nuevamente.',
              timer: 2000
            });
            console.error('Error al descargar el PDF:', err);
          }
        });
      }
    });
  }






































  ngOnInit(): void {
    // Verifica que el método loadProductsFromApi() esté en tu servicio
    this.productService.loadProductsFromApi();

    // Suscripción al observable products$ para obtener los productos
    this.productService.products$.subscribe((products: Product[]) => {
      this.products = products;
      this.applyFilters();
    });
  }

  trackById(index: number, product: Product): number {
    return product.id!;
  }

  handleSearch(term: string): void {
    this.searchTerm = term.toLowerCase();
    this.applyFilters();
  }

  handleFilter(filterValue: string): void {
    this.filterValue = filterValue;
    this.applyFilters();
  }

  handleClear(): void {
    this.searchTerm = '';
    this.filterValue = '';
    this.applyFilters();
  }



  private applyFilters(): void {
    let filtered = [...this.products];

    // Si no se selecciona un filtro, mostramos solo los productos activos
    if (this.filterValue === 'activo' || this.filterValue === '') {
      filtered = filtered.filter(p => p.status === 'A');
    } else if (this.filterValue === 'inactivo') {
      filtered = filtered.filter(p => p.status === 'I');
    }

    // Filtrado por el término de búsqueda
    if (this.searchTerm) {
      filtered = filtered.filter(p =>
        p.nameProduct?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.price?.toString().includes(this.searchTerm) ||
        p.units?.toString().includes(this.searchTerm)
      );
    }

    this.filteredProducts = filtered;
    this.filteredProducts = filtered.reverse();
  }


  openDetailsDialog(productId: number): void {
    if (!productId || isNaN(productId)) {
      console.error('ID de producto inválido');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ID de producto no válido',
        timer: 2000
      });
      return;
    }

    // Obtener los detalles del producto
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        const container = document.querySelector('.product-list-container');
        if (container) {
          container.classList.add('blur-active');
        }

        const dialogRef = this.dialog.open(ProductDetails, {  // Asegúrate de que el componente correcto esté importado
          width: '1000px',
          data: product,  // Pasa el producto en lugar del cliente
          panelClass: 'right-side-dialog',
          position: {
            right: '21%',
            top: '6%'
          },
          disableClose: false,
          autoFocus: false
        });

        dialogRef.afterClosed().subscribe(() => {
          this.applyFilters();
          if (container) {
            container.classList.remove('blur-active');
          }
        });
      },
      error: (err) => {
        console.error('Error cargando producto:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del producto',
          timer: 2000
        });
      }
    });
  }


  guardarCambios(updatedData: Product): void {
    this.productService.updateProduct(updatedData).subscribe({
      next: (updatedProduct) => {
        const index = this.products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          this.products[index] = { ...updatedProduct };
          this.applyFilters();
        }
        this.selectedProduct = { ...updatedProduct };
        this.closeDetailsDialog();
      },
      error: (err) => {
        console.error('Error actualizando producto:', err);
      }
    });
  }

  closeDetailsDialog(): void {
    this.showDetailsDialog = false;
    this.selectedProduct = null;
  }

  openEditDialog(productId: number, status: string): void {
    // Verificar primero si el producto está inactivo
    if (status !== 'A') {
      Swal.fire({
        icon: 'warning',
        title: 'Producto Inactivo',
        text: 'No se puede editar un producto en estado inactivo.',
        confirmButtonText: 'Entendido',
        timer: 3000
      });
      return;
    }

    // Obtener el producto por ID
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        const container = document.querySelector('.product-list-container');
        if (container) {
          container.classList.add('blur-active');
        }

        // Abrir el diálogo para editar el producto
        const dialogRef = this.dialog.open(ProductEdit, {
          width: '600px', // Ajustado para coincidir con el ancho de tu card
          maxWidth: '95vw',
          height: '90vh',
          maxHeight: '87vh',
          data: { product },
          panelClass: 'custom-edit-dialog',
          disableClose: false,
          autoFocus: false,
          position: {
            top: '3%',
            right: '19.5%'
          },
          hasBackdrop: true,
          backdropClass: 'custom-dialog-backdrop'
        });

        // Al cerrar el diálogo, restaurar el estado de la lista
        dialogRef.afterClosed().subscribe((updatedProduct?: Product) => {
          if (container) {
            container.classList.remove('blur-active');
          }
        });
      },
      error: (err) => {
        console.error('Error cargando producto:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del producto',
          timer: 2000
        });
      }
    });
  }

  restoreProduct(id: number): void {
    Swal.fire({
      title: '¿Restaurar producto?',
      text: '¿Deseas reactivar este producto?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16610E', // Verde oscuro que coincide con tu tema
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Busca el producto a restaurar
        const productToUpdate = this.products.find(p => p.id === id);
        if (!productToUpdate) return;  // Si no se encuentra el producto, no hace nada

        // Crea una copia del producto y cambia su estado a 'activo' (A)
        const updatedProduct: Product = { ...productToUpdate, status: 'A' };

        // Llamada al servicio para actualizar el estado del producto
        this.productService.updateProduct(updatedProduct).subscribe({
          next: (response) => {
            const index = this.products.findIndex(p => p.id === response.id);
            if (index !== -1) {
              // Actualiza el producto en la lista
              this.products[index] = response;
              this.applyFilters();  // Vuelve a aplicar los filtros para actualizar la vista
            }

            // Muestra un mensaje de éxito al restaurar el producto
            Swal.fire({
              icon: 'success',
              title: '¡Producto restaurado!',
              text: 'El producto se ha reactivado correctamente.',
              showConfirmButton: false,
              timer: 1500
            });
          },
          error: (err) => {
            console.error('Error restaurando producto:', err);
            Swal.fire({
              icon: 'error',
              title: '¡Error!',
              text: 'Hubo un error al restaurar el producto.',
              showConfirmButton: false,
              timer: 1500
            });
          }
        });
      }
    });
  }


  deleteProduct(id: number): void {
    // Muestra un SweetAlert2 de confirmación
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Una vez eliminado, no podrás recuperar este producto.',
      icon: 'warning',
      showCancelButton: true,  // Muestra el botón de cancelar
      confirmButtonColor: '#3085d6',  // Color del botón de confirmación
      cancelButtonColor: '#d33',  // Color del botón de cancelación
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma la eliminación
        const productToUpdate = this.products.find(p => p.id === id);
        if (!productToUpdate) return;

        const updatedProduct: Product = { ...productToUpdate, status: 'I' }; // Cambiar el estado del producto a inactivo

        this.productService.updateProduct(updatedProduct).subscribe({
          next: (response) => {
            // Encuentra el índice del producto eliminado y actualízalo
            const index = this.products.findIndex(p => p.id === response.id);
            if (index !== -1) {
              this.products[index] = response;  // Actualiza el producto con el nuevo estado
              this.applyFilters();  // Vuelve a aplicar los filtros para reflejar el cambio
            }

            // Muestra el SweetAlert con el mensaje de éxito
            Swal.fire({
              icon: 'success',
              title: '¡Producto eliminado!',
              text: 'El producto se ha desactivado correctamente.',
              showConfirmButton: false,
              timer: 1500 // Duración de la alerta
            });

            console.log('Producto desactivado correctamente:', response);
          },
          error: (err) => {
            console.error('Error desactivando producto:', err);

            // En caso de error, muestra el SweetAlert con el mensaje de error
            Swal.fire({
              icon: 'error',
              title: '¡Error!',
              text: 'Hubo un error al eliminar el producto.',
              showConfirmButton: false,
              timer: 1500 // Duración de la alerta
            });
          }
        });
      } else {
        // Si el usuario cancela la acción, muestra un mensaje de cancelación
        Swal.fire({
          icon: 'info',
          title: 'Cancelado',
          text: 'El producto no fue eliminado',
          showConfirmButton: false,
          timer: 1500 // Duración de la alerta
        });
      }
    });
  }
}
