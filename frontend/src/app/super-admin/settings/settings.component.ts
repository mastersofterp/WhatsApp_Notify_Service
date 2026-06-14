import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-super-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <h1 class="page-title">Platform Settings</h1>

      <div class="card">
        <h2 class="card-header">General Settings</h2>
        <form (ngSubmit)="saveSettings()">
          <div class="form-group">
            <label class="form-label">Platform Name</label>
            <input type="text" [(ngModel)]="settings.platformName" name="platformName" required minlength="3">
          </div>
          <div class="form-group">
            <label class="form-label">Super Admin Email</label>
            <input type="email" [(ngModel)]="settings.superAdminEmail" name="superAdminEmail" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Max Businesses Per Account</label>
            <input type="number" [(ngModel)]="settings.maxBusinesses" name="maxBusinesses" required min="1" max="100">
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="saving">
            {{ saving ? 'Saving...' : 'Save Settings' }}
          </button>
        </form>
      </div>

      <div class="card">
        <h2 class="card-header">API Configuration</h2>
        <div class="info-box">
          <span class="material-icons">info</span>
          <div>
            <strong>API Keys</strong>
            <p>Manage platform-wide API keys and integrations</p>
          </div>
        </div>
        <div class="api-status">
          <div class="status-item">
            <span class="material-icons">check_circle</span>
            <span>WhatsApp API: Connected</span>
          </div>
          <div class="status-item">
            <span class="material-icons">check_circle</span>
            <span>Firebase: Connected</span>
          </div>
          <div class="status-item">
            <span class="material-icons">check_circle</span>
            <span>Gemini AI: Connected</span>
          </div>
          <div class="status-item">
            <span class="material-icons">check_circle</span>
            <span>Cloudinary: Connected</span>
          </div>
        </div>
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

    .api-status {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #d1fae5;
      border-radius: 8px;
      color: #065f46;
      font-weight: 600;
    }

    .status-item .material-icons {
      color: #10b981;
    }
  `]
})
export class SuperAdminSettingsComponent {
  saving = false;
  settings = {
    platformName: 'WhatsApp AI Sales Agent',
    superAdminEmail: 'admin@example.com',
    maxBusinesses: 5
  };

  saveSettings() {
    this.saving = true;
    
    // Simulate API call
    setTimeout(() => {
      this.saving = false;
      alert('Platform settings saved successfully!');
      console.log('Settings saved:', this.settings);
    }, 1000);
  }
}
