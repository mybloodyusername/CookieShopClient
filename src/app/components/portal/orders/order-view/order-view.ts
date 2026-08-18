import { Component, inject, input, resource } from '@angular/core';
import { ApiOrderService, OrderResponse } from '../../../../../api';
import { firstValueFrom, fromEvent, of, takeUntil } from 'rxjs';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatCard, MatCardContent } from '@angular/material/card';

@Component({
  selector: 'cookie-order-view',
  imports: [MatProgressBar, MatCard, MatCardContent],
  templateUrl: './order-view.html',
  styleUrl: './order-view.scss',
})
export class OrderView {
  orderId = input.required<string>();

  private readonly apiOrderService = inject(ApiOrderService);

  private readonly _order = resource<OrderResponse | undefined, string>({
    params: () => this.orderId(),
    loader: ({ params, abortSignal }) => {
      if (params)
        return firstValueFrom(
          this.apiOrderService
            .apiOrderGetByIdIdGet({ id: params })
            .pipe(takeUntil(fromEvent(abortSignal, 'abort'))),
        );
      else return firstValueFrom(of(undefined));
    },
    defaultValue: undefined,
  });

  protected order = this._order.asReadonly();
}
