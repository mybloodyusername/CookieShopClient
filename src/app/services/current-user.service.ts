import { inject, resource, Service } from '@angular/core';
import {
  AddressResponse,
  ApiAddressService,
  ApiCartService,
  ApiOrderService,
  ApiUserService,
  CartResponse,
  OrderResponse,
  ProductResponse,
  UserResponse,
} from '../../api';
import { firstValueFrom, fromEvent, takeUntil } from 'rxjs';

@Service()
export class CurrentUserService {
  private readonly apiUserService = inject(ApiUserService);
  private readonly apiCartService = inject(ApiCartService);
  private readonly apiOrderService = inject(ApiOrderService);
  private readonly apiAddressService = inject(ApiAddressService);

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

  private readonly _address = resource<AddressResponse[], never>({
    loader: (param) => {
      return firstValueFrom(
        this.apiAddressService
          .apiAddressGet()
          .pipe(takeUntil(fromEvent(param.abortSignal, 'abort'))),
      );
    },
    defaultValue: [],
  });

  private readonly _orders = resource<OrderResponse[], never>({
    loader: (param) => {
      return firstValueFrom(
        this.apiOrderService.apiOrderGet().pipe(takeUntil(fromEvent(param.abortSignal, 'abort'))),
      );
    },
    defaultValue: [],
  });

  readonly me = this._me.asReadonly();
  readonly cart = this._cart.asReadonly();
  readonly address = this._address.asReadonly();
  readonly orders = this._orders.asReadonly();

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

  cancelCart() {
    this.apiCartService.apiCartClearDelete().subscribe({
      next: (response) => {
        this._cart.set(response);
      },
      error: (error) => {
        debugger;
      },
    });
  }

  submitCart(addressId: string) {
    return this.apiOrderService.apiOrderCreatePost({ createOrderRequest: { addressId, note: '' } });
  }
}
