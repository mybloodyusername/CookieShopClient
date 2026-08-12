import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { AuthDialog } from '../shared/auth/auth-dialog';

@Component({
  selector: 'cookie-portal',
  imports: [RouterOutlet, RouterLink, MatButton],
  templateUrl: './portal.html',
  styleUrl: './portal.scss',
})
export class Portal {
  private readonly matBottomSheet = inject(MatBottomSheet);
  private readonly dialog = inject(MatDialog);
  protected openLogin() {
    this.dialog.open(AuthDialog, {
      data: { initialView: 'login' },
      disableClose: true,
      maxWidth: '90%',
      minWidth: '360px',
      width: 'auto',
    });
  }
}
