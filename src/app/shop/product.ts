import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component, inject, input, effect, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiProductService, ProductDetailResponse } from '../../api';
import { Session } from './session';
import { imageUrl, TomanPipe } from './money';
@Component({
  selector: 'sori-product',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgOptimizedImage,
    RouterLink,
    TomanPipe,
  ],
  template: ` <section class="container section">
    <a mat-button routerLink="/shop">فروشگاه / جزئیات کوکی</a>
    @if (loading()) {
      <div class="loading-state" role="status">
        <mat-spinner diameter="36" aria-label="در حال دریافت محصول" />
        <p>در حال دریافت محصول…</p>
      </div>
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
            @for (img of p.images ?? []; track img.imageId; let index = $index) {
              <button
                mat-stroked-button
                (click)="selected.set(img.url)"
                [attr.aria-label]="'نمایش ' + (img.alt || p.name)"
                [attr.aria-pressed]="(selected() || p.imageUrl) === img.url"
              >
                تصویر {{ (index + 1).toLocaleString('fa-IR') }}
              </button>
            }
          </div>
        </div>
        <div class="detail-copy">
          <span>{{ p.category.name }} · ثوری</span>
          <h1 class="mat-font-headline-lg">{{ p.name }}</h1>
          <p class="description">{{ p.description }}</p>
          <div>
            @if (p.isOnSale && p.salePrice) {
              <del>{{ p.price | toman }}</del>
            }
            <strong class="mat-font-headline-sm">{{
              (p.isOnSale && p.salePrice ? p.salePrice : p.price) | toman
            }}</strong>
          </div>
          <p>
            {{
              p.isAvailable && +p.stockQuantity > 0
                ? 'آماده برای یک لحظه‌ی شیرین'
                : 'این طعم فعلاً موجود نیست'
            }}
          </p>
          <button
            mat-flat-button
            [disabled]="session.busy() || !p.isAvailable || +p.stockQuantity < 1"
            (click)="session.add(p.id)"
          >
            افزودن به سبد خرید <mat-icon svgIcon="add" />
          </button>
          @if (!session.user()) {
            <p>
              <a mat-button routerLink="/account">برای خرید، وارد حساب خود شوید</a>
            </p>
          }
          <div>مواد تشکیل‌دهنده و حساسیت‌های غذایی را در توضیحات محصول بررسی کنید.</div>
        </div>
      </div>
    } @else {
      <div class="empty-state">
        <h1 class="mat-font-headline-lg">این کوکی پیدا نشد</h1>
        <p>ممکن است محصول حذف شده باشد یا اتصال برقرار نباشد.</p>
        <a mat-flat-button routerLink="/shop">بازگشت به فروشگاه</a>
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
