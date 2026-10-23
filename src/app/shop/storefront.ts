import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
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
    MatButtonModule,
    MatChipsModule,
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
