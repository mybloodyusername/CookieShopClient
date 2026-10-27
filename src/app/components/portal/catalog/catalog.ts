import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CatalogDataService } from '../../../services/catalog-data.service';
import { CookieCard } from '../../shared/cookie-card/cookie-card';
@Component({
  selector: 'cs-catalog',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    CookieCard,
  ],
  providers: [CatalogDataService],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class CatalogComponent {
  readonly data = inject(CatalogDataService);
  readonly router = inject(Router);
  readonly search = signal('');
  readonly category = signal<string>(this.router.currentNavigation()?.extras.state?.['category'] ?? '');
  readonly filteredProducts = computed(() => {
    const term = this.search().trim().toLocaleLowerCase();
    const categoryId = this.category();
    return this.data.products().filter((product) => {
      const matchesCategory = !categoryId || product.categoryId === categoryId;
      const matchesSearch = !term || product.name.toLocaleLowerCase().includes(term) ||
        product.description?.toLocaleLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  });
  constructor() {
    void this.data.loadCategories();
    void this.data.load();
  }
  load() {
    return this.data.load();
  }
  filter(q: string) {
    this.search.set(q);
  }
  clearFilters() {
    this.category.set('');
    this.filter('');
  }
}
