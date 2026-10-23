import { Component, input, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { ProductResponse } from '../../api';
import { Session } from './session';
import { TomanPipe, imageUrl } from './money';
@Component({
  selector: 'sori-cookie-card',
  imports: [NgOptimizedImage, RouterLink, TomanPipe],
  template: ` <article class="cookie-card">
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
      @if (product().isOnSale && product().salePrice) {
        <span class="tag">شیرین‌تر از همیشه</span>
      }
      @if (!product().isAvailable || +product().stockQuantity < 1) {
        <span class="tag sold-out">فعلاً ناموجود</span>
      }
    </a>
    <div class="product-info">
      <span class="eyebrow">یک انتخاب خوشمزه</span>
      <h3>
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
          type="button"
          class="add-button"
          [disabled]="session.busy() || !product().isAvailable || +product().stockQuantity < 1"
          (click)="session.add(product().id)"
          [attr.aria-label]="'افزودن ' + product().name + ' به سبد خرید'"
        >
          +
        </button>
      </div>
    </div>
  </article>`,
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
