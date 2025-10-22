// src/app/shared/pipes/order-number.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'orderNumber',
    standalone: true
})
export class OrderNumberPipe implements PipeTransform {
    transform(value: number): string {
        return `PED-${value.toString().padStart(5, '0')}`;
    }
}