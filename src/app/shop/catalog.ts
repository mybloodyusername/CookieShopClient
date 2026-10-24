import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
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
    MatPaginatorModule,
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
  readonly page = signal(1);
  constructor() {
    void this.data.loadCategories();
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.search.set(params.get('q') ?? '');
      this.category.set(params.get('category') ?? '');
      const page = Number(params.get('page') ?? 1);
      this.page.set(Number.isInteger(page) && page > 0 ? page : 1);
      void this.load();
    });
  }
  load() {
    return this.data.load(this.search(), this.category(), this.page());
  }
  filter(q: string, category: string, page = 1) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: q || null, category: category || null, page: page > 1 ? page : null },
    });
  }
}
