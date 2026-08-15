import { Routes } from '@angular/router';
import { Portal } from './components/portal/portal';
import { NotFound } from './components/shared/not-found/not-found';
import { Panel } from './components/panel/panel';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: 'panel',
    component: Panel,
    canActivate: [roleGuard('admin')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/panel/dashboard/dashboard').then((c) => c.Dashboard),
      },
      {
        path: 'products',
        loadComponent: () => import('./components/panel/products/products').then((c) => c.Products),
      },
      {
        path: 'orders',
        loadComponent: () => import('./components/panel/orders/orders').then((c) => c.Orders),
      },
      {
        path: 'setting',
        loadComponent: () => import('./components/panel/setting/setting').then((c) => c.Setting),
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: '',
      },
    ],
  },
  {
    path: '',
    component: Portal,
    children: [
      {
        path: '',
        loadComponent: () => import('./components/portal/home/home').then((c) => c.Home),
      },
      {
        path: 'about',
        loadComponent: () => import('./components/portal/about/about').then((c) => c.About),
      },
    ],
  },
  {
    path: '**',
    component: NotFound,
  },
];
