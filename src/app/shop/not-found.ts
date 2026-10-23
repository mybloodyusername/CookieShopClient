import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'sori-not-found',
  imports: [MatButtonModule, RouterLink],
  template: `<section class="container section empty-state">
    <span aria-hidden="true">۴۰۴</span>
    <h1 class="mat-font-headline-lg">این مسیر به کوکی نمی‌رسد!</h1>
    <p>صفحه‌ای که می‌خواهید پیدا نشد.</p>
    <a mat-flat-button routerLink="/">برگشت به خانه</a>
  </section>`,
})
export class NotFoundComponent {}
