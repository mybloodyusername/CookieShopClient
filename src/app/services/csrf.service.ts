import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_ORIGIN } from '../config/api-origin';

@Service()
export class CsrfService {
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
