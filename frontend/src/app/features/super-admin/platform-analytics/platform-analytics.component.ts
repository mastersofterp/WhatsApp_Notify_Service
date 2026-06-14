import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-platform-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="platform-analytics">
      <h1>Platform Analytics</h1>

      <!-- Platform Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon businesses">
              <mat-icon>business</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{platformStats?.total_businesses || 0}}</h3>
              <p>Total Businesses</p>
              <span class="active-count">{{platformStats?.active_businesses || 0}} Active</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon revenue">
              <mat-icon>payments</mat-icon>
            </div>
            <div class="stat-info">
              <h3>₹{{platformStats?.total_revenue || 0 | number}}</h3>
              <p>Total Revenue</p>
              <span class="avg">Avg: ₹{{platformStats?.average_revenue_per_business || 0 | number}}/business</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon orders">
              <mat-icon>shopping_cart</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{platformStats?.total_orders || 0}}</h3>
              <p>Total Orders</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon customers">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{platformStats?.total_customers || 0}}</h3>
              <p>Total Customers</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Revenue by Business -->
      <mat-card class="revenue-table-card">
        <mat-card-header>
          <mat-card-title>Revenue by Business</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="table-container">
            <table class="revenue-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Business Name</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                  <th>Avg Order Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let element of revenueByBusiness; let i = index">
                  <td>
                    <span class="rank-badge" [class.top]="i < 3">#{{i + 1}}</span>
                  </td>
                  <td><strong>{{element.business_name}}</strong></td>
                  <td><strong>₹{{element.revenue | number}}</strong></td>
                  <td>{{element.orders}}</td>
                  <td>₹{{element.average_order_value | number}}</td>
                  <td>
                    <button mat-icon-button (click)="viewBusinessDetails(element.business_id)" color="primary">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .platform-analytics {
      padding: 20px;
    }

    h1 {
      margin-bottom: 24px;
      color: #333;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      mat-card-content {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: white;
        }

        &.businesses {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.revenue {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &.orders {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        &.customers {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
      }

      .stat-info {
        flex: 1;

        h3 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
          color: #333;
        }

        p {
          margin: 4px 0;
          color: #666;
          font-size: 14px;
        }

        .active-count, .avg {
          font-size: 12px;
          color: #999;
        }
      }
    }

    .revenue-table-card {
      margin-top: 20px;

      mat-card-header {
        margin-bottom: 16px;
      }
    }

    .revenue-table {
      width: 100%;
      border-collapse: collapse;

      thead {
        background: #f5f5f5;

        th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #ddd;
        }
      }

      tbody {
        tr {
          border-bottom: 1px solid #eee;

          &:hover {
            background: #f9f9f9;
          }

          td {
            padding: 12px;
          }
        }
      }

      .rank-badge {
        padding: 4px 8px;
        border-radius: 12px;
        background: #f5f5f5;
        font-weight: 600;
        font-size: 12px;

        &.top {
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          color: #333;
        }
      }
    }
  `]
})
export class PlatformAnalyticsComponent implements OnInit {
  platformStats: any = null;
  revenueByBusiness: any[] = [];
  displayedColumns: string[] = ['rank', 'business_name', 'revenue', 'orders', 'avg_order_value', 'actions'];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadPlatformStats();
    this.loadRevenueByBusiness();
  }

  loadPlatformStats() {
    this.apiService.get('/super-admin/platform-stats').subscribe({
      next: (response: any) => {
        this.platformStats = response;
      },
      error: (error) => {
        console.error('Error loading platform stats:', error);
      }
    });
  }

  loadRevenueByBusiness() {
    this.apiService.get('/super-admin/revenue-by-business').subscribe({
      next: (response: any) => {
        this.revenueByBusiness = response.revenue_by_business || [];
      },
      error: (error) => {
        console.error('Error loading revenue by business:', error);
      }
    });
  }

  viewBusinessDetails(businessId: string) {
    // Navigate to business details or open dialog
    console.log('View business:', businessId);
  }
}
