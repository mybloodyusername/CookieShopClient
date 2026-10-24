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
  template: ` <mat-card appearance="outlined" role="article">
    <a
      class="product-photo"
      [routerLink]="['/shop', product().id]"
      [attr.aria-label]="product().name"
    >
      <img
        [ngSrc]="image(product().imageUrl)"
        [alt]="product().images?.[0]?.alt || product().name"
        fill
        sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 25vw"
        (error)="fallback($event)"
      />
    </a>
    <mat-card-header>
      <h3 mat-card-title>
        <a mat-button [routerLink]="['/shop', product().id]">{{ product().name }}</a>
      </h3>
      <mat-card-subtitle>
        @if (product().isOnSale && product().salePrice) {
          <del>{{ product().price | toman }}</del>
        }
        {{
          (product().isOnSale && product().salePrice ? product().salePrice : product().price)
            | toman
        }}
      </mat-card-subtitle>
    </mat-card-header>
    <mat-card-content>
      @if (product().isOnSale && product().salePrice) {
        <mat-chip-set aria-label="وضعیت تخفیف"><mat-chip>تخفیف ویژه</mat-chip></mat-chip-set>
      }
      @if (!product().isAvailable || +product().stockQuantity < 1) {
        <mat-chip-set aria-label="وضعیت موجودی"><mat-chip>فعلاً ناموجود</mat-chip></mat-chip-set>
      }
    </mat-card-content>
    <mat-card-actions align="end">
      <button
        mat-flat-button
        type="button"
        [disabled]="session.busy() || !product().isAvailable || +product().stockQuantity < 1"
        (click)="session.add(product().id)"
        [attr.aria-label]="'افزودن ' + product().name + ' به سبد خرید'"
      >
        <mat-icon svgIcon="add" /> افزودن به سبد
      </button>
    </mat-card-actions>
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
