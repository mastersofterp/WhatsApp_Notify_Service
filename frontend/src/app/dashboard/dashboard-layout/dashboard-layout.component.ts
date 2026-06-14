import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="dashboard-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>WhatsApp AI</h2>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/dashboard/overview" routerLinkActive="active" class="nav-item">
            <span class="material-icons">dashboard</span>
            <span>Overview</span>
          </a>
          <a routerLink="/dashboard/orders" routerLinkActive="active" class="nav-item">
            <span class="material-icons">shopping_cart</span>
            <span>Orders</span>
          </a>
          <a routerLink="/dashboard/customers" routerLinkActive="active" class="nav-item">
            <span class="material-icons">people</span>
            <span>Customers</span>
          </a>
          <a routerLink="/dashboard/menu" routerLinkActive="active" class="nav-item">
            <span class="material-icons">restaurant_menu</span>
            <span>Menu</span>
          </a>
          <a routerLink="/dashboard/campaigns" routerLinkActive="active" class="nav-item">
            <span class="material-icons">campaign</span>
            <span>Campaigns</span>
          </a>
          <a routerLink="/dashboard/analytics" routerLinkActive="active" class="nav-item">
            <span class="material-icons">analytics</span>
            <span>Analytics</span>
          </a>
          <a routerLink="/dashboard/settings" routerLinkActive="active" class="nav-item">
            <span class="material-icons">settings</span>
            <span>Settings</span>
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
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
      background: #f5f7fa;
    }

    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
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
      overflow-y: auto;
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

    .nav-item .material-icons {
      font-size: 20px;
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
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 70px;
      }

      .sidebar-header h2,
      .nav-item span:not(.material-icons),
      .logout-btn span:not(.material-icons) {
        display: none;
      }

      .main-content {
        margin-left: 70px;
      }
    }
  `]
})
export class DashboardLayoutComponent {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
