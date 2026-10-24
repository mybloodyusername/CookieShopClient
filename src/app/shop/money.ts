import { Pipe, PipeTransform } from '@angular/core';
import { API_ORIGIN } from './config';
@Pipe({ name: 'toman' })
export class TomanPipe implements PipeTransform {
  transform(value: number | string | null | undefined, includeCurrency = true): string {
    const formatted = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(
      Number(value ?? 0),
    );
    return includeCurrency ? `${formatted} تومان` : formatted;
  }
}
export function imageUrl(value?: string | null): string {
  if (!value) return '/cookie-placeholder.svg';
  try {
    const url = new URL(value, API_ORIGIN);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '/cookie-placeholder.svg';
  } catch {
    return '/cookie-placeholder.svg';
  }
}
