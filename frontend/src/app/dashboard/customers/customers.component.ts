import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="customers-container">
      <div class="page-header">
        <h1 class="page-title">Customer Management</h1>
        <button class="btn btn-primary" (click)="showAddCustomer = true">
          <span class="material-icons">person_add</span>
          Add Customer
        </button>
      </div>

      <div class="filters">
        <input 
          type="text" 
          placeholder="Search customers..." 
          [(ngModel)]="searchTerm"
          (ngModelChange)="filterCustomers()"
          class="search-input"
        >
        <select [(ngModel)]="filterSegment" (ngModelChange)="filterCustomers()" class="filter-select">
          <option value="all">All Customers</option>
          <option value="VIP">VIP</option>
          <option value="Regular">Regular</option>
          <option value="New">New</option>
        </select>
      </div>

      <div class="stats-row grid grid-4">
        <div class="stat-card">
          <h3>{{ customers.length }}</h3>
          <p>Total Customers</p>
        </div>
        <div class="stat-card">
          <h3>{{ getCustomersBySegment('VIP').length }}</h3>
          <p>VIP Customers</p>
        </div>
        <div class="stat-card">
          <h3>{{ getCustomersBySegment('Regular').length }}</h3>
          <p>Regular Customers</p>
        </div>
        <div class="stat-card">
          <h3>{{ getCustomersBySegment('New').length }}</h3>
          <p>New Customers</p>
        </div>
      </div>

      <div class="card">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Total Orders</th>
              <th>Total Spent</th>
              <th>Loyalty Points</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let customer of filteredCustomers">
              <td>
                <strong>{{ customer.name || 'Unknown' }}</strong>
                <div *ngIf="customer.birthday" style="font-size: 12px; color: #6b7280;">
                  🎂 {{ customer.birthday }}
                </div>
              </td>
              <td>{{ customer.phone }}</td>
              <td>{{ customer.total_orders || 0 }}</td>
              <td>₹{{ customer.total_spent || 0 }}</td>
              <td>
                <span class="badge badge-success">{{ customer.loyalty_points || 0 }} pts</span>
              </td>
              <td>
                <span *ngFor="let tag of customer.tags" class="badge badge-info" style="margin-right: 4px;">
                  {{ tag }}
                </span>
              </td>
              <td>
                <button class="btn-icon" (click)="editCustomer(customer)">
                  <span class="material-icons">edit</span>
                </button>
                <button class="btn-icon" (click)="sendMessage(customer)">
                  <span class="material-icons">message</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="loading" class="loading">
          <div class="spinner"></div>
        </div>

        <div *ngIf="!loading && filteredCustomers.length === 0" class="empty-state">
          <span class="material-icons">people_outline</span>
          <p>No customers found</p>
        </div>
      </div>

      <!-- Add Customer Modal -->
      <div *ngIf="showAddCustomer" class="modal-overlay" (click)="showAddCustomer = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>Add New Customer</h2>
          <form (ngSubmit)="addCustomer()">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input type="text" [(ngModel)]="newCustomer.name" name="name" required>
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input type="tel" [(ngModel)]="newCustomer.phone" name="phone" required pattern="[0-9]{10}" maxlength="10">
              <small>Enter 10-digit phone number</small>
            </div>
            <div class="form-group">
              <label class="form-label">Birthday (Optional)</label>
              <input type="date" [(ngModel)]="newCustomer.birthday" name="birthday">
            </div>
            <div class="form-group">
              <label class="form-label">Notes (Optional)</label>
              <textarea [(ngModel)]="newCustomer.notes" name="notes" rows="3"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn" (click)="showAddCustomer = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Add Customer</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Customer Modal -->
      <div *ngIf="showEditCustomer" class="modal-overlay" (click)="showEditCustomer = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>Edit Customer</h2>
          <form (ngSubmit)="updateCustomer()">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input type="text" [(ngModel)]="editingCustomer.name" name="editName" required>
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input type="tel" [(ngModel)]="editingCustomer.phone" name="editPhone" required pattern="[0-9]{10}" maxlength="10">
              <small>Enter 10-digit phone number</small>
            </div>
            <div class="form-group">
              <label class="form-label">Birthday (Optional)</label>
              <input type="date" [(ngModel)]="editingCustomer.birthday" name="editBirthday">
            </div>
            <div class="form-group">
              <label class="form-label">Notes (Optional)</label>
              <textarea [(ngModel)]="editingCustomer.notes" name="editNotes" rows="3"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn" (click)="showEditCustomer = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Update Customer</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Send Message Modal -->
      <div *ngIf="showSendMessage" class="modal-overlay" (click)="showSendMessage = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>Send WhatsApp Message</h2>
          <div *ngIf="messageData.customer" style="margin-bottom: 16px; padding: 12px; background: #f3f4f6; border-radius: 8px;">
            <strong>To:</strong> {{ messageData.customer.name }} ({{ messageData.customer.phone }})
          </div>
          <form (ngSubmit)="sendWhatsAppMessage()">
            <div class="form-group">
              <label class="form-label">Message</label>
              <textarea 
                [(ngModel)]="messageData.message" 
                name="message" 
                rows="6" 
                placeholder="Type your message here..."
                required
              ></textarea>
              <small>Tip: Use WhatsApp formatting - *bold*, _italic_, ~strikethrough~</small>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn" (click)="showSendMessage = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Send Message</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .customers-container {
      max-width: 1400px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-title {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
    }

    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .search-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
    }

    .filter-select {
      padding: 12px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      min-width: 200px;
    }

    .stats-row {
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .stat-card h3 {
      font-size: 28px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 8px;
    }

    .stat-card p {
      color: #6b7280;
      font-size: 14px;
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
      color: #667eea;
    }

    .btn-icon .material-icons {
      font-size: 20px;
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
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content h2 {
      margin-bottom: 24px;
      color: #1f2937;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #9ca3af;
    }

    .empty-state .material-icons {
      font-size: 64px;
      margin-bottom: 16px;
    }
  `]
})
export class CustomersComponent implements OnInit {
  private apiService = inject(ApiService);

  customers: any[] = [];
  filteredCustomers: any[] = [];
  loading = true;
  searchTerm = '';
  filterSegment = 'all';
  showAddCustomer = false;
  showEditCustomer = false;
  showSendMessage = false;
  newCustomer: any = {};
  editingCustomer: any = {};
  messageData: any = { customer: null, message: '' };

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    const businessId = 'demo_business';
    
    this.apiService.get<any>(`/api/customers/${businessId}`).subscribe({
      next: (response) => {
        this.customers = response.customers;
        this.filteredCustomers = this.customers;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loading = false;
      }
    });
  }

  filterCustomers() {
    this.filteredCustomers = this.customers.filter(customer => {
      const matchesSearch = !this.searchTerm || 
        customer.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.phone?.includes(this.searchTerm);
      
      const matchesSegment = this.filterSegment === 'all' || 
        customer.tags?.includes(this.filterSegment);
      
      return matchesSearch && matchesSegment;
    });
  }

  getCustomersBySegment(segment: string) {
    return this.customers.filter(c => c.tags?.includes(segment));
  }

  addCustomer() {
    const businessId = 'demo_business';
    this.newCustomer.business_id = businessId;
    
    this.apiService.post(`/api/customers/${businessId}`, this.newCustomer).subscribe({
      next: () => {
        this.showAddCustomer = false;
        this.newCustomer = {};
        this.loadCustomers();
      },
      error: (error) => console.error('Error adding customer:', error)
    });
  }

  editCustomer(customer: any) {
    this.editingCustomer = { ...customer };
    this.showEditCustomer = true;
  }

  updateCustomer() {
    const businessId = 'demo_business';
    
    this.apiService.put(`/api/customers/${businessId}/${this.editingCustomer.id}`, this.editingCustomer).subscribe({
      next: () => {
        this.showEditCustomer = false;
        this.editingCustomer = {};
        this.loadCustomers();
        alert('Customer updated successfully!');
      },
      error: (error) => {
        console.error('Error updating customer:', error);
        alert('Failed to update customer');
      }
    });
  }

  sendMessage(customer: any) {
    this.messageData = { customer: customer, message: '' };
    this.showSendMessage = true;
  }

  sendWhatsAppMessage() {
    const businessId = 'demo_business';
    
    const payload = {
      business_id: businessId,
      phone: this.messageData.customer.phone,
      message: this.messageData.message
    };

    this.apiService.post('/api/send-message', payload).subscribe({
      next: () => {
        this.showSendMessage = false;
        this.messageData = { customer: null, message: '' };
        alert('Message sent successfully!');
      },
      error: (error) => {
        console.error('Error sending message:', error);
        alert('Failed to send message');
      }
    });
  }
}
