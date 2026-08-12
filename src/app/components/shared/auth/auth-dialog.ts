import { Component, input, linkedSignal } from '@angular/core';
import { Login } from './login/login';
import { Register } from './register/register';
import { MatDialogContent } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

type DialogView = 'login' | 'register';

@Component({
  selector: 'cookie-auth',
  imports: [Login, Register, MatDialogContent, MatButton],
  templateUrl: './auth-dialog.html',
  styleUrl: './auth-dialog.scss',
})
export class AuthDialog {
  initialViewMode = input<DialogView>('login');
  viewMode = linkedSignal({
    source: this.initialViewMode,
    computation: (source) => source,
  });
}
