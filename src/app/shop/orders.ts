import { Component, inject, signal, effect, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiOrderService, OrderResponse, OrderDetailResponse } from '../../api';
import { TomanPipe } from './money';
import { Session } from './session';
@Component({
  selector: 'sori-orders',
  imports: [RouterLink, TomanPipe],
  template: ` <section class="page-banner">
      <span class="eyebrow">از ثوری تا خانه‌ی شما</span>
      <h1>سفارش‌های من</h1>
    </section>
    <section class="container section narrow">
      @if (!session.ready()) {
        <p class="empty-state" role="status">در حال بررسی حساب…</p>
      } @else if (!session.user()) {
        <div class="empty-state">
          <h2>برای دیدن سفارش‌ها وارد شوید</h2>
          <a class="button primary" routerLink="/account">ورود به حساب</a>
        </div>
      } @else if (loading()) {
        <p class="empty-state" role="status">در حال دریافت سفارش‌ها…</p>
      } @else if (error()) {
        <div class="empty-state">
          <h2>دریافت سفارش‌ها ممکن نشد</h2>
          <button class="button primary" (click)="load()">تلاش دوباره</button>
        </div>
      } @else {
        @for (order of orders(); track order.id) {
          <article class="order-card">
            <div class="order-header">
              <div>
                <span class="eyebrow">{{ date(order.createdAt) }}</span>
                <h2>
                  سفارش <bdi>{{ order.id.slice(0, 8) }}</bdi>
                </h2>
              </div>
              <span class="status-tag">{{ status(order.status) }}</span>
            </div>
            <div class="order-actions">
              <strong>{{ order.totalAmount | toman }}</strong
              ><button
                class="button outline"
                [disabled]="session.busy()"
                (click)="details(order.id)"
                [attr.aria-expanded]="detail()?.id === order.id"
              >
                {{ detail()?.id === order.id ? 'بستن جزئیات' : 'جزئیات سفارش' }}
              </button>
              @if (order.status.toLowerCase() === 'pending') {
                <button
                  class="text-link"
                  [disabled]="session.busy()"
                  (click)="confirmId.set(order.id)"
                >
                  لغو سفارش
                </button>
              }
            </div>
            @if (confirmId() === order.id) {
              <div class="cancel-confirm" role="group" aria-label="تأیید لغو سفارش">
                <p>این سفارش لغو شود؟</p>
                <button
                  class="button outline"
                  [disabled]="session.busy()"
                  (click)="cancel(order.id)"
                >
                  بله، لغو شود</button
                ><button class="button primary" (click)="confirmId.set('')">خیر</button>
              </div>
            }
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
          </article>
        } @empty {
          <div class="empty-state">
            <h2>اولین سفارش شیرین شما هنوز ثبت نشده</h2>
            <a class="button primary" routerLink="/shop">رفتن به فروشگاه</a>
          </div>
        }
      }
    </section>`,
})
export class OrdersComponent {
  readonly session = inject(Session);
  readonly api = inject(ApiOrderService);
  readonly orders = signal<OrderResponse[]>([]);
  readonly detail = signal<OrderDetailResponse | null>(null);
  readonly confirmId = signal('');
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
  async cancel(id: string) {
    const ok = await this.session.run(async () => {
      await firstValueFrom(this.api.apiOrderCancelIdPut({ id }));
      this.confirmId.set('');
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
