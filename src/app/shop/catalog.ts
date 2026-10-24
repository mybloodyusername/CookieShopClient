import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CatalogData } from './catalog-data';
import { CookieCard } from './cookie-card';
@Component({
  selector: 'sori-catalog',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    CookieCard,
  ],
  providers: [CatalogData],
  templateUrl: './catalog.html',
})
export class CatalogComponent {
  readonly data = inject(CatalogData);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly search = signal('');
  readonly category = signal('');
  constructor() {
    void this.data.loadCategories();
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.search.set(params.get('q') ?? '');
      this.category.set(params.get('category') ?? '');
      void this.load();
    });
  }
  load() {
    return this.data.load(this.search(), this.category());
  }
  filter(q: string, category: string) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: q || null, category: category || null, page: null },
    });
  }
}
