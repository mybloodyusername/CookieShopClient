import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { form, FormField, required, email, pattern, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { Session } from './session';
@Component({
  selector: 'sori-account',
  imports: [
    MatIconModule,
    NgTemplateOutlet,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    FormField,
    RouterLink,
  ],
  template: ` <section class="container account-section">
    <div class="account-story">
      <mat-icon svgIcon="cookie" />
      <h1 class="mat-font-headline-lg">به جمع شیرین<br />ثوری خوش آمدید.</h1>
      <p>یک حساب، برای همه‌ی لحظه‌های خوشمزه‌ات.</p>
    </div>
    <mat-card appearance="outlined"
      ><mat-card-content
        ><div class="account-content">
          @if (session.user(); as user) {
            <span>خانه‌ی شما در ثوری</span>
            <h2 class="mat-font-headline-sm">سلام {{ user.fullName || 'دوست ثوری' }}!</h2>
            <p>از اینجا خرید و سفارش‌های خود را دنبال کنید.</p>
            @if (session.isAdmin()) {
              <a mat-flat-button routerLink="/admin">ورود به پنل مدیریت</a>
            }
            <a mat-flat-button routerLink="/orders">سفارش‌های من</a
            ><a mat-stroked-button routerLink="/cart">سبد خرید من</a
            ><button mat-button [disabled]="session.busy()" (click)="session.logout()">
              خروج از حساب
            </button>
          } @else {
            <mat-tab-group
              [selectedIndex]="register() ? 1 : 0"
              (selectedIndexChange)="register.set($event === 1)"
              animationDuration="0ms"
            >
              <mat-tab label="ورود به حساب"
                ><ng-template matTabContent
                  ><ng-container [ngTemplateOutlet]="credentials" /></ng-template
              ></mat-tab>
              <mat-tab label="ثبت‌نام"
                ><ng-template matTabContent
                  ><ng-container [ngTemplateOutlet]="credentials" /></ng-template
              ></mat-tab>
            </mat-tab-group>
            <ng-template #credentials>
              <h2 class="mat-font-headline-sm">
                {{ register() ? 'اولین سلام به ثوری' : 'خوش برگشتید!' }}
              </h2>
              <p>
                {{
                  register()
                    ? 'برای شروع، اطلاعات زیر را وارد کنید.'
                    : 'برای ادامه، وارد حساب خود شوید.'
                }}
              </p>
              <form class="form-stack" (submit)="send(); $event.preventDefault()" novalidate>
                <mat-form-field appearance="outline" subscriptSizing="dynamic"
                  ><mat-label>شماره موبایل</mat-label
                  ><input
                    matInput
                    id="phone"
                    type="tel"
                    dir="ltr"
                    autocomplete="tel"
                    placeholder="09123456789"
                    [formField]="fields.phoneNumber"
                  /><mat-hint>شماره را با ارقام انگلیسی و با ۰۹ وارد کنید.</mat-hint>
                  @for (
                    e of fields.phoneNumber().touched() ? fields.phoneNumber().errors() : [];
                    track e.kind
                  ) {
                    <mat-error>{{ e.message }}</mat-error>
                  }
                </mat-form-field>
                @if (register()) {
                  <mat-form-field appearance="outline" subscriptSizing="dynamic"
                    ><mat-label>ایمیل</mat-label
                    ><input
                      matInput
                      id="email"
                      type="email"
                      dir="ltr"
                      autocomplete="email"
                      [formField]="fields.email"
                    />
                    @for (
                      e of fields.email().touched() ? fields.email().errors() : [];
                      track e.kind
                    ) {
                      <mat-error>{{ e.message }}</mat-error>
                    }
                  </mat-form-field>
                }
                <mat-form-field appearance="outline" subscriptSizing="dynamic"
                  ><mat-label>رمز عبور</mat-label
                  ><input
                    matInput
                    id="password"
                    type="password"
                    dir="ltr"
                    [autocomplete]="register() ? 'new-password' : 'current-password'"
                    [formField]="fields.password"
                  />
                  @if (register()) {
                    <mat-hint>حداقل ۱۲ نویسه شامل حرف بزرگ و کوچک انگلیسی و عدد.</mat-hint>
                  }
                  @for (
                    e of fields.password().touched() ? fields.password().errors() : [];
                    track e.kind
                  ) {
                    <mat-error>{{ e.message }}</mat-error>
                  }
                </mat-form-field>
                <button mat-flat-button type="submit" [disabled]="session.busy()">
                  {{ session.busy() ? 'کمی صبر کنید…' : register() ? 'ساخت حساب' : 'ورود به ثوری' }}
                </button>
              </form>
            </ng-template>
          }
        </div></mat-card-content
      ></mat-card
    >
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
