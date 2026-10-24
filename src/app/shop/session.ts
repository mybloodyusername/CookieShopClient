import { Service, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiAuthService, ApiCartService, ApiUserService } from '../../api';
import type { CartResponse, UserResponse } from '../../api';
@Service()
export class Session {
  private readonly users = inject(ApiUserService);
  readonly auth = inject(ApiAuthService);
  readonly cartApi = inject(ApiCartService);
  readonly user = signal<UserResponse | null>(null);
  readonly isAdmin = computed(() => this.user()?.role?.toLowerCase() === 'admin');
  readonly ready = signal(false);
  readonly cart = signal<CartResponse | null>(null);
  readonly cartError = signal(false);
  readonly notice = signal('');
  readonly busy = signal(false);
  async restore() {
    try {
      this.user.set(await firstValueFrom(this.users.apiUserMeGet()));
    } catch {
      this.user.set(null);
    }
    if (this.user()) {
      try {
        await this.loadCart();
      } catch {
        this.notice.set('دریافت سبد خرید ممکن نشد. دوباره تلاش کنید.');
      }
    }
    this.ready.set(true);
  }
  async loadCart() {
    this.cartError.set(false);
    try {
      this.cart.set(await firstValueFrom(this.cartApi.apiCartGet()));
    } catch (error: unknown) {
      this.cartError.set(true);
      throw error;
    }
  }
  async add(id: string) {
    if (!this.user()) {
      this.notice.set('برای افزودن کوکی به سبد، ابتدا وارد حساب خود شوید.');
      return;
    }
    await this.run(async () => {
      this.cart.set(
        await firstValueFrom(
          this.cartApi.apiCartAddItemPost({ addCartItemRequest: { productId: id, quantity: 1 } }),
        ),
      );
      this.notice.set('به سبد خرید شما اضافه شد.');
    });
  }
  async quantity(id: string, quantity: number) {
    await this.run(async () =>
      this.cart.set(
        await firstValueFrom(
          quantity < 1
            ? this.cartApi.apiCartRemoveItemProductIdDelete({ productId: id })
            : this.cartApi.apiCartUpdateItemPut({
                updateCartItemRequest: { productId: id, quantity },
              }),
        ),
      ),
    );
  }
  async logout() {
    await this.run(async () => {
      await firstValueFrom(this.auth.apiAuthLogoutPost());
      this.user.set(null);
      this.cart.set(null);
      this.notice.set('از حساب خارج شدید.');
    });
  }
  async run(action: () => Promise<unknown>): Promise<boolean> {
    if (this.busy()) return false;
    this.busy.set(true);
    try {
      await action();
      return true;
    } catch (error: unknown) {
      const status = error && typeof error === 'object' && 'status' in error ? error.status : 0;
      this.notice.set(
        status === 401
          ? 'نشست شما پایان یافته است. دوباره وارد شوید.'
          : status === 409
            ? 'موجودی یا وضعیت سفارش تغییر کرده است. صفحه را تازه کنید و دوباره تلاش کنید.'
            : status === 429
              ? 'تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.'
              : 'انجام درخواست ممکن نشد. اطلاعات و اتصال خود را بررسی کنید.',
      );
      if (status === 401) {
        this.user.set(null);
        this.cart.set(null);
      }
      return false;
    } finally {
      this.busy.set(false);
    }
  }
}
