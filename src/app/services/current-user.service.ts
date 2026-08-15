import { inject, resource, Service } from '@angular/core';
import { UserResponse, UserService } from '../../api';
import { firstValueFrom, fromEvent, takeUntil } from 'rxjs';

@Service()
export class CurrentUserService {
  private readonly userService = inject(UserService);

  private readonly _me = resource<UserResponse, never>({
    loader: (param) => {
      return firstValueFrom(
        this.userService.apiUserMeGet().pipe(takeUntil(fromEvent(param.abortSignal, 'abort'))),
      );
    },
  });

  readonly me = this._me.asReadonly();
}
