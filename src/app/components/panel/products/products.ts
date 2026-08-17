import { AfterViewInit, Component, effect, inject, signal } from '@angular/core';
import { StoreService } from '../../../services/store.service';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { MatDivider } from '@angular/material/list';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';

@Component({
  selector: 'cookie-products',
  imports: [
    FormRoot,
    FormField,
    MatDivider,
    MatTable,
    MatPaginator,
    MatHeaderCell,
    MatColumnDef,
    MatHeaderCellDef,
    MatCellDef,
    MatCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRowDef,
    MatRow,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  private readonly storeService = inject(StoreService);

  protected readonly categories = this.storeService.categories;
  protected readonly products = this.storeService.products;
  protected readonly productParams = this.storeService.productParams;

  private readonly searchModel = signal({
    category: '',
  });
  protected searchForm = form(this.searchModel);

  protected displayedColumns = [
    'name',
    'description',
    'price',
    'isOnSale',
    'salePrice',
    'stockQuantity',
    'isAvailable',
  ];

  constructor() {
    effect(() => {
      debugger;
      const searchModel = this.searchModel();
      this.productParams.update((v) => ({ ...v, categoryId: searchModel.category }));
    });
  }

  protected onPageChange($event: PageEvent) {
    const { pageSize, pageIndex, previousPageIndex, length } = $event;
    const products = this.products.value();

    if (products.pageSize !== pageSize) {
      this.productParams.update((v) => ({
        ...v,
        page: 1,
        pageSize: pageSize,
      }));
      return;
    }

    this.productParams.update((v) => ({
      ...v,
      page: pageIndex + 1,
      pageSize: pageSize,
    }));
  }
}
