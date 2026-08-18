import { Component, inject } from '@angular/core';
import { StoreService } from '../../../services/store.service';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'cookie-home',
  imports: [ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly storeService = inject(StoreService);

  protected readonly products = this.storeService.products;

  constructor() {
    this.storeService.productParams.set({
      page: 1,
      pageSize: 100,
      search: '',
      categoryId: '',
    });
  }
}
