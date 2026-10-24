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
import { SessionService } from '../../../services/session.service';
@Component({
  selector: 'cs-account',
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
  templateUrl: './account.html',
})
export class AccountComponent {
  readonly session = inject(SessionService);
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
