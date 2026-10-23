import { inject, Service } from '@angular/core';
import {
  HttpClient,
  HttpInterceptorFn,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { firstValueFrom, from, switchMap, tap } from 'rxjs';
import { API_ORIGIN } from './config';
@Service()
export class Csrf {
  private readonly http = inject(HttpClient);
  private token: Promise<string> | undefined;
  reset() {
    this.token = undefined;
  }
  get() {
    return (this.token ??= firstValueFrom(
      this.http.get<{ token: string }>(API_ORIGIN + '/api/Auth/Csrf', { withCredentials: true }),
    )
      .then((value) => value.token)
      .catch((error: unknown) => {
        this.reset();
        throw error;
      }));
  }
}
export const apiSecurity: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(API_ORIGIN + '/')) return next(request);
  const csrf = inject(Csrf);
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
