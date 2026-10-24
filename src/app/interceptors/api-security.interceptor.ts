import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { from, switchMap, tap } from 'rxjs';
import { API_ORIGIN } from '../config/api-origin';
import { CsrfService } from '../services/csrf.service';
export const apiSecurityInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(API_ORIGIN + '/')) return next(request);
  const csrf = inject(CsrfService);
  const authenticated = request.clone({ withCredentials: true });
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return next(authenticated);
  return from(csrf.get()).pipe(
    switchMap((token) => next(authenticated.clone({ setHeaders: { 'X-CSRF-TOKEN': token } }))),
    tap({
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && [400, 401, 403].includes(error.status))
          csrf.reset();
      },
      next: (event) => {
        if (event instanceof HttpResponse && /\/Auth\/(Login|Logout|Register)$/.test(request.url))
          csrf.reset();
      },
    }),
  );
};
