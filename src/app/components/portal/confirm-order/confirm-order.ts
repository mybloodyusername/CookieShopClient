import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'cs-confirm-order',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirm-order.html',
  styleUrl: './confirm-order.scss',
})
export class ConfirmOrderComponent {}
