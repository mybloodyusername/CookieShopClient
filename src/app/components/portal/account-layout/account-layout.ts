import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'cs-account-layout',
  imports: [MatIconModule, MatListModule, MatTabsModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './account-layout.html',
  styleUrl: './account-layout.scss',
})
export class AccountLayoutComponent {
  readonly session = inject(SessionService);
  readonly links = [
    { label: 'پیشخوان', path: '/account', icon: 'dashboard', exact: true },
    { label: 'سفارش‌ها', path: '/account/orders', icon: 'receipt_long', exact: false },
    { label: 'تنظیمات', path: '/account/settings', icon: 'manage_accounts', exact: false },
  ];
}
