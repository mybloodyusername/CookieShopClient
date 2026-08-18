import { Component, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { ProductResponse } from '../../../../api';
import { CurrentUserService } from '../../../services/current-user.service';

@Component({
  selector: 'cookie-product-card',
  imports: [MatButton, MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  product = input.required<ProductResponse>();

  private readonly currentUserService = inject(CurrentUserService);

  protected addToCart() {
    this.currentUserService.addToCart(this.product());
  }
}
