import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../sidebar/sidebar';
import { RouterModule } from '@angular/router'; 
import { TopBar } from '../top-bar/top-bar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    Sidebar,
    RouterModule,  // Para que funcione <router-outlet>
    TopBar
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class Layout {
  // Puedes agregar lógica si necesitas
}
