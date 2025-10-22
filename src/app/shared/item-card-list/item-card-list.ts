import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

export interface ItemCard {
  id: number | string;
  name: string;
  description?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-item-card-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './item-card-list.html',
  styleUrls: ['./item-card-list.scss'],
})
export class ItemCardList {
  @Input() items: ItemCard[] = [];
  @Output() selectItem = new EventEmitter<ItemCard>();

  selectedItemId: number | string | null = null;

  onSelect(item: ItemCard) {
    this.selectedItemId = item.id;
    this.selectItem.emit(item);
  }
}
