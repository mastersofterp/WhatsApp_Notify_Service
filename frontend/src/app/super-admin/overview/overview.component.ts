import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-super-admin-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overview-container">
      <h1 class="page-title">Platform Overview</h1>

      <div class="stats-grid grid grid-4">
        <div class="stat-card">
          <h3>{{ businesses.length }}</h3>
          <p>Total Businesses</p>
        </div>
        <div class="stat-card">
          <h3>{{ activeBusinesses }}</h3>
          <p>Active Businesses</p>
        </div>
        <div class="stat-card">
          <h3>5,234</h3>
          <p>Total Customers</p>
        </div>
        <div class="stat-card">
          <h3>₹2,45,680</h3>
          <p>Platform Revenue</p>
        </div>
      </div>

      <div class="card">
        <h2 class="card-header">All Businesses</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Owner Email</th>
              <th>Phone Number ID</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let business of businesses">
              <td><strong>{{ business.name }}</strong></td>
              <td>{{ business.owner_email }}</td>
              <td>{{ business.phone_number_id }}</td>
              <td>
                <span class="badge" [ngClass]="business.is_active ? 'badge-success' : 'badge-danger'">
                  {{ business.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ business.created_at | date:'short' }}</td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="loading" class="loading">
          <div class="spinner"></div>
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
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .stat-card h3 {
      font-size: 32px;
      font-weight: 700;
      color: #ef4444;
      margin-bottom: 8px;
    }

    .stat-card p {
      color: #6b7280;
      font-size: 14px;
    }
  `]
})
export class SuperAdminOverviewComponent implements OnInit {
  private apiService = inject(ApiService);

  businesses: any[] = [];
  loading = true;
  activeBusinesses = 0;

  ngOnInit() {
    this.loadBusinesses();
  }

  loadBusinesses() {
    this.apiService.get<any>('/api/businesses').subscribe({
      next: (response) => {
        this.businesses = response.businesses;
        this.activeBusinesses = this.businesses.filter(b => b.is_active).length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading businesses:', error);
        this.loading = false;
      }
    });
  }
}
