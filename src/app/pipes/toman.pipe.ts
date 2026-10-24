import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'toman' })
export class TomanPipe implements PipeTransform {
  transform(value: number | string | null | undefined, includeCurrency = true): string {
    const formatted = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(
      Number(value ?? 0),
    );
    return includeCurrency ? `${formatted} تومان` : formatted;
  }
}
