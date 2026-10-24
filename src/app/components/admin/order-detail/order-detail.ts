import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { ApiOrderService, OrderDetailResponse } from '../../../../api';
import { TomanPipe } from '../../../pipes/toman.pipe';
import { SessionService } from '../../../services/session.service';
@Component({
  selector: 'cs-order-detail',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    TomanPipe,
  ],
  templateUrl: './order-detail.html',
  styles: `
    .item {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      padding-block: 16px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
    mat-form-field {
      width: 100%;
      margin-top: 16px;
    }
    .error {
      color: var(--mat-sys-error);
    }
  `,
})
export class OrderDetailComponent {
  readonly id = inject<string>(MAT_DIALOG_DATA);
  readonly dialog = inject(MatDialogRef<OrderDetailComponent>);
  private readonly api = inject(ApiOrderService);
  private readonly session = inject(SessionService);
  readonly order = signal<OrderDetailResponse | null>(null);
  readonly status = signal('');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  changed = false;
  readonly statuses = [
    { value: 'Pending', label: 'در انتظار پرداخت' },
    { value: 'Paid', label: 'پرداخت‌شده' },
    { value: 'Shipped', label: 'ارسال‌شده' },
    { value: 'Delivered', label: 'تحویل‌شده' },
    { value: 'Cancelled', label: 'لغوشده' },
  ];
  constructor() {
    void this.load();
  }
  async load() {
    this.loading.set(true);
    this.error.set('');
    try {
      const order = await firstValueFrom(this.api.apiOrderGetByIdByAdminIdGet({ id: this.id }));
      this.order.set(order);
      this.status.set(order.status);
    } catch {
      this.error.set('دریافت سفارش ممکن نشد. دوباره تلاش کنید.');
    } finally {
      this.loading.set(false);
    }
  }
  async save() {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    this.dialog.disableClose = true;
    try {
      await firstValueFrom(
        this.api.apiOrderUpdateStatusByAdminPut({
          updateOrderStatusRequest: { orderId: this.id, status: this.status() },
        }),
      );
      this.changed = true;
      this.session.notice.set('وضعیت سفارش ذخیره شد.');
      this.dialog.close(true);
    } catch {
      this.error.set('تغییر وضعیت ممکن نشد. وضعیت انتخاب‌شده و دسترسی حساب را بررسی کنید.');
    } finally {
      this.saving.set(false);
      this.dialog.disableClose = false;
    }
  }
  number(value: number | string) {
    return Number(value).toLocaleString('fa-IR');
  }
}
