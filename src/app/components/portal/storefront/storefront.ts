import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CookieCard } from '../../shared/cookie-card/cookie-card';
import { CatalogDataService } from '../../../services/catalog-data.service';
@Component({
  selector: 'cs-storefront',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    RouterLink,
    NgOptimizedImage,
    CookieCard,
  ],
  providers: [CatalogDataService],
  templateUrl: './storefront.html',
})
export class StorefrontComponent {
  readonly data = inject(CatalogDataService);
  constructor() {
    void this.data.load('', '', 4);
    void this.data.loadCategories();
  }
}
