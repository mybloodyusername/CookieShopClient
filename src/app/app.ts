import { Component, afterNextRender, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';
import { Session } from './shop/session';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
})
export class App {
  readonly session = inject(Session);
  readonly count = computed(
    () => this.session.cart()?.items.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0,
  );
  private readonly document = inject(DOCUMENT);
  constructor() {
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
