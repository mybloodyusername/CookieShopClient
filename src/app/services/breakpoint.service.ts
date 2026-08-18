import { DOCUMENT, effect, inject, Service } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

const MEDIA_QUERY_TO_NAME = new Map([
  ['(max-width: 599.98px)', 'XSmall'],
  ['(min-width: 600px) and (max-width: 959.98px)', 'Small'],
  ['(min-width: 960px) and (max-width: 1279.98px)', 'Medium'],
  ['(min-width: 1280px) and (max-width: 1919.98px)', 'Large'],
  ['(min-width: 1920px)', 'XLarge'],
]);

const NAME_TO_MEDIA_QUERY = new Map([
  ['XSmall', '(max-width: 599.98px)'],
  ['Small', '(min-width: 600px) and (max-width: 959.98px)'],
  ['Medium', '(min-width: 960px) and (max-width: 1279.98px)'],
  ['Large', '(min-width: 1280px) and (max-width: 1919.98px)'],
  ['XLarge', '(min-width: 1920px)'],
]);

@Service()
export class BreakpointService {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly document = inject(DOCUMENT);

  readonly isHandset = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  private readonly activeBreakpoint$ = this.breakpointObserver
    .observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
    ])
    .pipe(
      map((result) => {
        const activeBreakPoint = Object.entries(result.breakpoints).find(([, value]) => value)!;
        return MEDIA_QUERY_TO_NAME.get(activeBreakPoint[0])!;
      }),
    );

  readonly activeBreakpoint = toSignal(this.activeBreakpoint$, { initialValue: 'Large' });

  constructor() {
    effect(() => {
      const activeBreakpoint = this.activeBreakpoint();
      const isHandset = this.isHandset();
      this.document.documentElement.setAttribute('data-breakpoint', activeBreakpoint);
      this.document.documentElement.setAttribute('data-handset', String(isHandset));
    });
  }
}
