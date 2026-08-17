import { inject, resource, Service, signal } from '@angular/core';
import { firstValueFrom, fromEvent, takeUntil } from 'rxjs';
import {
  ApiCategoryService,
  ApiProductGetParams,
  ApiProductService,
  PagedResultOfProductResponse,
} from '../../api';
import { map } from 'rxjs/operators';

@Service()
export class StoreService {
  private readonly apiCategoryService = inject(ApiCategoryService);
  private readonly apiProductService = inject(ApiProductService);

  readonly productParams = signal<ApiProductGetParams>({
    pageSize: 5,
    page: 1,
    search: '',
    categoryId: '',
  });

  private readonly _categories = resource({
    loader: ({ abortSignal }) => {
      return firstValueFrom(
        this.apiCategoryService.apiCategoryGet().pipe(takeUntil(fromEvent(abortSignal, 'abort'))),
      );
    },
    defaultValue: [],
  });

  private readonly _products = resource({
    params: () => {
      const productParams = this.productParams();
      return {
        productParams,
      };
    },
    loader: ({ abortSignal, params: { productParams } }) => {
      return firstValueFrom(
        this.apiProductService.apiProductGet({ ...productParams }).pipe(
          takeUntil(fromEvent(abortSignal, 'abort')),
          map(
            (value) =>
              ({
                ...value,
                page: Number(value.page) - 1,
              }) as PagedResultOfProductResponse,
          ),
        ),
      );
    },
    defaultValue: {
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 5,
    } as PagedResultOfProductResponse,
  });

  readonly categories = this._categories.asReadonly();
  readonly products = this._products.asReadonly();
}
