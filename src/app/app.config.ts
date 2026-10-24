import { MatIconRegistry } from '@angular/material/icon';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { DomSanitizer } from '@angular/platform-browser';
import { persianPaginator } from './utils/material-locale';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { provideNgOpenapi } from '../api';
import { apiSecurityInterceptor } from './interceptors/api-security.interceptor';
import { API_ORIGIN } from './config/api-origin';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: MatPaginatorIntl, useFactory: persianPaginator },
    provideAppInitializer(() => {
      inject(MatIconRegistry).addSvgIconSet(
        inject(DomSanitizer).bypassSecurityTrustResourceUrl('/material-icons.svg'),
      );
    }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    provideClientHydration(),
    provideHttpClient(withInterceptors([apiSecurityInterceptor]), withInterceptorsFromDi()),
    provideNgOpenapi({ basePath: API_ORIGIN }),
  ],
};
