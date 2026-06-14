import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <h1 class="page-title">Business Settings</h1>

      <div class="settings-tabs">
        <button 
          *ngFor="let tab of tabs" 
          class="tab-btn"
          [class.active]="activeTab === tab.id"
          (click)="activeTab = tab.id"
        >
          <span class="material-icons">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Business Profile Tab -->
      <div *ngIf="activeTab === 'profile'" class="card">
        <h2 class="card-header">Business Profile</h2>
        <form (ngSubmit)="saveSettings()">
          <div class="form-group">
            <label class="form-label">Business Name</label>
            <input type="text" [(ngModel)]="settings.name" name="name" required minlength="3">
          </div>
          <div class="form-group">
            <label class="form-label">Display Name</label>
            <input type="text" [(ngModel)]="settings.display_name" name="display_name" required minlength="3">
          </div>
          <div class="form-group">
            <label class="form-label">Logo URL</label>
            <input type="url" [(ngModel)]="settings.logo_url" name="logo_url">
          </div>
          <div class="grid grid-2">
            <div class="form-group">
              <label class="form-label">Opening Time</label>
              <input type="time" [(ngModel)]="settings.timings.open" name="open">
            </div>
            <div class="form-group">
              <label class="form-label">Closing Time</label>
              <input type="time" [(ngModel)]="settings.timings.close" name="close">
            </div>
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="saving">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>
      </div>

      <!-- Bot Settings Tab -->
      <div *ngIf="activeTab === 'bot'" class="card">
        <h2 class="card-header">Bot Configuration</h2>
        <form (ngSubmit)="saveSettings()">
          <div class="form-group">
            <label class="form-label">Bot Personality</label>
            <select [(ngModel)]="settings.bot_personality" name="personality">
              <option value="friendly">Friendly & Casual</option>
              <option value="professional">Professional</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="formal">Formal</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Welcome Message</label>
            <textarea [(ngModel)]="settings.welcome_message" name="welcome" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Offline Message</label>
            <textarea [(ngModel)]="settings.offline_message" name="offline" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Supported Languages</label>
            <div class="checkbox-group">
              <label><input type="checkbox" checked> Hindi</label>
              <label><input type="checkbox" checked> English</label>
              <label><input type="checkbox"> Marathi</label>
              <label><input type="checkbox"> Tamil</label>
              <label><input type="checkbox"> Telugu</label>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="saving">
            {{ saving ? 'Saving...' : 'Save Bot Settings' }}
          </button>
        </form>
      </div>

      <!-- Payment Settings Tab -->
      <div *ngIf="activeTab === 'payment'" class="card">
        <h2 class="card-header">Payment Settings</h2>
        <form (ngSubmit)="saveSettings()">
          <div class="form-group">
            <label class="form-label">UPI ID</label>
            <input type="text" [(ngModel)]="settings.upi_id" name="upi_id" placeholder="yourstore@okaxis" required pattern="[a-zA-Z0-9.]+@[a-zA-Z]+">
            <small>Format: username@bankname</small>
          </div>
          <div class="form-group">
            <label class="form-label">Minimum Order Amount (₹)</label>
            <input type="number" [(ngModel)]="settings.min_order" name="min_order" required min="0">
          </div>
          <div class="form-group">
            <label class="form-label">Delivery Charge (₹)</label>
            <input type="number" [(ngModel)]="settings.delivery_charge" name="delivery_charge" required min="0">
          </div>
          <div class="form-group">
            <label class="form-label">Free Delivery Above (₹)</label>
            <input type="number" [(ngModel)]="settings.free_delivery_above" name="free_delivery" required min="0">
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="saving">
            {{ saving ? 'Saving...' : 'Save Payment Settings' }}
          </button>
        </form>
      </div>

      <!-- WhatsApp Settings Tab -->
      <div *ngIf="activeTab === 'whatsapp'" class="card">
        <h2 class="card-header">WhatsApp Configuration</h2>
        <div class="info-box">
          <span class="material-icons">info</span>
          <div>
            <strong>WhatsApp Business API</strong>
            <p>Configure your WhatsApp Business API credentials from Meta</p>
          </div>
        </div>
        <form>
          <div class="form-group">
            <label class="form-label">Phone Number ID</label>
            <input type="text" [(ngModel)]="settings.phone_number_id" name="phone_id" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">WABA ID</label>
            <input type="text" [(ngModel)]="settings.waba_id" name="waba_id" readonly>
          </div>
          <div class="status-indicator">
            <span class="dot active"></span>
            <span>WhatsApp Connected</span>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 900px;
    }

    .page-title {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 32px;
    }

    .settings-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      color: #6b7280;
      transition: all 0.3s ease;
    }

    .tab-btn:hover {
      border-color: #667eea;
      color: #667eea;
    }

    .tab-btn.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-color: transparent;
    }

    .tab-btn .material-icons {
      font-size: 20px;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .info-box {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: #dbeafe;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .info-box .material-icons {
      color: #3b82f6;
      font-size: 24px;
    }

    .info-box strong {
      display: block;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .info-box p {
      color: #6b7280;
      font-size: 14px;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #d1fae5;
      border-radius: 8px;
      font-weight: 600;
      color: #065f46;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #6b7280;
    }

    .dot.active {
      background: #10b981;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class SettingsComponent implements OnInit {
  private apiService = inject(ApiService);

  activeTab = 'profile';
  saving = false;
  settings: any = {
    name: 'The Cake Shop',
    display_name: 'The Cake Shop',
    logo_url: '',
    timings: { open: '09:00', close: '21:00' },
    bot_personality: 'friendly',
    welcome_message: 'Welcome to The Cake Shop! 🎂',
    offline_message: 'We are available 9AM-9PM',
    upi_id: 'cakeshop@okaxis',
    min_order: 200,
    delivery_charge: 50,
    free_delivery_above: 1000,
    phone_number_id: '1092397067300949',
    waba_id: '1511512567022058'
  };

  tabs = [
    { id: 'profile', label: 'Business Profile', icon: 'store' },
    { id: 'bot', label: 'Bot Settings', icon: 'smart_toy' },
    { id: 'payment', label: 'Payment', icon: 'payment' },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'chat' }
  ];

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    const businessId = 'demo_business';
    
    this.apiService.get<any>(`/api/businesses/${businessId}`).subscribe({
      next: (response) => {
        this.settings = { ...this.settings, ...response };
      },
      error: (error) => console.error('Error loading settings:', error)
    });
  }

  saveSettings() {
    this.saving = true;
    const businessId = 'demo_business';
    
    this.apiService.put(`/api/businesses/${businessId}`, this.settings).subscribe({
      next: (response) => {
        this.saving = false;
        alert('Settings saved successfully!');
      },
      error: (error) => {
        this.saving = false;
        console.error('Error saving settings:', error);
        alert('Failed to save settings. Please try again.');
      }
    });
  }
}
