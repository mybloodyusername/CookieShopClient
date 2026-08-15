import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { CurrentUserService } from '../services/current-user';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { switchMap } from 'rxjs';

export const roleGuard = (role: 'customer' | 'admin'): CanActivateFn => {
  return (route, state) => {
    const currentUserService = inject(CurrentUserService);
    const me = currentUserService.me;
    const isLoading = me.isLoading();
    if (isLoading) {
      const value$ = toObservable(me.value);
      const status$ = toObservable(me.status);
      return status$.pipe(
        filter((status) => status == 'resolved'),
        switchMap(() => value$),
        map((res) =>
          res && res.role ? res.role.toLowerCase().includes(role.toLowerCase()) : false,
        ),
      );
    }
    const meValue = me.value();
    if (!meValue || !meValue.role) return false;
    return meValue.role.toLowerCase().includes(role.toLowerCase());
  };
};
