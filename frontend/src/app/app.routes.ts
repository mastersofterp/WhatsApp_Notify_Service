import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { superAdminGuard } from './core/guards/super-admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        loadComponent: () => import('./dashboard/overview/overview.component').then(m => m.OverviewComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./dashboard/orders/orders.component').then(m => m.OrdersComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./dashboard/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'menu',
        loadComponent: () => import('./dashboard/menu/menu.component').then(m => m.MenuComponent)
      },
      {
        path: 'campaigns',
        loadComponent: () => import('./dashboard/campaigns/campaigns.component').then(m => m.CampaignsComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./dashboard/analytics/analytics.component').then(m => m.AnalyticsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./dashboard/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  {
    path: 'super-admin',
    loadComponent: () => import('./super-admin/super-admin-layout/super-admin-layout.component').then(m => m.SuperAdminLayoutComponent),
    canActivate: [authGuard, superAdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        loadComponent: () => import('./super-admin/overview/overview.component').then(m => m.SuperAdminOverviewComponent)
      },
      {
        path: 'platform-analytics',
        loadComponent: () => import('./features/super-admin/platform-analytics/platform-analytics.component').then(m => m.PlatformAnalyticsComponent)
      },
      {
        path: 'all-orders',
        loadComponent: () => import('./features/super-admin/all-orders/all-orders.component').then(m => m.AllOrdersComponent)
      },
      {
        path: 'all-customers',
        loadComponent: () => import('./features/super-admin/all-customers/all-customers.component').then(m => m.AllCustomersComponent)
      },
      {
        path: 'businesses',
        loadComponent: () => import('./super-admin/businesses/businesses.component').then(m => m.BusinessesComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./super-admin/settings/settings.component').then(m => m.SuperAdminSettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
