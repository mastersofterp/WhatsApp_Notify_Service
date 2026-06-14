import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-container">
      <h1 class="page-title">Analytics & Reports</h1>

      <div class="stats-grid grid grid-4">
        <div class="stat-card">
          <div class="stat-header">
            <span class="material-icons">shopping_cart</span>
            <h4>Total Orders</h4>
          </div>
          <h2>{{ analytics?.total_orders || 0 }}</h2>
          <p class="trend positive">+12% from last month</p>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="material-icons">attach_money</span>
            <h4>Total Revenue</h4>
          </div>
          <h2>₹{{ analytics?.total_revenue || 0 }}</h2>
          <p class="trend positive">+18% from last month</p>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="material-icons">people</span>
            <h4>Total Customers</h4>
          </div>
          <h2>{{ analytics?.total_customers || 0 }}</h2>
          <p class="trend positive">+8% from last month</p>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="material-icons">trending_up</span>
            <h4>Avg Order Value</h4>
          </div>
          <h2>₹{{ analytics?.average_order_value || 0 }}</h2>
          <p class="trend positive">+5% from last month</p>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <h3 class="card-header">Revenue Trend</h3>
          <div class="chart-placeholder">
            <span class="material-icons">show_chart</span>
            <p>Revenue chart will be displayed here</p>
            <small>Install Chart.js to see visualizations</small>
          </div>
        </div>

        <div class="card">
          <h3 class="card-header">Top Selling Items</h3>
          <div class="top-items">
            <div class="item-row">
              <span class="rank">1</span>
              <div class="item-info">
                <strong>Chocolate Truffle Cake</strong>
                <p>145 orders</p>
              </div>
              <span class="revenue">₹12,325</span>
            </div>
            <div class="item-row">
              <span class="rank">2</span>
              <div class="item-info">
                <strong>Black Forest Cake</strong>
                <p>128 orders</p>
              </div>
              <span class="revenue">₹10,880</span>
            </div>
            <div class="item-row">
              <span class="rank">3</span>
              <div class="item-info">
                <strong>Red Velvet Cake</strong>
                <p>112 orders</p>
              </div>
              <span class="revenue">₹9,520</span>
            </div>
            <div class="item-row">
              <span class="rank">4</span>
              <div class="item-info">
                <strong>Vanilla Pastry</strong>
                <p>98 orders</p>
              </div>
              <span class="revenue">₹4,900</span>
            </div>
            <div class="item-row">
              <span class="rank">5</span>
              <div class="item-info">
                <strong>Butterscotch Cake</strong>
                <p>87 orders</p>
              </div>
              <span class="revenue">₹7,395</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <h3 class="card-header">Peak Hours</h3>
          <div class="chart-placeholder">
            <span class="material-icons">access_time</span>
            <p>Peak hours heatmap</p>
            <small>Most orders: 2PM - 6PM</small>
          </div>
        </div>

        <div class="card">
          <h3 class="card-header">Customer Segments</h3>
          <div class="segments">
            <div class="segment-row">
              <div class="segment-label">
                <span class="dot" style="background: #667eea;"></span>
                <span>VIP Customers</span>
              </div>
              <span class="segment-value">24%</span>
            </div>
            <div class="segment-row">
              <div class="segment-label">
                <span class="dot" style="background: #10b981;"></span>
                <span>Regular Customers</span>
              </div>
              <span class="segment-value">45%</span>
            </div>
            <div class="segment-row">
              <div class="segment-label">
                <span class="dot" style="background: #f59e0b;"></span>
                <span>New Customers</span>
              </div>
              <span class="segment-value">31%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header-row">
          <h3>Recent Activity</h3>
          <button class="btn">Export Report</button>
        </div>
        <div class="activity-list">
          <div class="activity-item">
            <span class="material-icons">shopping_cart</span>
            <div>
              <strong>New order from Rahul Kumar</strong>
              <p>₹850 • 2 items • 5 minutes ago</p>
            </div>
          </div>
          <div class="activity-item">
            <span class="material-icons">person_add</span>
            <div>
              <strong>New customer registered</strong>
              <p>Priya Sharma • 15 minutes ago</p>
            </div>
          </div>
          <div class="activity-item">
            <span class="material-icons">payment</span>
            <div>
              <strong>Payment received</strong>
              <p>₹1,250 from Amit Patel • 23 minutes ago</p>
            </div>
          </div>
          <div class="activity-item">
            <span class="material-icons">campaign</span>
            <div>
              <strong>Campaign sent</strong>
              <p>Diwali Offer • 150 customers • 1 hour ago</p>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
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
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .stat-header .material-icons {
      color: #667eea;
      font-size: 24px;
    }

    .stat-header h4 {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      margin: 0;
    }

    .stat-card h2 {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .trend {
      font-size: 14px;
      font-weight: 600;
    }

    .trend.positive {
      color: #10b981;
    }

    .trend.negative {
      color: #ef4444;
    }

    .chart-placeholder {
      text-align: center;
      padding: 60px 20px;
      background: #f9fafb;
      border-radius: 8px;
      color: #9ca3af;
    }

    .chart-placeholder .material-icons {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .top-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .item-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .rank {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }

    .item-info {
      flex: 1;
    }

    .item-info strong {
      display: block;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .item-info p {
      color: #6b7280;
      font-size: 13px;
    }

    .revenue {
      font-weight: 700;
      color: #667eea;
      font-size: 16px;
    }

    .segments {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px 0;
    }

    .segment-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .segment-label {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .segment-value {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
    }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .activity-item .material-icons {
      color: #667eea;
      font-size: 24px;
    }

    .activity-item strong {
      display: block;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .activity-item p {
      color: #6b7280;
      font-size: 13px;
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  private apiService = inject(ApiService);

  analytics: any = null;
  loading = true;

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    const businessId = 'demo_business';
    
    this.apiService.get<any>(`/api/analytics/${businessId}`).subscribe({
      next: (response) => {
        this.analytics = response.analytics;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.loading = false;
      }
    });
  }
}
