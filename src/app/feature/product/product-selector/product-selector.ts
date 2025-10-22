import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SearchFilter } from '../../../shared/search-filter/search-filter';
import { Product } from '../../../core/interfaces/product';

@Component({
  selector: 'app-product-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    SearchFilter,
  ],
  templateUrl: './product-selector.html',
  styleUrls: ['./product-selector.scss'],
})
export class ProductSelector implements OnInit, OnChanges {
  @Input() products: Product[] = [];
  @Output() productsSelected = new EventEmitter<Product[]>();
  @Output() cancel = new EventEmitter<void>();

  searchTerm = '';
  filteredProducts: Product[] = [];
  selectedProducts: Product[] = [];

  ngOnInit() {
    console.log('Productos recibidos en OnInit:', this.products);  // Verifica los productos que llegan
    this.filteredProducts = [...this.products];  // Inicializa los productos filtrados con los productos recibidos
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['products']) {
      this.filterProducts();
    }
  }

  filterProducts() {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = [...this.products];  // Si el término de búsqueda está vacío, muestra todos los productos
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredProducts = this.products.filter(p =>
        p.nameProduct.toLowerCase().includes(term) || (p.description?.toLowerCase().includes(term) ?? false)
      );
    }
    console.log('Productos filtrados:', this.filteredProducts);  // Verifica los productos filtrados
  }

  toggleSelect(product: Product) {
    const index = this.selectedProducts.findIndex(p => p.id === product.id);
    if (index === -1) {
      this.selectedProducts.push(product);  // Si no está seleccionado, lo agregamos
    } else {
      this.selectedProducts.splice(index, 1);  // Si ya está seleccionado, lo eliminamos
    }
  }

  isSelected(product: Product): boolean {
    return this.selectedProducts.some(p => p.id === product.id);
  }

  confirmSelection() {
    console.log('Productos seleccionados:', this.selectedProducts);  // Verifica los productos seleccionados
    this.productsSelected.emit(this.selectedProducts);
  }

  cancelSelection() {
    this.cancel.emit();
  }
}
