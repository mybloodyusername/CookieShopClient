import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'sori-not-found',
  imports: [RouterLink],
  template: `<section class="container section empty-state">
    <span class="empty-icon" aria-hidden="true">۴۰۴</span>
    <h1>این مسیر به کوکی نمی‌رسد!</h1>
    <p>صفحه‌ای که می‌خواهید پیدا نشد.</p>
    <a routerLink="/" class="button primary">برگشت به خانه</a>
  </section>`,
})
export class NotFoundComponent {}
