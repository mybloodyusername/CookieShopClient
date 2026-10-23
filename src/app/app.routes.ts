import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    title: 'ثوری | یک تکه حال خوب',
    loadComponent: () => import('./shop/storefront').then((m) => m.StorefrontComponent),
  },
  {
    path: 'shop',
    title: 'فروشگاه کوکی | ثوری',
    loadComponent: () => import('./shop/catalog').then((m) => m.CatalogComponent),
  },
  {
    path: 'shop/:id',
    title: 'جزئیات کوکی | ثوری',
    loadComponent: () => import('./shop/product').then((m) => m.ProductComponent),
  },
  {
    path: 'account',
    title: 'حساب من | ثوری',
    loadComponent: () => import('./shop/account').then((m) => m.AccountComponent),
  },
  {
    path: 'cart',
    title: 'سبد خرید | ثوری',
    loadComponent: () => import('./shop/basket').then((m) => m.BasketComponent),
  },
  {
    path: 'checkout',
    title: 'ثبت سفارش | ثوری',
    loadComponent: () => import('./shop/basket').then((m) => m.BasketComponent),
  },
  {
    path: 'orders',
    title: 'سفارش‌های من | ثوری',
    loadComponent: () => import('./shop/orders').then((m) => m.OrdersComponent),
  },
  {
    path: 'about',
    title: 'داستان ثوری',
    loadComponent: () => import('./shop/about').then((m) => m.AboutComponent),
  },
  {
    path: '**',
    title: 'صفحه پیدا نشد | ثوری',
    loadComponent: () => import('./shop/not-found').then((m) => m.NotFoundComponent),
  },
];
