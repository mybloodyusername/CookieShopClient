import { Component, inject, input, effect, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiProductService, ProductDetailResponse } from '../../api';
import { Session } from './session';
import { imageUrl, TomanPipe } from './money';
@Component({
  selector: 'sori-product',
  imports: [NgOptimizedImage, RouterLink, TomanPipe],
  template: ` <section class="container section">
    <a routerLink="/shop" class="text-link">فروشگاه / جزئیات کوکی</a>
    @if (loading()) {
      <p class="empty-state" role="status">در حال دریافت محصول…</p>
    } @else if (product(); as p) {
      <div class="product-detail">
        <div>
          <div class="detail-photo">
            <img
              [ngSrc]="image(selected() || p.imageUrl)"
              [alt]="p.name"
              fill
              sizes="(max-width:760px) 90vw, 45vw"
              priority
            />
          </div>
          <div class="gallery">
            @for (img of p.images ?? []; track img.imageId) {
              <button
                (click)="selected.set(img.url)"
                [attr.aria-label]="'نمایش ' + (img.alt || p.name)"
                [class.selected]="selected() === img.url"
              >
                <img [ngSrc]="image(img.url)" [alt]="img.alt" width="88" height="88" />
              </button>
            }
          </div>
        </div>
        <div class="detail-copy">
          <span class="eyebrow">{{ p.category.name }} · ثوری</span>
          <h1>{{ p.name }}</h1>
          <p class="description">{{ p.description }}</p>
          <div class="detail-price">
            @if (p.isOnSale && p.salePrice) {
              <del>{{ p.price | toman }}</del>
            }
            <strong>{{ (p.isOnSale && p.salePrice ? p.salePrice : p.price) | toman }}</strong>
          </div>
          <p>
            {{
              p.isAvailable && +p.stockQuantity > 0
                ? 'آماده برای یک لحظه‌ی شیرین'
                : 'این طعم فعلاً موجود نیست'
            }}
          </p>
          <button
            class="button primary"
            [disabled]="session.busy() || !p.isAvailable || +p.stockQuantity < 1"
            (click)="session.add(p.id)"
          >
            افزودن به سبد خرید +
          </button>
          @if (!session.user()) {
            <p><a class="text-link" routerLink="/account">برای خرید، وارد حساب خود شوید ←</a></p>
          }
          <div class="detail-note">
            مواد تشکیل‌دهنده و حساسیت‌های غذایی را در توضیحات محصول بررسی کنید.
          </div>
        </div>
      </div>
    } @else {
      <div class="empty-state">
        <h1>این کوکی پیدا نشد</h1>
        <p>ممکن است محصول حذف شده باشد یا اتصال برقرار نباشد.</p>
        <a routerLink="/shop" class="button primary">بازگشت به فروشگاه</a>
      </div>
    }
  </section>`,
})
export class ProductComponent {
  readonly id = input.required<string>();
  readonly api = inject(ApiProductService);
  readonly session = inject(Session);
  readonly product = signal<ProductDetailResponse | null>(null);
  readonly selected = signal('');
  readonly loading = signal(true);
  readonly image = imageUrl;
  constructor() {
    effect((onCleanup) => {
      const id = this.id();
      let active = true;
      onCleanup(() => (active = false));
      this.loading.set(true);
      this.selected.set('');
      firstValueFrom(this.api.apiProductIdGet({ id }))
        .then((p) => {
          if (active) this.product.set(p);
        })
        .catch(() => {
          if (active) this.product.set(null);
        })
        .finally(() => {
          if (active) this.loading.set(false);
        });
    });
  }
}
