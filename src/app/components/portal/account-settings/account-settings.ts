import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'cs-account-settings',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.scss',
})
export class AccountSettingsComponent {
  readonly session = inject(SessionService);
}
