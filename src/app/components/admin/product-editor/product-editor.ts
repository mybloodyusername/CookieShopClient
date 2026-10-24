import { Component, inject, signal } from '@angular/core';
import { form, FormField, required, min, submit } from '@angular/forms/signals';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { firstValueFrom } from 'rxjs';
import { ApiProductService, CategoryResponse, ProductResponse } from '../../../../api';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'cs-product-editor',
  imports: [
    FormField,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './product-editor.html',
  styles: `
    .editor-fields {
      display: grid;
      gap: 8px;
      padding-top: 8px;
    }
    .field-pair {
      display: grid;
      gap: 8px;
    }
    mat-form-field {
      width: 100%;
      min-width: 0;
    }
    .editor-error {
      color: var(--mat-sys-error);
    }
    @media (min-width: 600px) {
      .field-pair {
        grid-template-columns: 1fr 1fr;
      }
    }
  `,
})
export class ProductEditorComponent {
  readonly data = inject<{ product?: ProductResponse; categories: CategoryResponse[] }>(
    MAT_DIALOG_DATA,
  );
  readonly dialog = inject(MatDialogRef<ProductEditorComponent>);
  private readonly api = inject(ApiProductService);
  private readonly session = inject(SessionService);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly model = signal({
    name: this.data.product?.name ?? '',
    categoryId: this.data.product?.categoryId ?? '',
    price: Number(this.data.product?.price ?? 0),
    stockQuantity: Number(this.data.product?.stockQuantity ?? 0),
    description: this.data.product?.description ?? '',
    imageUrl: this.data.product?.imageUrl ?? '',
    isAvailable: this.data.product?.isAvailable ?? true,
    isOnSale: this.data.product?.isOnSale ?? false,
    salePrice: Number(this.data.product?.salePrice ?? 0),
  });
  readonly fields = form(this.model, (p) => {
    required(p.name);
    required(p.categoryId);
    required(p.price);
    required(p.stockQuantity);
    min(p.price, 0);
    min(p.stockQuantity, 0);
    min(p.salePrice, 0);
  });
  async save() {
    if (this.saving()) return;
    this.error.set('');
    await submit(this.fields, async () => {
      const model = this.model();
      if (
        !model.name.trim() ||
        !Number.isInteger(model.stockQuantity) ||
        (model.isOnSale && model.salePrice >= model.price)
      ) {
        this.error.set('نام معتبر، موجودی صحیح و قیمت تخفیف کمتر از قیمت اصلی وارد کنید.');
        return;
      }
      this.saving.set(true);
      this.dialog.disableClose = true;
      try {
        const value = {
          ...model,
          name: model.name.trim(),
          salePrice: model.isOnSale ? model.salePrice : null,
        };
        if (this.data.product)
          await firstValueFrom(
            this.api.apiProductUpdateByAdminPut({
              updateProductRequest: { ...value, id: this.data.product.id },
            }),
          );
        else
          await firstValueFrom(
            this.api.apiProductCreateByAdminPost({ createProductRequest: value }),
          );
        this.session.notice.set('محصول ذخیره شد.');
        this.dialog.close(true);
      } catch {
        this.error.set('ذخیره محصول ممکن نشد. اطلاعات و دسترسی حساب را بررسی کنید.');
      } finally {
        this.saving.set(false);
        this.dialog.disableClose = false;
      }
    });
  }
}
