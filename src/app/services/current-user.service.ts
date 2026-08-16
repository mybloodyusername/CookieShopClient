import { inject, resource, Service } from '@angular/core';
import { ApiUserService, UserResponse } from '../../api';
import { firstValueFrom, fromEvent, takeUntil } from 'rxjs';

@Service()
export class CurrentUserService {
  private readonly apiUserService = inject(ApiUserService);

  private readonly _me = resource<UserResponse, never>({
    loader: (param) => {
      return firstValueFrom(
        this.apiUserService.apiUserMeGet().pipe(takeUntil(fromEvent(param.abortSignal, 'abort'))),
      );
    },
  });

  readonly me = this._me.asReadonly();
}
