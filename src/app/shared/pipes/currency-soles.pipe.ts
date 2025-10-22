import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'soles',
  standalone: true,
})
export class SolesPipe implements PipeTransform {
  transform(value: number | string): string {
    // 1. Manejo de valores nulos/vacíos
    if (value === null || value === undefined || value === '') {
      return 'S/ 0';
    }

    // 2. Conversión a número (limpia símbolos de strings)
    const num = typeof value === 'string' ? Number(value.replace(/[^\d]/g, '')) : value;

    // 3. Validación de número válido
    if (isNaN(num)) {
      return 'S/ 0';
    }

    // 4. Formateo con separadores de miles (formato peruano)
    const formatted = num.toLocaleString('es-PE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    // 5. Retorna con símbolo de soles
    return `S/ ${formatted}`;
  }
}