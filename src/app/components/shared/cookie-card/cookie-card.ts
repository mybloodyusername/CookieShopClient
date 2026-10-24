import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Component, input, inject, computed } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { ProductResponse } from '../../../../api';
import { SessionService } from '../../../services/session.service';
import { TomanPipe } from '../../../pipes/toman.pipe';
import { imageUrl } from '../../../utils/image-url';
@Component({
  selector: 'cs-cookie-card',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    NgOptimizedImage,
    RouterLink,
    TomanPipe,
  ],
  templateUrl: './cookie-card.html',
})
export class CookieCard {
  readonly product = input.required<ProductResponse>();
  readonly available = computed(() => this.product().isAvailable && +this.product().stockQuantity > 0);
  readonly session = inject(SessionService);
  readonly quantity = computed(() => Number(this.session.cart()?.items.find((item) => item.productId === this.product().id)?.quantity ?? 0));
  readonly inCart = computed(() => this.quantity() > 0);
  readonly image = imageUrl;
  fallback(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/cookie-placeholder.svg';
  }
}
