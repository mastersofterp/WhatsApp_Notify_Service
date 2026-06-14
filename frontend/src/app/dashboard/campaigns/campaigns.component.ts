import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="campaigns-container">
      <div class="page-header">
        <h1 class="page-title">Marketing Campaigns</h1>
        <button class="btn btn-primary" (click)="showNewCampaign = true">
          <span class="material-icons">campaign</span>
          New Campaign
        </button>
      </div>

      <div class="campaign-stats grid grid-3">
        <div class="stat-card">
          <div class="stat-icon" style="background: #dbeafe;">
            <span class="material-icons" style="color: #3b82f6;">send</span>
          </div>
          <div>
            <h3>{{ totalSent }}</h3>
            <p>Messages Sent</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #d1fae5;">
            <span class="material-icons" style="color: #10b981;">people</span>
          </div>
          <div>
            <h3>{{ totalCustomers }}</h3>
            <p>Total Reach</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #fef3c7;">
            <span class="material-icons" style="color: #f59e0b;">trending_up</span>
          </div>
          <div>
            <h3>{{ campaigns.length }}</h3>
            <p>Campaigns</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="card-header">Campaign History</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Message</th>
              <th>Target</th>
              <th>Sent Count</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let campaign of campaigns">
              <td>
                <span class="badge badge-info">{{ campaign.type }}</span>
              </td>
              <td>{{ campaign.message | slice:0:50 }}...</td>
              <td>{{ campaign.target }}</td>
              <td>{{ campaign.sent_count }}</td>
              <td>
                <span class="badge badge-success">{{ campaign.status }}</span>
              </td>
              <td>{{ campaign.created_at | date:'short' }}</td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="loading" class="loading">
          <div class="spinner"></div>
        </div>

        <div *ngIf="!loading && campaigns.length === 0" class="empty-state">
          <span class="material-icons">campaign</span>
          <p>No campaigns yet. Create your first campaign!</p>
        </div>
      </div>

      <!-- New Campaign Modal -->
      <div *ngIf="showNewCampaign" class="modal-overlay" (click)="showNewCampaign = false">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <h2>Create New Campaign</h2>
          <form (ngSubmit)="sendCampaign()">
            <div class="form-group">
              <label class="form-label">Campaign Type</label>
              <select [(ngModel)]="newCampaign.type" name="type" required>
                <option value="offer_blast">Offer Blast</option>
                <option value="announcement">Announcement</option>
                <option value="reminder">Reminder</option>
                <option value="festival">Festival Greeting</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Target Audience</label>
              <select [(ngModel)]="newCampaign.target" name="target" required>
                <option value="all">All Customers</option>
                <option value="VIP">VIP Customers Only</option>
                <option value="Regular">Regular Customers</option>
                <option value="New">New Customers</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Message</label>
              <textarea 
                [(ngModel)]="newCampaign.message" 
                name="message" 
                rows="6"
                placeholder="Write your campaign message here... Use *bold* for emphasis"
                required
              ></textarea>
              <small>Tip: Use WhatsApp formatting - *bold*, _italic_, ~strikethrough~</small>
            </div>

            <div class="message-preview">
              <h4>Preview:</h4>
              <div class="preview-box">{{ newCampaign.message || 'Your message will appear here...' }}</div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn" (click)="showNewCampaign = false">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="sending">
                <span *ngIf="!sending">Send Campaign</span>
                <span *ngIf="sending">Sending...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .campaigns-container {
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

    .campaign-stats {
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon .material-icons {
      font-size: 28px;
    }

    .stat-card h3 {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .stat-card p {
      color: #6b7280;
      font-size: 14px;
    }

    .modal-content.large {
      max-width: 700px;
    }

    .message-preview {
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .message-preview h4 {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 12px;
    }

    .preview-box {
      background: white;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      min-height: 100px;
      white-space: pre-wrap;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
export class CampaignsComponent implements OnInit {
  private apiService = inject(ApiService);

  campaigns: any[] = [];
  loading = true;
  showNewCampaign = false;
  sending = false;
  newCampaign: any = { type: 'offer_blast', target: 'all', message: '' };
  totalSent = 0;
  totalCustomers = 0;

  ngOnInit() {
    this.loadCampaigns();
  }

  loadCampaigns() {
    const businessId = 'demo_business';
    
    this.apiService.get<any>(`/api/campaigns/${businessId}`).subscribe({
      next: (response) => {
        this.campaigns = response.campaigns;
        this.totalSent = this.campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading campaigns:', error);
        this.loading = false;
      }
    });
  }

  sendCampaign() {
    const businessId = 'demo_business';
    this.sending = true;
    
    const campaignData = {
      business_id: businessId,
      ...this.newCampaign
    };

    this.apiService.post('/api/campaigns/blast', campaignData).subscribe({
      next: (response: any) => {
        alert(`Campaign sent to ${response.sent_count} customers!`);
        this.showNewCampaign = false;
        this.newCampaign = { type: 'offer_blast', target: 'all', message: '' };
        this.sending = false;
        this.loadCampaigns();
      },
      error: (error) => {
        console.error('Error sending campaign:', error);
        alert('Failed to send campaign');
        this.sending = false;
      }
    });
  }
}
