import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="menu-container">
      <div class="page-header">
        <h1 class="page-title">Menu Management</h1>
        <button class="btn btn-primary" (click)="showAddItem = true">
          <span class="material-icons">add</span>
          Add Menu Item
        </button>
      </div>

      <div class="categories">
        <button 
          *ngFor="let cat of categories" 
          class="category-btn"
          [class.active]="selectedCategory === cat"
          (click)="selectedCategory = cat; filterByCategory()"
        >
          {{ cat }}
        </button>
      </div>

      <div class="menu-grid grid grid-3">
        <div *ngFor="let item of filteredItems" class="menu-card">
          <div class="menu-image" [style.background-image]="'url(' + (item.image_url || 'https://via.placeholder.com/300') + ')'">
            <div class="menu-badges">
              <span *ngIf="item.is_bestseller" class="badge badge-warning">⭐ Bestseller</span>
              <span *ngIf="!item.is_available" class="badge badge-danger">Out of Stock</span>
            </div>
          </div>
          <div class="menu-content">
            <h3>{{ item.name }}</h3>
            <p class="category">{{ item.category }}</p>
            <div class="price-section">
              <span class="price">₹{{ item.price }}</span>
              <div class="variants" *ngIf="item.variants && item.variants.length">
                <span *ngFor="let variant of item.variants" class="variant">
                  {{ variant.name }}: ₹{{ variant.price }}
                </span>
              </div>
            </div>
            <div class="menu-actions">
              <button class="btn-icon" (click)="editItem(item)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-icon" (click)="toggleAvailability(item)">
                <span class="material-icons">{{ item.is_available ? 'visibility_off' : 'visibility' }}</span>
              </button>
              <button class="btn-icon" (click)="deleteItem(item)">
                <span class="material-icons">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <!-- Add Item Modal -->
      <div *ngIf="showAddItem" class="modal-overlay" (click)="showAddItem = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>Add Menu Item</h2>
          <form (ngSubmit)="addMenuItem()">
            <div class="form-group">
              <label class="form-label">Item Name</label>
              <input type="text" [(ngModel)]="newItem.name" name="name" required>
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <select [(ngModel)]="newItem.category" name="category" required>
                <option value="Cakes">Cakes</option>
                <option value="Pastries">Pastries</option>
                <option value="Cookies">Cookies</option>
                <option value="Breads">Breads</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Price (₹)</label>
              <input type="number" [(ngModel)]="newItem.price" name="price" required min="1" max="100000">
            </div>
            <div class="form-group">
              <label class="form-label">Image URL (Optional)</label>
              <input type="url" [(ngModel)]="newItem.image_url" name="image_url">
            </div>
            <div class="form-group">
              <label class="form-label">Preparation Time</label>
              <input type="text" [(ngModel)]="newItem.prep_time" name="prep_time" placeholder="e.g., 24 hours">
            </div>
            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" [(ngModel)]="newItem.is_bestseller" name="is_bestseller">
                Mark as Bestseller
              </label>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn" (click)="showAddItem = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Add Item</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Item Modal -->
      <div *ngIf="showEditItem" class="modal-overlay" (click)="showEditItem = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>Edit Menu Item</h2>
          <form (ngSubmit)="updateMenuItem()">
            <div class="form-group">
              <label class="form-label">Item Name</label>
              <input type="text" [(ngModel)]="editingItem.name" name="editName" required>
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <select [(ngModel)]="editingItem.category" name="editCategory" required>
                <option value="Cakes">Cakes</option>
                <option value="Pastries">Pastries</option>
                <option value="Cookies">Cookies</option>
                <option value="Breads">Breads</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Price (₹)</label>
              <input type="number" [(ngModel)]="editingItem.price" name="editPrice" required min="1" max="100000">
            </div>
            <div class="form-group">
              <label class="form-label">Image URL (Optional)</label>
              <input type="url" [(ngModel)]="editingItem.image_url" name="editImage">
            </div>
            <div class="form-group">
              <label class="form-label">Preparation Time</label>
              <input type="text" [(ngModel)]="editingItem.prep_time" name="editPrep" placeholder="e.g., 24 hours">
            </div>
            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" [(ngModel)]="editingItem.is_bestseller" name="editBestseller">
                Mark as Bestseller
              </label>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn" (click)="showEditItem = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Update Item</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .menu-container {
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

    .categories {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }

    .category-btn {
      padding: 10px 20px;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .category-btn:hover {
      border-color: #667eea;
      color: #667eea;
    }

    .category-btn.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-color: transparent;
    }

    .menu-grid {
      gap: 24px;
    }

    .menu-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .menu-card:hover {
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      transform: translateY(-4px);
    }

    .menu-image {
      height: 200px;
      background-size: cover;
      background-position: center;
      position: relative;
    }

    .menu-badges {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .menu-content {
      padding: 20px;
    }

    .menu-content h3 {
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .category {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 12px;
    }

    .price-section {
      margin-bottom: 16px;
    }

    .price {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
    }

    .variants {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 8px;
    }

    .variant {
      font-size: 13px;
      color: #6b7280;
    }

    .menu-actions {
      display: flex;
      gap: 8px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    .btn-icon {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      padding: 8px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #6b7280;
    }

    .btn-icon:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .btn-icon .material-icons {
      font-size: 18px;
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

    @media (max-width: 768px) {
      .menu-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MenuComponent implements OnInit {
  private apiService = inject(ApiService);

  menuItems: any[] = [];
  filteredItems: any[] = [];
  categories = ['All', 'Cakes', 'Pastries', 'Cookies', 'Breads', 'Beverages'];
  selectedCategory = 'All';
  loading = true;
  showAddItem = false;
  showEditItem = false;
  newItem: any = { is_bestseller: false, is_available: true };
  editingItem: any = {};

  ngOnInit() {
    this.loadMenu();
  }

  loadMenu() {
    const businessId = 'demo_business';
    
    this.apiService.get<any>(`/api/menu/${businessId}`).subscribe({
      next: (response) => {
        this.menuItems = response.menu;
        this.filteredItems = this.menuItems;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading menu:', error);
        this.loading = false;
      }
    });
  }

  filterByCategory() {
    if (this.selectedCategory === 'All') {
      this.filteredItems = this.menuItems;
    } else {
      this.filteredItems = this.menuItems.filter(item => item.category === this.selectedCategory);
    }
  }

  addMenuItem() {
    const businessId = 'demo_business';
    
    this.apiService.post(`/api/menu/${businessId}`, this.newItem).subscribe({
      next: () => {
        this.showAddItem = false;
        this.newItem = { is_bestseller: false, is_available: true };
        this.loadMenu();
      },
      error: (error) => console.error('Error adding menu item:', error)
    });
  }

  editItem(item: any) {
    this.editingItem = { ...item };
    this.showEditItem = true;
  }

  updateMenuItem() {
    const businessId = 'demo_business';
    
    this.apiService.put(`/api/menu/${businessId}/${this.editingItem.id}`, this.editingItem).subscribe({
      next: () => {
        this.showEditItem = false;
        this.editingItem = {};
        this.loadMenu();
        alert('Menu item updated successfully!');
      },
      error: (error) => {
        console.error('Error updating menu item:', error);
        alert('Failed to update menu item');
      }
    });
  }

  toggleAvailability(item: any) {
    const businessId = 'demo_business';
    this.apiService.put(`/api/menu/${businessId}/${item.id}`, { 
      is_available: !item.is_available 
    }).subscribe({
      next: () => this.loadMenu(),
      error: (error) => console.error('Error updating item:', error)
    });
  }

  deleteItem(item: any) {
    if (confirm(`Delete ${item.name}?`)) {
      const businessId = 'demo_business';
      this.apiService.delete(`/api/menu/${businessId}/${item.id}`).subscribe({
        next: () => this.loadMenu(),
        error: (error) => console.error('Error deleting item:', error)
      });
    }
  }
}
