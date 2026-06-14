import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-container">
      <div class="page-header">
        <h1 class="page-title">Orders Management</h1>
        <button class="btn btn-primary">
          <span class="material-icons">add</span>
          New Order
        </button>
      </div>

      <div class="kanban-board">
        <div class="kanban-column">
          <div class="column-header" style="background: #dbeafe;">
            <h3>New Orders</h3>
            <span class="badge badge-info">{{ getOrdersByStatus('pending').length }}</span>
          </div>
          <div class="column-content">
            <div *ngFor="let order of getOrdersByStatus('pending')" class="order-card">
              <div class="order-header">
                <strong>{{ order.customer_name }}</strong>
                <span class="badge badge-warning">{{ order.payment_status }}</span>
              </div>
              <div class="order-items">
                <div *ngFor="let item of order.items" class="item">
                  {{ item.name }} x {{ item.quantity }}
                </div>
              </div>
              <div class="order-footer">
                <strong>₹{{ order.total }}</strong>
                <button class="btn-small btn-success" (click)="updateOrderStatus(order.id, 'confirmed')">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="kanban-column">
          <div class="column-header" style="background: #fef3c7;">
            <h3>Confirmed</h3>
            <span class="badge badge-warning">{{ getOrdersByStatus('confirmed').length }}</span>
          </div>
          <div class="column-content">
            <div *ngFor="let order of getOrdersByStatus('confirmed')" class="order-card">
              <div class="order-header">
                <strong>{{ order.customer_name }}</strong>
                <span class="badge badge-success">{{ order.payment_status }}</span>
              </div>
              <div class="order-items">
                <div *ngFor="let item of order.items" class="item">
                  {{ item.name }} x {{ item.quantity }}
                </div>
              </div>
              <div class="order-footer">
                <strong>₹{{ order.total }}</strong>
                <button class="btn-small btn-primary" (click)="updateOrderStatus(order.id, 'preparing')">
                  Start Preparing
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="kanban-column">
          <div class="column-header" style="background: #e9d5ff;">
            <h3>Preparing</h3>
            <span class="badge">{{ getOrdersByStatus('preparing').length }}</span>
          </div>
          <div class="column-content">
            <div *ngFor="let order of getOrdersByStatus('preparing')" class="order-card">
              <div class="order-header">
                <strong>{{ order.customer_name }}</strong>
              </div>
              <div class="order-items">
                <div *ngFor="let item of order.items" class="item">
                  {{ item.name }} x {{ item.quantity }}
                </div>
              </div>
              <div class="order-footer">
                <strong>₹{{ order.total }}</strong>
                <button class="btn-small btn-success" (click)="updateOrderStatus(order.id, 'ready')">
                  Mark Ready
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="kanban-column">
          <div class="column-header" style="background: #d1fae5;">
            <h3>Completed</h3>
            <span class="badge badge-success">{{ getOrdersByStatus('delivered').length }}</span>
          </div>
          <div class="column-content">
            <div *ngFor="let order of getOrdersByStatus('delivered')" class="order-card completed">
              <div class="order-header">
                <strong>{{ order.customer_name }}</strong>
                <span class="material-icons" style="color: #10b981;">check_circle</span>
              </div>
              <div class="order-items">
                <div *ngFor="let item of order.items" class="item">
                  {{ item.name }} x {{ item.quantity }}
                </div>
              </div>
              <div class="order-footer">
                <strong>₹{{ order.total }}</strong>
              </div>
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
    .orders-container {
      max-width: 1600px;
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

    .kanban-board {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }

    .kanban-column {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .column-header {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #e5e7eb;
    }

    .column-header h3 {
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .column-content {
      padding: 16px;
      min-height: 400px;
      max-height: 600px;
      overflow-y: auto;
    }

    .order-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      transition: all 0.3s ease;
    }

    .order-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .order-card.completed {
      opacity: 0.7;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .order-header strong {
      color: #1f2937;
      font-size: 14px;
    }

    .order-items {
      margin-bottom: 12px;
    }

    .order-items .item {
      color: #6b7280;
      font-size: 13px;
      padding: 4px 0;
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }

    .order-footer strong {
      color: #667eea;
      font-size: 16px;
    }

    .btn-small {
      padding: 6px 12px;
      font-size: 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-small.btn-success {
      background: #10b981;
      color: white;
    }

    .btn-small.btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-small:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 1200px) {
      .kanban-board {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .kanban-board {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OrdersComponent implements OnInit {
  private apiService = inject(ApiService);

  orders: any[] = [];
  loading = true;

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    const businessId = 'demo_business';
    
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

  getOrdersByStatus(status: string) {
    return this.orders.filter(order => order.status === status);
  }

  updateOrderStatus(orderId: string, newStatus: string) {
    this.apiService.put(`/api/orders/${orderId}`, { status: newStatus }).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (error) => console.error('Error updating order:', error)
    });
  }
}
