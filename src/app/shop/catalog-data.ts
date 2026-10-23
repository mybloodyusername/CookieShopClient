import { Service, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiProductService, ApiCategoryService } from '../../api';
import type { ProductResponse, CategoryResponse } from '../../api';
@Service()
export class CatalogData {
  readonly api = inject(ApiProductService);
  readonly categoriesApi = inject(ApiCategoryService);
  readonly products = signal<ProductResponse[]>([]);
  readonly categories = signal<CategoryResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly total = signal(0);
  private request = 0;
  async load(search = '', categoryId = '', page = 1, pageSize = 12) {
    const request = ++this.request;
    this.loading.set(true);
    this.error.set(false);
    try {
      const data = await firstValueFrom(
        this.api.apiProductGet({
          search: search || undefined,
          categoryId: categoryId || undefined,
          page,
          pageSize,
        }),
      );
      if (request === this.request) {
        this.products.set(data.items);
        this.total.set(Number(data.totalCount));
      }
    } catch {
      if (request === this.request) this.error.set(true);
    } finally {
      if (request === this.request) this.loading.set(false);
    }
  }
  async loadCategories() {
    try {
      this.categories.set(await firstValueFrom(this.categoriesApi.apiCategoryGet()));
    } catch {
      /* Products remain usable without categories. */
    }
  }
}
