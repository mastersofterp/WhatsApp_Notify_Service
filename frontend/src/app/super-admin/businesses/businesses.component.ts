import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-businesses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="businesses-container">
      <div class="page-header">
        <h1 class="page-title">Manage Businesses</h1>
        <button class="btn btn-primary" (click)="showAddBusiness = true">
          <span class="material-icons">add_business</span>
          Add Business
        </button>
      </div>

      <div class="card">
        <table class="table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Owner</th>
              <th>Phone ID</th>
              <th>UPI ID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let business of businesses">
              <td><strong>{{ business.name }}</strong></td>
              <td>{{ business.owner_email }}</td>
              <td>{{ business.phone_number_id }}</td>
              <td>{{ business.upi_id }}</td>
              <td>
                <span class="badge" [ngClass]="business.is_active ? 'badge-success' : 'badge-danger'">
                  {{ business.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button class="btn-icon" (click)="toggleStatus(business)">
                  <span class="material-icons">{{ business.is_active ? 'block' : 'check_circle' }}</span>
                </button>
                <button class="btn-icon" (click)="deleteBusiness(business)">
                  <span class="material-icons">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="loading" class="loading">
          <div class="spinner"></div>
        </div>
      </div>

      <!-- Add Business Modal -->
      <div *ngIf="showAddBusiness" class="modal-overlay" (click)="showAddBusiness = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>Add New Business</h2>
          <form (ngSubmit)="addBusiness()">
            <div class="form-group">
              <label class="form-label">Business Name</label>
              <input type="text" [(ngModel)]="newBusiness.name" name="name" required minlength="3">
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number ID</label>
              <input type="text" [(ngModel)]="newBusiness.phone_number_id" name="phone_id" required minlength="10">
              <small>WhatsApp Business Phone Number ID</small>
            </div>
            <div class="form-group">
              <label class="form-label">WABA ID</label>
              <input type="text" [(ngModel)]="newBusiness.waba_id" name="waba_id" required minlength="10">
              <small>WhatsApp Business Account ID</small>
            </div>
            <div class="form-group">
              <label class="form-label">UPI ID</label>
              <input type="text" [(ngModel)]="newBusiness.upi_id" name="upi_id" required pattern="[a-zA-Z0-9.]+@[a-zA-Z]+">
              <small>Format: username@bankname</small>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn" (click)="showAddBusiness = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Add Business</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .businesses-container {
      max-width: 1400px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .page-title {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #6b7280;
      transition: color 0.3s ease;
    }

    .btn-icon:hover {
      color: #ef4444;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      padding: 32px;
      width: 90%;
      max-width: 500px;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }
  `]
})
export class BusinessesComponent implements OnInit {
  private apiService = inject(ApiService);

  businesses: any[] = [];
  loading = true;
  showAddBusiness = false;
  newBusiness: any = {};

  ngOnInit() {
    this.loadBusinesses();
  }

  loadBusinesses() {
    this.apiService.get<any>('/api/businesses').subscribe({
      next: (response) => {
        this.businesses = response.businesses;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading businesses:', error);
        this.loading = false;
      }
    });
  }

  addBusiness() {
    this.apiService.post('/api/businesses', this.newBusiness).subscribe({
      next: () => {
        this.showAddBusiness = false;
        this.newBusiness = {};
        this.loadBusinesses();
      },
      error: (error) => console.error('Error adding business:', error)
    });
  }

  toggleStatus(business: any) {
    this.apiService.put(`/api/businesses/${business.id}`, { 
      is_active: !business.is_active 
    }).subscribe({
      next: () => this.loadBusinesses(),
      error: (error) => console.error('Error updating business:', error)
    });
  }

  deleteBusiness(business: any) {
    if (confirm(`Delete ${business.name}?`)) {
      this.apiService.delete(`/api/businesses/${business.id}`).subscribe({
        next: () => this.loadBusinesses(),
        error: (error) => console.error('Error deleting business:', error)
      });
    }
  }
}
