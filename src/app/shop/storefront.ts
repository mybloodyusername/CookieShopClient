import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CookieCard } from './cookie-card';
import { CatalogData } from './catalog-data';
@Component({
  selector: 'sori-storefront',
  imports: [RouterLink, NgOptimizedImage, CookieCard],
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
