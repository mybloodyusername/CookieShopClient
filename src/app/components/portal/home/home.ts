import { Component, inject } from '@angular/core';
import { ApiProductService, ApiUserService } from '../../../../api';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { StoreService } from '../../../services/store.service';

@Component({
  selector: 'cookie-home',
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardActions,
    MatButton,
    MatGridList,
    MatGridTile,
  ],
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
