import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-column',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './info-column.html',
  styleUrls: ['./info-column.scss']
})
export class InfoColumn {
  @Input() logoUrl: string = '/logoPanaderiaJorge.png';
  @Input() logoAlt: string = 'Logo de la Panadería';
  @Input() title: string = 'Instrucciones de uso:';
  @Input() instructions: string[] = [
    'La dirección puede ser opcional',
    'Verifica los datos antes de guardar, especialmente el documento'
  ];
  @Input() contactTitle: string = 'Reportar problemas a través de:';
  @Input() socialLinks = {
    facebook: 'https://www.facebook.com/messages/t/yourpage',
    whatsapp: '51930574584',
    gmail: 'support@panaderia.com'
  };
  @Input() defaultMessages = {
    whatsapp: 'Hola, tengo un problema con el sistema de ventas.',
    gmail: 'Hola, tengo un problema con el sistema de ventas.'
  };

  openWhatsApp() {
    const url = `https://wa.me/${this.socialLinks.whatsapp}?text=${encodeURI(this.defaultMessages.whatsapp)}`;
    window.open(url, '_blank');
  }

  openGmail() {
    const subject = 'Problema con el sistema de ventas';
    const url = `mailto:${this.socialLinks.gmail}?subject=${encodeURI(subject)}&body=${encodeURI(this.defaultMessages.gmail)}`;
    window.open(url, '_blank');
  }

  openFacebook() {
    window.open(this.socialLinks.facebook, '_blank');
  }
}