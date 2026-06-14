import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-all-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <div class="all-orders">
      <div class="header">
        <h1>All Orders - Platform Wide</h1>
        <mat-form-field appearance="outline">
          <mat-label>Search</mat-label>
          <input matInput [(ngModel)]="searchTerm" (input)="filterOrders()" placeholder="Search by business, customer, order ID...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="stats-row">
            <div class="stat">
              <span class="label">Total Orders:</span>
              <span class="value">{{filteredOrders.length}}</span>
            </div>
            <div class="stat">
              <span class="label">Total Revenue:</span>
              <span class="value">₹{{calculateTotalRevenue() | number}}</span>
            </div>
          </div>

          <table mat-table [dataSource]="filteredOrders" class="orders-table">
            <ng-container matColumnDef="order_id">
              <th mat-header-cell *matHeaderCellDef>Order ID</th>
              <td mat-cell *matCellDef="let element">
                <code>{{element.id?.substring(0, 8)}}</code>
              </td>
            </ng-container>

            <ng-container matColumnDef="business">
              <th mat-header-cell *matHeaderCellDef>Business</th>
              <td mat-cell *matCellDef="let element">
                <strong>{{element.business_name}}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let element">
                {{element.customer_name}}<br>
                <small>{{element.customer_phone}}</small>
              </td>
            </ng-container>

            <ng-container matColumnDef="items">
              <th mat-header-cell *matHeaderCellDef>Items</th>
              <td mat-cell *matCellDef="let element">
                {{element.items?.length || 0}} items
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let element">
                <strong>₹{{element.total_amount | number}}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let element">
                <mat-chip [class]="'status-' + element.status">
                  {{element.status}}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="payment">
              <th mat-header-cell *matHeaderCellDef>Payment</th>
              <td mat-cell *matCellDef="let element">
                <mat-chip [class]="'payment-' + element.payment_status">
                  {{element.payment_status}}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let element">
                {{element.created_at | date:'short'}}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let element">
                <button mat-icon-button (click)="viewOrderDetails(element)" color="primary">
                  <mat-icon>visibility</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div *ngIf="filteredOrders.length === 0" class="no-data">
            <mat-icon>inbox</mat-icon>
            <p>No orders found</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .all-orders {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h1 {
        margin: 0;
        color: #333;
      }

      mat-form-field {
        width: 300px;
      }
    }

    .stats-row {
      display: flex;
      gap: 32px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;

      .stat {
        .label {
          color: #666;
          font-size: 14px;
          margin-right: 8px;
        }

        .value {
          font-size: 20px;
          font-weight: 600;
          color: #333;
        }
      }
    }

    .orders-table {
      width: 100%;

      code {
        background: #f5f5f5;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
      }

      small {
        color: #999;
        font-size: 12px;
      }

      mat-chip {
        font-size: 11px;
        min-height: 24px;
        padding: 0 8px;

        &.status-pending {
          background: #fff3cd;
          color: #856404;
        }

        &.status-confirmed {
          background: #d1ecf1;
          color: #0c5460;
        }

        &.status-preparing {
          background: #d1ecf1;
          color: #0c5460;
        }

        &.status-ready {
          background: #d4edda;
          color: #155724;
        }

        &.status-completed {
          background: #d4edda;
          color: #155724;
        }

        &.status-cancelled {
          background: #f8d7da;
          color: #721c24;
        }

        &.payment-paid {
          background: #d4edda;
          color: #155724;
        }

        &.payment-unpaid {
          background: #fff3cd;
          color: #856404;
        }

        &.payment-failed {
          background: #f8d7da;
          color: #721c24;
        }
      }
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #999;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
      }
    }
  `]
})
export class AllOrdersComponent implements OnInit {
  allOrders: any[] = [];
  filteredOrders: any[] = [];
  searchTerm: string = '';
  displayedColumns: string[] = ['order_id', 'business', 'customer', 'items', 'amount', 'status', 'payment', 'date', 'actions'];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadAllOrders();
  }

  loadAllOrders() {
    this.apiService.get('/super-admin/all-orders').subscribe({
      next: (response: any) => {
        this.allOrders = response.orders || [];
        this.filteredOrders = [...this.allOrders];
      },
      error: (error) => {
        console.error('Error loading all orders:', error);
      }
    });
  }

  filterOrders() {
    if (!this.searchTerm) {
      this.filteredOrders = [...this.allOrders];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredOrders = this.allOrders.filter(order =>
      order.business_name?.toLowerCase().includes(term) ||
      order.customer_name?.toLowerCase().includes(term) ||
      order.customer_phone?.includes(term) ||
      order.id?.toLowerCase().includes(term)
    );
  }

  calculateTotalRevenue(): number {
    return this.filteredOrders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);
  }

  viewOrderDetails(order: any) {
    console.log('View order:', order);
  }
}
