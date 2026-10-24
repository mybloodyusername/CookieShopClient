import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component, inject, input, effect, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiProductService, ProductDetailResponse } from '../../../../api';
import { SessionService } from '../../../services/session.service';
import { TomanPipe } from '../../../pipes/toman.pipe';
import { imageUrl } from '../../../utils/image-url';
@Component({
  selector: 'cs-product',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgOptimizedImage,
    RouterLink,
    TomanPipe,
  ],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class ProductComponent {
  readonly id = input.required<string>();
  readonly api = inject(ApiProductService);
  readonly session = inject(SessionService);
  readonly product = signal<ProductDetailResponse | null>(null);
  readonly selected = signal('');
  readonly loading = signal(true);
  readonly image = imageUrl;
  constructor() {
    effect((onCleanup) => {
      const id = this.id();
      let active = true;
      onCleanup(() => (active = false));
      this.loading.set(true);
      this.selected.set('');
      firstValueFrom(this.api.apiProductIdGet({ id }))
        .then((p) => {
          if (active) this.product.set(p);
        })
        .catch(() => {
          if (active) this.product.set(null);
        })
        .finally(() => {
          if (active) this.loading.set(false);
        });
    });
  }
}
