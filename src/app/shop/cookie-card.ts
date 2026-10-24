import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Component, input, inject, computed } from '@angular/core';
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
    NgOptimizedImage,
    RouterLink,
    TomanPipe,
  ],
  template: ` <mat-card class="cookie-card" appearance="outlined" role="article">
    @if (available() && product().isOnSale && product().salePrice) {
      <span class="sale-ribbon">تخفیف ویژه</span>
    }
    @if (available()) {
      <a class="product-photo" [routerLink]="['/shop', product().id]" [attr.aria-label]="product().name">
        <img
          [ngSrc]="image(product().imageUrl)"
          [alt]="product().images?.[0]?.alt || product().name"
          fill
          sizes="(max-width: 599px) 90vw, (max-width: 1100px) 45vw, 25vw"
          (error)="fallback($event)"
        />
      </a>
    } @else {
      <div class="product-photo product-photo-unavailable" aria-hidden="true">
        <img
          [ngSrc]="image(product().imageUrl)"
          alt=""
          fill
          sizes="(max-width: 599px) 90vw, (max-width: 1100px) 45vw, 25vw"
          (error)="fallback($event)"
        />
      </div>
    }
    <mat-card-header>
      <h3 mat-card-title>
        <a mat-button [routerLink]="['/shop', product().id]">{{ product().name }}</a>
      </h3>
      <mat-card-subtitle>
        @if (available()) {
          @if (product().isOnSale && product().salePrice) {
            <del class="original-price">{{ product().price | toman: false }}</del>
          }
          <strong class="final-price" [class.discount-price]="product().isOnSale && product().salePrice">
            {{ (product().isOnSale && product().salePrice ? product().salePrice : product().price) | toman }}
          </strong>
        } @else {
          <span class="unavailable-label">فعلاً ناموجود</span>
        }
      </mat-card-subtitle>
    </mat-card-header>
    <mat-card-actions align="end">
      @if (inCart()) {
        <div class="product-quantity" [attr.aria-label]="'تعداد ' + product().name + ' در سبد خرید'">
          <button mat-icon-button type="button" [disabled]="session.busy() || quantity() >= +product().stockQuantity"
            (click)="session.quantity(product().id, quantity() + 1)" [attr.aria-label]="'افزایش تعداد ' + product().name">
            <mat-icon svgIcon="add" />
          </button>
          <span aria-live="polite">{{ quantity().toLocaleString('fa-IR') }}</span>
          <button mat-icon-button type="button" [disabled]="session.busy()"
            (click)="session.quantity(product().id, quantity() - 1)" [attr.aria-label]="'کاهش تعداد ' + product().name">
            <mat-icon svgIcon="remove" />
          </button>
        </div>
      } @else {
        <button mat-flat-button type="button" [disabled]="session.busy() || !available()"
          (click)="session.add(product().id)" [attr.aria-label]="'افزودن ' + product().name + ' به سبد خرید'">
          <mat-icon svgIcon="add" /> افزودن به سبد
        </button>
      }
    </mat-card-actions>
  </mat-card>`,
})
export class CookieCard {
  readonly product = input.required<ProductResponse>();
  readonly available = computed(() => this.product().isAvailable && +this.product().stockQuantity > 0);
  readonly session = inject(Session);
  readonly quantity = computed(() => Number(this.session.cart()?.items.find((item) => item.productId === this.product().id)?.quantity ?? 0));
  readonly inCart = computed(() => this.quantity() > 0);
  readonly image = imageUrl;
  fallback(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/cookie-placeholder.svg';
  }
}
