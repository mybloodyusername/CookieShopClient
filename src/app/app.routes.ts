import { Routes } from '@angular/router';
import { Portal } from './components/portal/portal';
import { NotFound } from './components/shared/not-found/not-found';
import { Home } from './components/portal/home/home';
import { About } from './components/portal/about/about';
import { Dashboard } from './components/panel/dashboard/dashboard';
import { Setting } from './components/panel/setting/setting';
import { Panel } from './components/panel/panel';

export const routes: Routes = [
  {
    path: 'panel',
    component: Panel,
    children: [
      {
        path: '',
        component: Dashboard,
      },
      {
        path: 'setting',
        component: Setting,
      },
    ],
  },
  {
    path: '',
    component: Portal,
    children: [
      {
        path: '',
        component: Home,
      },
      {
        path: 'about',
        component: About,
      },
    ],
  },
  {
    path: '**',
    component: NotFound,
  },
];
