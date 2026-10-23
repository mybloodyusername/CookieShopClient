import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'sori-confirm-order',
  imports: [MatDialogModule, MatButtonModule],
  template: ` <h2 mat-dialog-title>این سفارش لغو شود؟</h2>
    <mat-dialog-content>با لغو سفارش، رزرو کوکی‌های این سفارش برداشته می‌شود.</mat-dialog-content>
    <mat-dialog-actions align="end"
      ><button mat-stroked-button [mat-dialog-close]="true">بله، لغو شود</button
      ><button mat-flat-button data-keep-order [mat-dialog-close]="false">
        خیر
      </button></mat-dialog-actions
    >`,
})
export class ConfirmOrderComponent {}
