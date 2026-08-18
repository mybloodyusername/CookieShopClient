import { Component, computed, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { CurrentUserService } from '../../../services/current-user.service';
import { MatActionList, MatList, MatListItem } from '@angular/material/list';
import { CartItemResponse } from '../../../../api';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';

type CartItemResponseExtend = CartItemResponse & {
  total: number;
};

@Component({
  selector: 'cookie-cart',
  imports: [
    MatList,
    MatListItem,
    MatCard,
    MatCardContent,
    MatCardActions,
    MatButton,
    MatStepper,
    MatStep,
    MatActionList,
    MatIcon,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  private readonly currentUserService = inject(CurrentUserService);
  private readonly router = inject(Router);

  private readonly stepper = viewChild.required<MatStepper>('stepper');

  readonly cart = this.currentUserService.cart;
  readonly cartItems = computed<CartItemResponseExtend[]>(() => {
    try {
      const cartValue = this.cart.value();
      if (!cartValue) return [];
      return cartValue.items.map((cartItem) => {
        return {
          ...cartItem,
          total: Number(cartItem.quantity) * Number(cartItem.unitPrice),
        } as CartItemResponseExtend;
      });
    } catch (error) {
      return [];
    }
  });
  readonly totalAmount = computed(() => {
    try {
      const cartValue = this.cart.value();
      if (!cartValue) return 0;
      return Number(cartValue.totalAmount);
    } catch (error) {
      return 0;
    }
  });

  readonly address = this.currentUserService.address;
  readonly selectedAddress = linkedSignal({
    source: () => this.address.value(),
    computation: (source) => {
      return source[0];
    },
  });

  readonly orderComplete = signal<boolean>(false);

  protected submitCart() {
    const address = this.selectedAddress();
    this.currentUserService.submitCart(address.id).subscribe({
      next: (order) => {
        this.orderComplete.set(true);
        setTimeout(() => {
          this.router.navigate(['orders', order.id]);
        }, 3000);
      },
      error: (error) => {
        debugger;
      },
    });
  }

  protected cancelCart() {
    this.currentUserService.cancelCart();
  }
}
