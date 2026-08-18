import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { type HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideNgOpenapi } from '../api';
import { BreakpointService } from './services/breakpoint.service';

// attach the auth cookie (JWT) to every cross-origin request
export const withCredentialsInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ withCredentials: true }));

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptors([withCredentialsInterceptor])),
    provideNgOpenapi({
      basePath: 'http://localhost:5265',
    }),
    provideAppInitializer(() => {
      const breakpointService = inject(BreakpointService);
    }),
  ],
};
