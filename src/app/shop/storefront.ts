import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CookieCard } from './cookie-card';
import { CatalogData } from './catalog-data';
@Component({
  selector: 'sori-storefront',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    RouterLink,
    NgOptimizedImage,
    CookieCard,
  ],
  providers: [CatalogData],
  templateUrl: './storefront.html',
})
export class StorefrontComponent {
  readonly data = inject(CatalogData);
  constructor() {
    void this.data.load('', '', 1, 4);
    void this.data.loadCategories();
  }
}
