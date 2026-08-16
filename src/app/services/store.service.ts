import { inject, resource, Service } from '@angular/core';
import { firstValueFrom, fromEvent, takeUntil } from 'rxjs';
import { ApiCategoryService } from '../../api';

@Service()
export class StoreService {
  private readonly apiCategoryService = inject(ApiCategoryService);

  private readonly _categories = resource({
    loader: ({ abortSignal }) => {
      return firstValueFrom(
        this.apiCategoryService.apiCategoryGet().pipe(takeUntil(fromEvent(abortSignal, 'abort'))),
      );
    },
  });

  readonly categories = this._categories.asReadonly();
}
