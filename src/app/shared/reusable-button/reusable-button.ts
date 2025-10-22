import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reusable-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reusable-button.html',
  styleUrls: ['./reusable-button.scss'],
})
export class ReusableButton {
  @Input() color: 'naranja' | 'blanco-naranja' | 'marron' | 'blanco-marron' | 'verde' | 'beige' | 'naranja-fuerte' = 'naranja';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
}