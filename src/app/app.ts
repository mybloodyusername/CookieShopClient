import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  Component,
  afterNextRender,
  computed,
  inject,
  effect,
  untracked,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { SessionService } from './services/session.service';
@Component({
  selector: 'cs-root',
  host: { '(window:scroll)': 'onWindowScroll()' },
  imports: [
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSnackBarModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly session = inject(SessionService);
  private readonly router = inject(Router);
  readonly adminPage = signal(this.router.url.startsWith('/admin'));
  readonly navHidden = signal(false);
  private readonly currentUrl = signal(this.router.url);
  readonly pageTitle = computed(() => {
    const url = this.currentUrl().split('?')[0].split('/').filter(Boolean);
    if (url.length === 0) return 'ثوری · Sori';
    if (url[0] === 'shop') return url.length > 1 ? 'جزئیات کوکی' : 'کوکی‌های ما';
    const titles: Record<string, string> = {
      cart: 'سبد خرید',
      account: 'حساب کاربری',
      orders: 'سفارش‌های من',
      about: 'داستان ثوری',
      admin: 'پنل مدیریت',
    };
    return titles[url[0]] ?? 'ثوری · Sori';
  });
  readonly canGoBack = computed(() => this.currentUrl().split('?')[0] !== '/');
  private lastScrollY = 0;
  private readonly location = inject(Location);
  readonly navigation = [
    { path: '/', label: 'خانه', icon: 'home' },
    { path: '/shop', label: 'کوکی‌ها', icon: 'cookie' },
    { path: '/cart', label: 'سبد خرید', icon: 'shopping_bag' },
    { path: '/account', label: 'حساب من', icon: 'person' },
  ];
  readonly count = computed(
    () => this.session.cart()?.items.reduce((total, item) => total + Number(item.quantity), 0) ?? 0,
  );
  private readonly document = inject(DOCUMENT);
  private readonly snackBar = inject(MatSnackBar);
  constructor() {
    effect(() => {
      const message = this.session.notice();
      if (message)
        untracked(() => {
          this.snackBar.open(message, 'بستن', {
            direction: 'rtl',
            duration: 7000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.session.notice.set('');
        });
    });
    afterNextRender(() => {
      void this.session.restore();
    });
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentUrl.set(event.urlAfterRedirects);
          this.adminPage.set(event.urlAfterRedirects.startsWith('/admin'));
        }
        if (event instanceof NavigationEnd && event.id > 1) {
          setTimeout(() => {
            const main = this.document.getElementById('main-content');
            const heading = main?.querySelector<HTMLElement>('h1, h2');
            const target = heading ?? main;
            target?.setAttribute('tabindex', '-1');
            target?.focus({ preventScroll: true });
          }, 0);
        }
      });
  }
  onWindowScroll() {
    const current = window.scrollY;
    if (current < 24) this.navHidden.set(false);
    else if (current > this.lastScrollY + 4) this.navHidden.set(true);
    else if (current < this.lastScrollY - 4) this.navHidden.set(false);
    this.lastScrollY = current;
  }
  goBack() { this.location.back(); }
}
