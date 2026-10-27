import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
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
import { SessionService } from './services/session.service';
@Component({
  selector: 'cs-root',
  host: { '(window:scroll)': 'onWindowScroll()' },
  imports: [
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
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
  private lastScrollY = 0;
  readonly navigation = [
    { path: '/', label: 'خانه', icon: 'home' },
    { path: '/shop', label: 'فروشگاه', icon: 'cookie' },
    { path: '/checkout/cart', label: 'سبد خرید', icon: 'shopping_bag' },
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
    this.router.events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
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
}
