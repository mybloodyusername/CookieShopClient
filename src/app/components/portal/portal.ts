import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AuthDialog } from '../shared/auth/auth-dialog';
import { CurrentUserService } from '../../services/current-user.service';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';

@Component({
  selector: 'cookie-portal',
  imports: [RouterOutlet, RouterLink, MatButton, MatIcon, MatIconButton, MatBadge],
  templateUrl: './portal.html',
  styleUrl: './portal.scss',
})
export class Portal {
  private readonly dialog = inject(MatDialog);
  private readonly currentUserService = inject(CurrentUserService);

  protected readonly me = this.currentUserService.me;
  protected readonly cart = this.currentUserService.cart;

  protected openLogin() {
    this.dialog.open(AuthDialog, {
      data: { initialView: 'login' },
      disableClose: true,
      maxWidth: '90%',
      minWidth: '360px',
      width: 'auto',
    });
  }

  protected openCart() {
    console.log('Cart: ------>', this.cart.value());
  }
}
