import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'sori-about',
  imports: [RouterLink],
  template: `<section class="page-banner">
      <span class="eyebrow">سلام، ما ثوری هستیم</span>
      <h1>یک قصه‌ی کوچک و شیرین.</h1>
    </section>
    <section class="container section about-content">
      <div class="story-art">
        <span aria-hidden="true">✺</span>
        <p>کوکی بهانه‌ست،<br /><strong>حال خوب اصل ماجراست.</strong></p>
        <span class="story-signature">با عشق، ثوری</span>
      </div>
      <div>
        <h2>برای لحظه‌های ساده‌ی زندگی.</h2>
        <p>
          ما به قدرت چیزهای کوچک باور داریم. به یک میز دو نفره، یک فنجان چای و کوکی‌ای که می‌تواند
          شروع یک گفت‌وگوی خوب باشد.
        </p>
        <p>
          ثوری دعوتی است برای کمی مکث، برای لذت بردن از همین لحظه و قسمت کردن شیرینی با آدم‌های
          دوست‌داشتنی زندگی.
        </p>
        <h2>طعم دلخواهتان را پیدا کنید</h2>
        <p>
          در صفحه‌ی هر محصول می‌توانید توضیحات، قیمت، موجودی و اطلاعات مواد تشکیل‌دهنده را بررسی
          کنید. اگر حساسیت غذایی دارید، پیش از سفارش توضیحات محصول را بخوانید.
        </p>
        <a class="button primary" routerLink="/shop">یک گاز خوشحالی ←</a>
      </div>
    </section>`,
})
export class AboutComponent {}
