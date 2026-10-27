import { Routes } from '@angular/router';
import { CheckoutFlowService } from './services/checkout-flow.service';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        title: 'کوکی شاپ | یک تکه حال خوب',
        loadComponent: () => import('./components/portal/storefront/storefront').then((m) => m.StorefrontComponent),
      },
      {
        path: 'shop',
        children: [
          {
            path: '',
            title: 'فروشگاه کوکی | کوکی شاپ',
            loadComponent: () => import('./components/portal/catalog/catalog').then((m) => m.CatalogComponent),
          },
          {
            path: ':id',
            title: 'جزئیات کوکی | کوکی شاپ',
            loadComponent: () => import('./components/portal/product/product').then((m) => m.ProductComponent),
          },
        ],
      },
      {
        path: 'checkout',
        providers: [CheckoutFlowService],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'cart' },
          {
            path: 'cart',
            title: 'سبد خرید | کوکی شاپ',
            data: { checkoutStep: 'cart' },
            loadComponent: () => import('./components/portal/basket/basket').then((m) => m.BasketComponent),
          },
          {
            path: 'delivery',
            title: 'نشانی تحویل | کوکی شاپ',
            data: { checkoutStep: 'delivery' },
            loadComponent: () => import('./components/portal/basket/basket').then((m) => m.BasketComponent),
          },
          {
            path: 'review',
            title: 'مرور سفارش | کوکی شاپ',
            data: { checkoutStep: 'review' },
            loadComponent: () => import('./components/portal/basket/basket').then((m) => m.BasketComponent),
          },
        ],
      },
      {
        path: 'account',
        loadComponent: () => import('./components/portal/account-layout/account-layout').then((m) => m.AccountLayoutComponent),
        children: [
          {
            path: '',
            title: 'حساب من | کوکی شاپ',
            loadComponent: () => import('./components/portal/account/account').then((m) => m.AccountComponent),
          },
          {
            path: 'orders',
            title: 'سفارش‌های من | کوکی شاپ',
            loadComponent: () => import('./components/portal/orders/orders').then((m) => m.OrdersComponent),
          },
          {
            path: 'settings',
            title: 'تنظیمات حساب | کوکی شاپ',
            loadComponent: () => import('./components/portal/account-settings/account-settings').then((m) => m.AccountSettingsComponent),
          },
        ],
      },
      {
        path: 'about',
        title: 'داستان کوکی شاپ',
        loadComponent: () => import('./components/portal/about/about').then((m) => m.AboutComponent),
      },
    ],
  },
  {
    path: 'admin',
    title: 'پنل مدیریت | کوکی شاپ',
    loadComponent: () => import('./components/admin/admin-panel/admin-panel').then((m) => m.AdminPanelComponent),
  },
  {
    path: '**',
    title: 'صفحه پیدا نشد | کوکی شاپ',
    loadComponent: () => import('./components/portal/not-found/not-found').then((m) => m.NotFoundComponent),
  },
];
