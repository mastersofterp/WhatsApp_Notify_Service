import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="super-admin-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>🔐 Super Admin</h2>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/super-admin/overview" routerLinkActive="active" class="nav-item">
            <span class="material-icons">dashboard</span>
            <span>Platform Overview</span>
          </a>
          <a routerLink="/super-admin/platform-analytics" routerLinkActive="active" class="nav-item">
            <span class="material-icons">analytics</span>
            <span>Platform Analytics</span>
          </a>
          <a routerLink="/super-admin/businesses" routerLinkActive="active" class="nav-item">
            <span class="material-icons">business</span>
            <span>All Businesses</span>
          </a>
          <a routerLink="/super-admin/all-orders" routerLinkActive="active" class="nav-item">
            <span class="material-icons">shopping_cart</span>
            <span>All Orders</span>
          </a>
          <a routerLink="/super-admin/all-customers" routerLinkActive="active" class="nav-item">
            <span class="material-icons">people</span>
            <span>All Customers</span>
          </a>
          <a routerLink="/super-admin/settings" routerLinkActive="active" class="nav-item">
            <span class="material-icons">settings</span>
            <span>Platform Settings</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button (click)="logout()" class="logout-btn">
            <span class="material-icons">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .super-admin-layout {
      display: flex;
      min-height: 100vh;
      background: #f5f7fa;
    }

    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      left: 0;
      top: 0;
    }

    .sidebar-header {
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidebar-header h2 {
      font-size: 20px;
      font-weight: 700;
      margin: 0;
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-item.active {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border-left: 4px solid white;
    }

    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 8px;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      padding: 32px;
    }
  `]
})
export class SuperAdminLayoutComponent {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
