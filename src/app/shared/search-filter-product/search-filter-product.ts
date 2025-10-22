import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-search-filter-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule
  ],

  templateUrl: './search-filter-product.html',
  styleUrl: './search-filter-product.scss'

})
export class SearchFilterProduct {
  @Input() placeholderText: string = 'Buscar...';
  @Input() showFilter: boolean = true;
  @Input() showExtraFilters: boolean = false;

  searchTerm = '';
  currentFilter: 'todos' | 'activo' | 'inactivo' = 'activo';
  currentDocType: string = 'todos';
  currentGender: string = 'todos';
  currentAgeRange: { min?: number, max?: number } | null = null;
  minAge: number = 18;
  maxAge: number = 99;
  minAgeError: string | null = null;
  maxAgeError: string | null = null;

  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<'todos' | 'activo' | 'inactivo'>();


  handleSearch(): void {
    this.searchChange.emit(this.searchTerm.trim());
  }

  applyFilter(filter: 'todos' | 'activo' | 'inactivo'): void {
    this.currentFilter = filter;
    this.filterChange.emit(filter);
  }




  confirmReset(): void {
    Swal.fire({
      title: '¡Reinicio exitoso!',
      text: 'Texto de búsqueda y todos los filtros han sido restablecidos',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      background: '#ffffff'
      // Comportamiento por defecto (centrado)
    });

    this.resetAllFilters();
  }

  // Método para reiniciar todos los filtros
  resetAllFilters(): void {
    // Resetear búsqueda
    this.searchTerm = '';
    this.searchChange.emit('');

    // Resetear filtros (especial: estado vuelve a "activo")
    this.currentFilter = 'activo'; // ← Esta es la excepción que pediste
    this.filterChange.emit('activo');
  }

  // Método para verificar si hay filtros activos (actualizado)
  hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim() !== '' ||
      this.currentFilter !== 'activo' || // ← Compara con 'activo' ahora
      this.currentDocType !== 'todos' ||
      this.currentGender !== 'todos' ||
      this.currentAgeRange !== null
    );
  }


}





