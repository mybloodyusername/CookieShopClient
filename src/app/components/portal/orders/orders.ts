import { MatDialog } from '@angular/material/dialog';
import { ConfirmOrderComponent } from '../confirm-order/confirm-order';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component, inject, signal, effect, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiOrderService, OrderResponse, OrderDetailResponse } from '../../../../api';
import { TomanPipe } from '../../../pipes/toman.pipe';
import { SessionService } from '../../../services/session.service';
@Component({
  selector: 'cs-orders',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    RouterLink,
    TomanPipe,
  ],
  templateUrl: './orders.html',
})
export class OrdersComponent {
  readonly session = inject(SessionService);
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
