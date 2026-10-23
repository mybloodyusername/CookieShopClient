import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form, FormField, required, email, pattern, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { Session } from './session';
@Component({
  selector: 'sori-account',
  imports: [FormField, RouterLink],
  template: ` <section class="container account-section">
    <div class="account-story">
      <span aria-hidden="true">✺</span>
      <h1>به جمع شیرین<br />ثوری خوش آمدید.</h1>
      <p>یک حساب، برای همه‌ی لحظه‌های خوشمزه‌ات.</p>
    </div>
    <div class="form-card">
      @if (session.user(); as user) {
        <span class="eyebrow">خانه‌ی شما در ثوری</span>
        <h2>سلام {{ user.fullName || 'دوست ثوری' }}!</h2>
        <p>از اینجا خرید و سفارش‌های خود را دنبال کنید.</p>
        <a routerLink="/orders" class="button primary">سفارش‌های من</a
        ><a routerLink="/cart" class="button outline">سبد خرید من</a
        ><button class="text-link" [disabled]="session.busy()" (click)="session.logout()">
          خروج از حساب
        </button>
      } @else {
        <div class="account-tabs">
          <button
            [class.active]="!register()"
            [attr.aria-pressed]="!register()"
            (click)="register.set(false)"
          >
            ورود به حساب</button
          ><button
            [class.active]="register()"
            [attr.aria-pressed]="register()"
            (click)="register.set(true)"
          >
            ثبت‌نام
          </button>
        </div>
        <h2>{{ register() ? 'اولین سلام به ثوری' : 'خوش برگشتید!' }}</h2>
        <p class="muted">
          {{
            register() ? 'برای شروع، اطلاعات زیر را وارد کنید.' : 'برای ادامه، وارد حساب خود شوید.'
          }}
        </p>
        <form (submit)="send(); $event.preventDefault()" novalidate>
          <label for="phone">شماره موبایل</label
          ><input
            id="phone"
            type="tel"
            dir="ltr"
            autocomplete="tel"
            placeholder="09123456789"
            [formField]="fields.phoneNumber"
          />
          <p class="field-hint">شماره را با ارقام انگلیسی و با ۰۹ وارد کنید.</p>
          @for (
            e of fields.phoneNumber().touched() ? fields.phoneNumber().errors() : [];
            track e.kind
          ) {
            <p class="field-error">{{ e.message }}</p>
          }
          @if (register()) {
            <label for="email">ایمیل</label
            ><input
              id="email"
              type="email"
              dir="ltr"
              autocomplete="email"
              [formField]="fields.email"
            />
            @for (e of fields.email().touched() ? fields.email().errors() : []; track e.kind) {
              <p class="field-error">{{ e.message }}</p>
            }
          }
          <label for="password">رمز عبور</label
          ><input
            id="password"
            type="password"
            dir="ltr"
            [autocomplete]="register() ? 'new-password' : 'current-password'"
            [formField]="fields.password"
          />
          @if (register()) {
            <p class="field-hint">حداقل ۱۲ نویسه شامل حرف بزرگ و کوچک انگلیسی و عدد.</p>
          }
          @for (e of fields.password().touched() ? fields.password().errors() : []; track e.kind) {
            <p class="field-error">{{ e.message }}</p>
          }
          <button class="button primary full" type="submit" [disabled]="session.busy()">
            {{ session.busy() ? 'کمی صبر کنید…' : register() ? 'ساخت حساب' : 'ورود به ثوری' }}
          </button>
        </form>
      }
    </div>
  </section>`,
})
export class AccountComponent {
  readonly session = inject(Session);
  readonly register = signal(false);
  readonly model = signal({ phoneNumber: '', email: '', password: '' });
  readonly fields = form(this.model, (p) => {
    required(p.phoneNumber, { message: 'شماره موبایل را وارد کنید.' });
    pattern(p.phoneNumber, /^09[0-9]{9}$/, {
      message: 'شماره موبایل معتبر با ارقام انگلیسی وارد کنید.',
    });
    required(p.password, { message: 'رمز عبور را وارد کنید.' });
    email(p.email, { message: 'ایمیل معتبر وارد کنید.' });
  });
  async send() {
    if (
      this.register() &&
      (!this.model().email ||
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{12,}$/.test(this.model().password))
    ) {
      this.session.notice.set(
        'ایمیل معتبر و رمز عبور حداقل ۱۲ نویسه شامل حروف بزرگ، کوچک و عدد وارد کنید.',
      );
      return;
    }
    await submit(this.fields, async () => {
      await this.session.run(async () => {
        const m = this.model();
        if (this.register()) {
          await firstValueFrom(this.session.auth.apiAuthRegisterPost({ registerRequest: m }));
          this.register.set(false);
          this.model.update((v) => ({ ...v, password: '' }));
          this.session.notice.set('حساب شما ساخته شد. اکنون وارد شوید.');
        } else {
          this.session.user.set(
            await firstValueFrom(
              this.session.auth.apiAuthLoginPost({
                loginRequest: { phoneNumber: m.phoneNumber, password: m.password },
              }),
            ),
          );
          await this.session.loadCart();
          this.session.notice.set('به ثوری خوش آمدید!');
        }
      });
    });
  }
}
