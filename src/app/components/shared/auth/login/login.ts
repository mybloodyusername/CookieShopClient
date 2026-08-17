import { Component, inject, signal } from '@angular/core';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatExpansionPanelActionRow } from '@angular/material/expansion';
import { MatButton } from '@angular/material/button';
import { MatDialogClose } from '@angular/material/dialog';
import {
  form,
  FormField,
  FormRoot,
  minLength,
  required,
  TreeValidationResult,
} from '@angular/forms/signals';
import { catchError, firstValueFrom, of, switchMap } from 'rxjs';
import { ApiAuthService } from '../../../../../api';

@Component({
  selector: 'cookie-login',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatExpansionPanelActionRow,
    MatButton,
    MatDialogClose,
    FormField,
    MatError,
    FormRoot,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly apiAuthService = inject(ApiAuthService);

  formModel = signal({
    phoneNumber: '',
    password: '',
  });
  loginForm = form(
    this.formModel,
    (schemaPath) => {
      required(schemaPath.phoneNumber, { message: 'PhoneNumber is required.' });
      required(schemaPath.password, { message: 'Password is required.' });
      minLength(schemaPath.password, 8, { message: 'Password must be at least 8 characters.' });
    },
    {
      submission: {
        action: (field, detail) => {
          return firstValueFrom(
            this.apiAuthService
              .apiAuthLoginPost({
                loginRequest: {
                  phoneNumber: field.phoneNumber().value(),
                  password: field.password().value(),
                },
              })
              .pipe(
                switchMap(() => {
                  return of();
                }),
                catchError((err) => {
                  return of<TreeValidationResult>({
                    message: err.error.message ?? '',
                    kind: 'Http Request',
                  });
                }),
              ),
          );
        },
      },
    },
  );
}
