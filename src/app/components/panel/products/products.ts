import { Component, inject, signal } from '@angular/core';
import { StoreService } from '../../../services/store.service';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { MatCard, MatCardContent } from '@angular/material/card';
import { form, FormField, FormRoot } from '@angular/forms/signals';

@Component({
  selector: 'cookie-products',
  imports: [
    MatSelect,
    MatFormField,
    MatLabel,
    MatCard,
    MatCardContent,
    MatOption,
    FormRoot,
    FormField,
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  private readonly storeService = inject(StoreService);

  protected readonly categories = this.storeService.categories;

  private readonly searchModel = signal({
    category: '',
  });
  protected searchForm = form(this.searchModel);
}
