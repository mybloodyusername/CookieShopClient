import { inject, resource, Service } from '@angular/core';
import {
  ApiCartService,
  ApiUserService,
  CartResponse,
  ProductResponse,
  UserResponse,
} from '../../api';
import { firstValueFrom, fromEvent, takeUntil } from 'rxjs';

@Service()
export class CurrentUserService {
  private readonly apiUserService = inject(ApiUserService);
  private readonly apiCartService = inject(ApiCartService);

  private readonly _me = resource<UserResponse, never>({
    loader: (param) => {
      return firstValueFrom(
        this.apiUserService.apiUserMeGet().pipe(takeUntil(fromEvent(param.abortSignal, 'abort'))),
      );
    },
  });

  private readonly _cart = resource<CartResponse, never>({
    loader: (param) => {
      return firstValueFrom(
        this.apiCartService.apiCartGet().pipe(takeUntil(fromEvent(param.abortSignal, 'abort'))),
      );
    },
  });

  readonly me = this._me.asReadonly();
  readonly cart = this._cart.asReadonly();

  addToCart(product: ProductResponse) {
    this.apiCartService
      .apiCartAddItemPost({
        addCartItemRequest: { productId: product.id, quantity: 1 },
      })
      .subscribe({
        next: (response) => {
          this._cart.set(response);
        },
        error: (error) => {
          debugger;
        },
      });
  }
}
