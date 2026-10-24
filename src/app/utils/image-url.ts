import { API_ORIGIN } from '../config/api-origin';

export function imageUrl(value?: string | null): string {
  if (!value) return '/cookie-placeholder.svg';
  try {
    const url = new URL(value, API_ORIGIN);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '/cookie-placeholder.svg';
  } catch {
    return '/cookie-placeholder.svg';
  }
}
