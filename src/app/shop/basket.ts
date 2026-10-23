import { Component, inject, signal, effect, untracked } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { form, FormField, required, pattern, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { ApiAddressService, ApiOrderService, AddressResponse } from '../../api';
import { Session } from './session';
import { imageUrl, TomanPipe } from './money';
@Component({
  selector: 'sori-basket',
  imports: [RouterLink, NgOptimizedImage, TomanPipe, FormField],
  templateUrl: './basket.html',
})
export class BasketComponent {
  readonly session = inject(Session);
  readonly api = inject(ApiAddressService);
  readonly orders = inject(ApiOrderService);
  readonly router = inject(Router);
  readonly addresses = signal<AddressResponse[]>([]);
  readonly addressId = signal('');
  readonly note = signal('');
  readonly image = imageUrl;
  readonly showAddress = signal(false);
  readonly addressError = signal(false);
  readonly model = signal({ title: '', addressLine1: '', addressLine2: '', phoneNumber: '' });
  readonly fields = form(this.model, (p) => {
    required(p.title);
    required(p.addressLine1);
    required(p.phoneNumber);
    pattern(p.phoneNumber, /^09[0-9]{9}$/, { message: 'شماره موبایل معتبر وارد کنید.' });
  });
  readonly checkout = this.router.url.startsWith('/checkout');
  constructor() {
    effect(() => {
      if (this.session.ready() && this.session.user()) untracked(() => void this.refresh());
    });
  }
  async refresh() {
    await this.session.run(async () => {
      await this.session.loadCart();
      await this.loadAddresses();
    });
  }
  async loadAddresses() {
    try {
      this.addresses.set(await firstValueFrom(this.api.apiAddressGet()));
      this.addressId.set(this.addresses()[0]?.id ?? '');
      this.addressError.set(false);
    } catch {
      this.addressError.set(true);
    }
  }
  async saveAddress() {
    await submit(this.fields, async () => {
      await this.session.run(async () => {
        const address = await firstValueFrom(
          this.api.apiAddressCreatePost({
            createAddressRequest: { ...this.model(), userId: this.session.user()?.id ?? '' },
          }),
        );
        this.addresses.update((v) => [...v, address]);
        this.addressId.set(address.id);
        this.showAddress.set(false);
      });
    });
  }
  async place() {
    if (!this.addressId() || !this.session.cart()?.items.length) return;
    const success = await this.session.run(async () => {
      await firstValueFrom(
        this.orders.apiOrderCreatePost({
          createOrderRequest: { addressId: this.addressId(), note: this.note() || null },
        }),
      );
      this.session.cart.set(null);
      this.session.notice.set('سفارش شما ثبت شد. جزئیات را در سفارش‌های من ببینید.');
    });
    if (success) await this.router.navigateByUrl('/orders');
  }
}
