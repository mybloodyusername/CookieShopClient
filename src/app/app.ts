import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Component, afterNextRender, computed, inject, effect, untracked } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Session } from './shop/session';
@Component({
  selector: 'app-root',
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
})
export class App {
  readonly session = inject(Session);
  readonly count = computed(
    () => this.session.cart()?.items.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0,
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
        if (event instanceof NavigationEnd)
          setTimeout(() => this.document.getElementById('main-content')?.focus(), 0);
      });
  }
}
