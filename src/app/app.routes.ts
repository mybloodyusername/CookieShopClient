import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    title: 'ثوری | یک تکه حال خوب',
    loadComponent: () => import('./components/portal/storefront/storefront').then((m) => m.StorefrontComponent),
  },
  {
    path: 'shop',
    title: 'فروشگاه کوکی | ثوری',
    loadComponent: () => import('./components/portal/catalog/catalog').then((m) => m.CatalogComponent),
  },
  {
    path: 'shop/:id',
    title: 'جزئیات کوکی | ثوری',
    loadComponent: () => import('./components/portal/product/product').then((m) => m.ProductComponent),
  },
  {
    path: 'account',
    title: 'حساب من | ثوری',
    loadComponent: () => import('./components/portal/account/account').then((m) => m.AccountComponent),
  },
  {
    path: 'cart',
    title: 'سبد خرید | ثوری',
    loadComponent: () => import('./components/portal/basket/basket').then((m) => m.BasketComponent),
  },
  {
    path: 'checkout',
    title: 'ثبت سفارش | ثوری',
    loadComponent: () => import('./components/portal/basket/basket').then((m) => m.BasketComponent),
  },
  {
    path: 'orders',
    title: 'سفارش‌های من | ثوری',
    loadComponent: () => import('./components/portal/orders/orders').then((m) => m.OrdersComponent),
  },
  {
    path: 'about',
    title: 'داستان ثوری',
    loadComponent: () => import('./components/portal/about/about').then((m) => m.AboutComponent),
  },
  {
    path: 'admin',
    title: 'پنل مدیریت | ثوری',
    loadComponent: () => import('./components/admin/admin-panel/admin-panel').then((m) => m.AdminPanelComponent),
  },
  {
    path: '**',
    title: 'صفحه پیدا نشد | ثوری',
    loadComponent: () => import('./components/portal/not-found/not-found').then((m) => m.NotFoundComponent),
  },
];
