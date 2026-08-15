import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { switchMap } from 'rxjs';
import { CurrentUserService } from '../services/current-user.service';

export const roleGuard = (role: 'customer' | 'admin'): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);
    const currentUserService = inject(CurrentUserService);
    const redirect = new RedirectCommand(router.parseUrl(''));
    const me = currentUserService.me;
    const isLoading = me.isLoading();

    if (isLoading) {
      const value$ = toObservable(me.value);
      const status$ = toObservable(me.status);
      return status$.pipe(
        filter((status) => status == 'resolved'),
        switchMap(() => value$),
        map((res) =>
          res && res.role ? res.role.toLowerCase().includes(role.toLowerCase()) : redirect,
        ),
      );
    }
    const meValue = me.value();
    if (!meValue || !meValue.role) return redirect;
    return meValue.role.toLowerCase().includes(role.toLowerCase());
  };
};
