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
  selector: 'app-all-customers',
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
    <div class="all-customers">
      <div class="header">
        <h1>All Customers - Platform Wide</h1>
        <mat-form-field appearance="outline">
          <mat-label>Search</mat-label>
          <input matInput [(ngModel)]="searchTerm" (input)="filterCustomers()" placeholder="Search by name, phone, business...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="stats-row">
            <div class="stat">
              <span class="label">Total Customers:</span>
              <span class="value">{{filteredCustomers.length}}</span>
            </div>
            <div class="stat">
              <span class="label">Total Spent:</span>
              <span class="value">₹{{calculateTotalSpent() | number}}</span>
            </div>
            <div class="stat">
              <span class="label">Avg Orders/Customer:</span>
              <span class="value">{{calculateAvgOrders() | number:'1.1-1'}}</span>
            </div>
          </div>

          <table mat-table [dataSource]="filteredCustomers" class="customers-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let element">
                <div class="customer-info">
                  <strong>{{element.name}}</strong><br>
                  <small>{{element.phone}}</small>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="business">
              <th mat-header-cell *matHeaderCellDef>Business</th>
              <td mat-cell *matCellDef="let element">
                {{element.business_name}}
              </td>
            </ng-container>

            <ng-container matColumnDef="orders">
              <th mat-header-cell *matHeaderCellDef>Orders</th>
              <td mat-cell *matCellDef="let element">
                <mat-chip class="orders-chip">
                  {{element.total_orders || 0}}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="spent">
              <th mat-header-cell *matHeaderCellDef>Total Spent</th>
              <td mat-cell *matCellDef="let element">
                <strong>₹{{element.total_spent || 0 | number}}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="loyalty">
              <th mat-header-cell *matHeaderCellDef>Loyalty Points</th>
              <td mat-cell *matCellDef="let element">
                <span class="loyalty-points">
                  <mat-icon>stars</mat-icon>
                  {{element.loyalty_points || 0}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="birthday">
              <th mat-header-cell *matHeaderCellDef>Birthday</th>
              <td mat-cell *matCellDef="let element">
                <span *ngIf="element.birthday">{{element.birthday | date:'MMM d'}}</span>
                <span *ngIf="!element.birthday" class="no-data">-</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="tags">
              <th mat-header-cell *matHeaderCellDef>Tags</th>
              <td mat-cell *matCellDef="let element">
                <mat-chip *ngFor="let tag of element.tags" class="tag-chip">
                  {{tag}}
                </mat-chip>
                <span *ngIf="!element.tags || element.tags.length === 0" class="no-data">-</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let element">
                <button mat-icon-button (click)="viewCustomerDetails(element)" color="primary">
                  <mat-icon>visibility</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div *ngIf="filteredCustomers.length === 0" class="no-data-message">
            <mat-icon>people_outline</mat-icon>
            <p>No customers found</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .all-customers {
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

    .customers-table {
      width: 100%;

      .customer-info {
        strong {
          color: #333;
        }

        small {
          color: #999;
          font-size: 12px;
        }
      }

      .orders-chip {
        background: #e3f2fd;
        color: #1976d2;
        font-weight: 600;
      }

      .loyalty-points {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #ff9800;
        font-weight: 600;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .tag-chip {
        font-size: 11px;
        min-height: 24px;
        padding: 0 8px;
        margin-right: 4px;
        background: #e8eaf6;
        color: #3f51b5;
      }

      .no-data {
        color: #999;
      }
    }

    .no-data-message {
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
export class AllCustomersComponent implements OnInit {
  allCustomers: any[] = [];
  filteredCustomers: any[] = [];
  searchTerm: string = '';
  displayedColumns: string[] = ['name', 'business', 'orders', 'spent', 'loyalty', 'birthday', 'tags', 'actions'];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadAllCustomers();
  }

  loadAllCustomers() {
    this.apiService.get('/super-admin/all-customers').subscribe({
      next: (response: any) => {
        this.allCustomers = response.customers || [];
        this.filteredCustomers = [...this.allCustomers];
      },
      error: (error) => {
        console.error('Error loading all customers:', error);
      }
    });
  }

  filterCustomers() {
    if (!this.searchTerm) {
      this.filteredCustomers = [...this.allCustomers];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredCustomers = this.allCustomers.filter(customer =>
      customer.name?.toLowerCase().includes(term) ||
      customer.phone?.includes(term) ||
      customer.business_name?.toLowerCase().includes(term)
    );
  }

  calculateTotalSpent(): number {
    return this.filteredCustomers.reduce((sum, customer) => sum + (customer.total_spent || 0), 0);
  }

  calculateAvgOrders(): number {
    if (this.filteredCustomers.length === 0) return 0;
    const totalOrders = this.filteredCustomers.reduce((sum, customer) => sum + (customer.total_orders || 0), 0);
    return totalOrders / this.filteredCustomers.length;
  }

  viewCustomerDetails(customer: any) {
    console.log('View customer:', customer);
  }
}
