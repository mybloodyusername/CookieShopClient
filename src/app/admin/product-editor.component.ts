import { Component, inject, signal } from '@angular/core';
import { form, FormField, required, min, submit } from '@angular/forms/signals';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { firstValueFrom } from 'rxjs';
import { ApiProductService, CategoryResponse, ProductResponse } from '../../api';
import { Session } from '../shop/session';

@Component({
  selector: 'sori-product-editor',
  imports: [
    FormField,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.product ? 'ویرایش محصول' : 'محصول جدید' }}</h2>
    <form (submit)="save(); $event.preventDefault()" novalidate>
      <mat-dialog-content>
        <div class="editor-fields">
          <mat-form-field appearance="outline"
            ><mat-label>نام محصول</mat-label><input matInput [formField]="fields.name" /><mat-error
              >نام محصول را وارد کنید.</mat-error
            ></mat-form-field
          >
          <mat-form-field appearance="outline"
            ><mat-label>دسته‌بندی</mat-label
            ><mat-select [formField]="fields.categoryId">
              @for (category of data.categories; track category.id) {
                <mat-option [value]="category.id">{{ category.name }}</mat-option>
              }</mat-select
            ><mat-error>دسته‌بندی را انتخاب کنید.</mat-error></mat-form-field
          >
          <div class="field-pair">
            <mat-form-field appearance="outline"
              ><mat-label>قیمت (تومان)</mat-label
              ><input matInput type="number" [formField]="fields.price" /><mat-error
                >قیمت نمی‌تواند منفی باشد.</mat-error
              ></mat-form-field
            ><mat-form-field appearance="outline"
              ><mat-label>موجودی</mat-label
              ><input
                matInput
                type="number"
                step="1"
                [formField]="fields.stockQuantity"
              /><mat-error>موجودی نمی‌تواند منفی باشد.</mat-error></mat-form-field
            >
          </div>
          <mat-form-field appearance="outline"
            ><mat-label>توضیحات و مواد تشکیل‌دهنده</mat-label
            ><textarea matInput rows="3" [formField]="fields.description"></textarea>
          </mat-form-field>
          <mat-form-field appearance="outline"
            ><mat-label>نشانی تصویر</mat-label
            ><input matInput dir="ltr" [formField]="fields.imageUrl" /><mat-hint
              >نشانی تصویر محصول یا مسیر تصویر در سایت</mat-hint
            ></mat-form-field
          >
          <mat-checkbox [formField]="fields.isAvailable">قابل سفارش</mat-checkbox>
          <mat-checkbox [formField]="fields.isOnSale">تخفیف ویژه</mat-checkbox>
          @if (model().isOnSale) {
            <mat-form-field appearance="outline"
              ><mat-label>قیمت با تخفیف (تومان)</mat-label
              ><input matInput type="number" [formField]="fields.salePrice" /><mat-error
                >قیمت نمی‌تواند منفی باشد.</mat-error
              ></mat-form-field
            >
          }
          @if (error()) {
            <p role="alert" class="editor-error">{{ error() }}</p>
          }
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end"
        ><button mat-button type="button" [disabled]="saving()" (click)="dialog.close()">
          انصراف</button
        ><button mat-flat-button type="submit" [disabled]="saving()">
          {{ saving() ? 'در حال ذخیره…' : 'ذخیره محصول' }}
        </button></mat-dialog-actions
      >
    </form>
  `,
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
  private readonly session = inject(Session);
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
