import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Users } from './pages/users/users';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'incoming', pathMatch: 'full' },
      {
        path: 'incoming',
        loadComponent: () =>
          import('./pages/dashboard/incoming/incoming').then(
            (m) => m.IncomingDocumentsPage
          ),
      },
      {
        path: 'process',
        loadComponent: () =>
          import('./pages/dashboard/process/process').then(
            (m) => m.ProcessDocumentsPage
          ),
      },
      {
        path: 'document/:id',
        loadComponent: () =>
          import('./pages/dashboard/document-view/document-view').then(
            (m) => m.DocumentViewPage
          ),
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('./pages/dashboard/statistics/statistics').then(
            (m) => m.StatisticsPage
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/dashboard/settings/settings').then(
            (m) => m.SettingsPage
          ),
      },
      {
        path: 'user-manager',
        loadComponent: () =>
          import('./pages/dashboard/user-manager/user-manager').then(
            (m) => m.UserManagerPage
          )
      }
    ],
  },
  { path: 'user', component: Users },
  {
    path: 'documents',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/documents/document-list/document-list').then(
            (m) => m.DocumentList
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./pages/documents/document-create/document-create').then(
            (m) => m.DocumentCreate
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
