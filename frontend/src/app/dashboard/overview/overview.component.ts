import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overview-container">
      <h1 class="page-title">Dashboard Overview</h1>

      <div class="stats-grid grid grid-4">
        <div class="stat-card">
          <div class="stat-icon" style="background: #dbeafe;">
            <span class="material-icons" style="color: #3b82f6;">shopping_cart</span>
          </div>
          <div class="stat-content">
            <h3>{{ analytics?.total_orders || 0 }}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #d1fae5;">
            <span class="material-icons" style="color: #10b981;">attach_money</span>
          </div>
          <div class="stat-content">
            <h3>₹{{ analytics?.total_revenue || 0 }}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fef3c7;">
            <span class="material-icons" style="color: #f59e0b;">people</span>
          </div>
          <div class="stat-content">
            <h3>{{ analytics?.total_customers || 0 }}</h3>
            <p>Total Customers</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #e9d5ff;">
            <span class="material-icons" style="color: #a855f7;">trending_up</span>
          </div>
          <div class="stat-content">
            <h3>₹{{ analytics?.average_order_value || 0 }}</h3>
            <p>Avg Order Value</p>
          </div>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <h2 class="card-header">Recent Orders</h2>
          <div *ngIf="loading" class="loading">
            <div class="spinner"></div>
          </div>
          <div *ngIf="!loading && orders.length === 0" class="empty-state">
            <span class="material-icons">inbox</span>
            <p>No orders yet</p>
          </div>
          <div *ngIf="!loading && orders.length > 0" class="order-list">
            <div *ngFor="let order of orders.slice(0, 5)" class="order-item">
              <div>
                <strong>{{ order.customer_name }}</strong>
                <p>₹{{ order.total }}</p>
              </div>
              <span class="badge" [ngClass]="{
                'badge-success': order.payment_status === 'paid',
                'badge-warning': order.payment_status === 'unpaid'
              }">
                {{ order.payment_status }}
              </span>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="card-header">Quick Actions</h2>
          <div class="action-buttons">
            <button class="action-btn">
              <span class="material-icons">add</span>
              <span>Add Menu Item</span>
            </button>
            <button class="action-btn">
              <span class="material-icons">campaign</span>
              <span>Send Campaign</span>
            </button>
            <button class="action-btn">
              <span class="material-icons">person_add</span>
              <span>Add Customer</span>
            </button>
            <button class="action-btn">
              <span class="material-icons">settings</span>
              <span>Configure Bot</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overview-container {
      max-width: 1400px;
    }

    .page-title {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 32px;
    }

    .stats-grid {
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon .material-icons {
      font-size: 28px;
    }

    .stat-content h3 {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .stat-content p {
      color: #6b7280;
      font-size: 14px;
    }

    .order-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .order-item strong {
      display: block;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .order-item p {
      color: #6b7280;
      font-size: 14px;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }

    .action-btn:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .action-btn .material-icons {
      font-size: 20px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #9ca3af;
    }

    .empty-state .material-icons {
      font-size: 48px;
      margin-bottom: 12px;
    }
  `]
})
export class OverviewComponent implements OnInit {
  private apiService = inject(ApiService);

  analytics: any = null;
  orders: any[] = [];
  loading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const businessId = 'demo_business';
    
    this.apiService.get<any>(`/api/analytics/${businessId}`).subscribe({
      next: (response) => {
        this.analytics = response.analytics;
      },
      error: (error) => console.error('Error loading analytics:', error)
    });

    this.apiService.get<any>(`/api/orders/${businessId}`).subscribe({
      next: (response) => {
        this.orders = response.orders;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }
}
