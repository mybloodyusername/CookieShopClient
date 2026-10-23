import { MatDialog } from '@angular/material/dialog';
import { ConfirmOrderComponent } from './confirm-order';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component, inject, signal, effect, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiOrderService, OrderResponse, OrderDetailResponse } from '../../api';
import { TomanPipe } from './money';
import { Session } from './session';
@Component({
  selector: 'sori-orders',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    RouterLink,
    TomanPipe,
  ],
  template: ` <section class="page-banner">
      <span>از ثوری تا خانه‌ی شما</span>
      <h1 class="mat-font-headline-lg">سفارش‌های من</h1>
    </section>
    <section class="container section narrow">
      <div class="orders-list">
        @if (!session.ready()) {
          <div class="loading-state" role="status">
            <mat-spinner diameter="36" aria-label="در حال بررسی حساب" />
            <p>در حال بررسی حساب…</p>
          </div>
        } @else if (!session.user()) {
          <div class="empty-state">
            <h2 class="mat-font-headline-sm">برای دیدن سفارش‌ها وارد شوید</h2>
            <a mat-flat-button routerLink="/account">ورود به حساب</a>
          </div>
        } @else if (loading()) {
          <div class="loading-state" role="status">
            <mat-spinner diameter="36" aria-label="در حال دریافت سفارش‌ها" />
            <p>در حال دریافت سفارش‌ها…</p>
          </div>
        } @else if (error()) {
          <div class="empty-state">
            <h2 class="mat-font-headline-sm">دریافت سفارش‌ها ممکن نشد</h2>
            <button mat-flat-button (click)="load()">تلاش دوباره</button>
          </div>
        } @else {
          @for (order of orders(); track order.id) {
            <mat-card class="order-card" appearance="outlined" role="article"
              ><mat-card-content>
                <div class="order-header">
                  <div>
                    <span>{{ date(order.createdAt) }}</span>
                    <h2 class="mat-font-headline-sm">
                      سفارش <bdi>{{ order.id.slice(0, 8) }}</bdi>
                    </h2>
                  </div>
                  <mat-chip-set aria-label="حالة سفارش"
                    ><mat-chip class="status-tag">{{
                      status(order.status)
                    }}</mat-chip></mat-chip-set
                  >
                </div>
                <div class="order-actions">
                  <strong>{{ order.totalAmount | toman }}</strong
                  ><button
                    mat-stroked-button
                    [disabled]="session.busy()"
                    (click)="details(order.id)"
                    [attr.aria-expanded]="detail()?.id === order.id"
                  >
                    {{ detail()?.id === order.id ? 'بستن جزئیات' : 'جزئیات سفارش' }}
                  </button>
                  @if (order.status.toLowerCase() === 'pending') {
                    <button
                      mat-button
                      [disabled]="session.busy()"
                      (click)="confirmCancel(order.id)"
                    >
                      لغو سفارش
                    </button>
                  }
                </div>
                @if (detail(); as d) {
                  @if (d.id === order.id) {
                    <div class="order-details">
                      @for (item of d.items; track item.productId) {
                        <p>
                          {{ item.productName }} × {{ (+item.quantity).toLocaleString('fa-IR') }}
                          <strong>{{ item.lineTotal | toman }}</strong>
                        </p>
                      }
                      <p>نشانی: {{ d.address.addressLine1 }} {{ d.address.addressLine2 }}</p>
                      <p>گیرنده: {{ d.address.phoneNumber }}</p>
                      @if (d.note) {
                        <p>یادداشت: {{ d.note }}</p>
                      }
                    </div>
                  }
                }
              </mat-card-content></mat-card
            >
          } @empty {
            <div class="empty-state">
              <h2 class="mat-font-headline-sm">اولین سفارش شیرین شما هنوز ثبت نشده</h2>
              <a mat-flat-button routerLink="/shop">رفتن به فروشگاه</a>
            </div>
          }
        }
      </div>
    </section>`,
})
export class OrdersComponent {
  readonly session = inject(Session);
  readonly api = inject(ApiOrderService);
  readonly orders = signal<OrderResponse[]>([]);
  readonly detail = signal<OrderDetailResponse | null>(null);
  private readonly dialog = inject(MatDialog);
  readonly loading = signal(true);
  readonly error = signal(false);
  constructor() {
    effect(() => {
      if (this.session.ready()) {
        if (this.session.user()) untracked(() => void this.load());
        else this.loading.set(false);
      }
    });
  }
  async load() {
    this.loading.set(true);
    this.error.set(false);
    try {
      this.orders.set(await firstValueFrom(this.api.apiOrderGet()));
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
  async details(id: string) {
    if (this.detail()?.id === id) {
      this.detail.set(null);
      return;
    }
    await this.session.run(async () =>
      this.detail.set(await firstValueFrom(this.api.apiOrderGetByIdIdGet({ id }))),
    );
  }
  async confirmCancel(id: string) {
    const confirmed = await firstValueFrom(
      this.dialog
        .open(ConfirmOrderComponent, {
          direction: 'rtl',
          width: '420px',
          maxWidth: 'calc(100vw - 40px)',
          ariaLabel: 'تأیید لغو سفارش',
          autoFocus: '[data-keep-order]',
        })
        .afterClosed(),
    );
    if (confirmed === true) await this.cancel(id);
  }
  private async cancel(id: string) {
    const ok = await this.session.run(async () => {
      await firstValueFrom(this.api.apiOrderCancelIdPut({ id }));
      this.detail.set(null);
      this.session.notice.set('سفارش لغو شد.');
    });
    if (ok) await this.load();
  }
  date(value: Date) {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(value));
  }
  status(value: string) {
    return (
      (
        {
          pending: 'در انتظار پرداخت',
          paid: 'پرداخت‌شده',
          shipped: 'ارسال‌شده',
          delivered: 'تحویل‌شده',
          cancelled: 'لغوشده',
        } as Record<string, string>
      )[value.toLowerCase()] ?? value
    );
  }
}
