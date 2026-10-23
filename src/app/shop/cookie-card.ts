import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Component, input, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { ProductResponse } from '../../api';
import { Session } from './session';
import { TomanPipe, imageUrl } from './money';
@Component({
  selector: 'sori-cookie-card',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    NgOptimizedImage,
    RouterLink,
    TomanPipe,
  ],
  template: ` <mat-card class="cookie-card" appearance="outlined" role="article">
    <div class="product-visual">
      <a
        class="product-photo"
        [routerLink]="['/shop', product().id]"
        [attr.aria-label]="product().name"
      >
        <img
          [ngSrc]="image(product().imageUrl)"
          [alt]="product().images?.[0]?.alt || product().name"
          fill
          sizes="(max-width: 600px) 90vw, (max-width: 900px) 45vw, 25vw"
          (error)="fallback($event)"
        />
      </a>
      @if (product().isOnSale && product().salePrice) {
        <mat-chip-set class="tag"><mat-chip>شیرین‌تر از همیشه</mat-chip></mat-chip-set>
      }
      @if (!product().isAvailable || +product().stockQuantity < 1) {
        <mat-chip-set class="tag"><mat-chip>فعلاً ناموجود</mat-chip></mat-chip-set>
      }
    </div>
    <mat-card-content class="product-info">
      <span>یک انتخاب خوشمزه</span>
      <h3 class="mat-font-title-lg">
        <a [routerLink]="['/shop', product().id]">{{ product().name }}</a>
      </h3>
      <p>{{ product().description }}</p>
      <div class="product-bottom">
        <div>
          @if (product().isOnSale && product().salePrice) {
            <del>{{ product().price | toman }}</del>
          }
          <strong>{{
            (product().isOnSale && product().salePrice ? product().salePrice : product().price)
              | toman
          }}</strong>
        </div>
        <button
          mat-icon-button
          type="button"
          [disabled]="session.busy() || !product().isAvailable || +product().stockQuantity < 1"
          (click)="session.add(product().id)"
          [attr.aria-label]="'افزودن ' + product().name + ' به سبد خرید'"
        >
          <mat-icon svgIcon="add" />
        </button>
      </div>
    </mat-card-content>
  </mat-card>`,
})
export class CookieCard {
  readonly product = input.required<ProductResponse>();
  readonly session = inject(Session);
  readonly image = imageUrl;
  fallback(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/cookie-placeholder.svg';
  }
}
