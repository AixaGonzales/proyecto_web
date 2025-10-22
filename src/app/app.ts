import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // FALTA ESTA LÍNEA

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule], // AGREGA RouterModule AQUÍ
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  title = 'panaderiaJorgito_FrontEnd';
}
