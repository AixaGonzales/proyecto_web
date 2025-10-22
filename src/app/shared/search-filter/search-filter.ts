import { Component, EventEmitter, Output, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface CustomFilter {
  key: string;
  label: string;
  value: any;
  options?: Array<{ value: any, label: string }>;
  type?: 'select' | 'text' | 'number' | 'range';
  placeholder?: string;
  icon?: string;
}

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './search-filter.html',
  styleUrls: ['./search-filter.scss']
})
export class SearchFilter implements OnInit {
  @Input() placeholderText: string = 'Buscar...';
  @Input() customFiltersLabel: string = 'Filtros avanzados';
  @Input() showFiltersButton: boolean = true;
  @Input() customFilters: CustomFilter[] = [];

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchTerm = '';
  isSearchFocused = false;
  hasScroll = false;
  hasNewFilters = false;
  randomId = Math.random().toString(36).substring(2, 15);

  @Output() searchChange = new EventEmitter<string>();
  @Output() customFilterChange = new EventEmitter<{ key: string; value: any }>();
  @Output() clearAll = new EventEmitter<void>();

  ngOnInit() {
    this.customFilters.forEach(filter => {
      if (filter.type === 'range' && !filter.value) {
        filter.value = { min: null, max: null };
      }
    });
  }

  // MÉTODO NUCLEAR - ELIMINAR AUTOCOMPLETE
  onSearchFocus(event: FocusEvent): void {
    this.isSearchFocused = true;
    const input = event.target as HTMLInputElement;
    
    // TRUCO DEFINITIVO: Cambiar atributos dinámicamente
    setTimeout(() => {
      // Remover readonly (se removió en el HTML con onfocus)
      input.removeAttribute('readonly');
      
      // Atributos para bloquear autocomplete
      input.setAttribute('autocomplete', 'new-password');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('spellcheck', 'false');
      input.setAttribute('aria-autocomplete', 'none');
      input.setAttribute('role', 'textbox');
      
      // Cambiar name dinámicamente para confundir al navegador
      this.randomId = Math.random().toString(36).substring(2, 15);
      input.setAttribute('name', 'search-' + this.randomId);
      
      // Forzar que no sea reconocible como campo de búsqueda
      input.setAttribute('inputmode', 'search');
    }, 10);
  }

  handleSearch(): void {
    this.searchChange.emit(this.searchTerm.trim());
  }

  onCustomFilterChange(key: string, value: any): void {
    this.customFilterChange.emit({ key, value });
  }

  removeSearchFilter(): void {
    this.searchTerm = '';
    this.searchChange.emit('');
  }

  removeCustomFilter(key: string): void {
    this.customFilterChange.emit({ key, value: null });
  }

  clearAllCustomFilters(): void {
    this.searchTerm = '';
    this.customFilters.forEach(filter => {
      if (filter.type === 'range') {
        filter.value = { min: null, max: null };
      } else {
        filter.value = null;
      }
    });
    this.clearAll.emit();
  }

  hasActiveCustomFilters(): boolean {
    return this.customFilters.some(filter => {
      if (filter.type === 'range') {
        return (filter.value?.min !== null && filter.value?.min !== undefined && filter.value?.min !== '') ||
               (filter.value?.max !== null && filter.value?.max !== undefined && filter.value?.max !== '');
      }
      return filter.value !== null && filter.value !== undefined && filter.value !== '';
    });
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' || this.hasActiveCustomFilters();
  }

  getFilterDisplayValue(filter: CustomFilter): string {
    if (filter.options && filter.value) {
      const option = filter.options.find(opt => opt.value === filter.value);
      return option ? option.label : filter.value;
    }

    if (filter.type === 'range') {
      const min = filter.value?.min;
      const max = filter.value?.max;
      if (min != null && min !== '' && max != null && max !== '') return `${min} - ${max}`;
      if (min != null && min !== '') return `Desde ${min}`;
      if (max != null && max !== '') return `Hasta ${max}`;
      return '';
    }

    return filter.value?.toString() || '';
  }

  getActiveFiltersCount(): number {
    const searchCount = this.searchTerm.trim() ? 1 : 0;
    const customFiltersCount = this.customFilters.filter(filter => {
      if (filter.type === 'range') {
        return (filter.value?.min !== null && filter.value?.min !== undefined && filter.value?.min !== '') ||
               (filter.value?.max !== null && filter.value?.max !== undefined && filter.value?.max !== '');
      }
      return filter.value !== null && filter.value !== undefined && filter.value !== '';
    }).length;

    return searchCount + customFiltersCount;
  }

  getFilterTypeIcon(type?: string): string {
    switch (type) {
      case 'select': return 'list';
      case 'text': return 'text_fields';
      case 'number': return 'numbers';
      case 'range': return 'linear_scale';
      default: return 'tune';
    }
  }

  onFiltersMenuClosed(): void {
    this.hasScroll = false;
  }

  onFiltersContainerScroll(event: Event): void {
    const container = event.target as HTMLElement;
    this.hasScroll = container.scrollHeight > container.clientHeight;
  }
}