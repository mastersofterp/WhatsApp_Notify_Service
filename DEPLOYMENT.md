# WhatsApp SaaS Deployment Guide

Complete step-by-step guide to deploy the WhatsApp AI Sales Agent SaaS Platform.

---

## Prerequisites

- GitHub account
- Firebase project
- Meta WhatsApp Business Account
- Cloudinary account
- Google Gemini API key
- Render account (for backend hosting)
- Vercel/Netlify account (for frontend hosting)

---

## Part 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `whatsapp-notify-service`
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 1.2 Enable Firebase Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** (optional)
4. Save changes

### 1.3 Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Select **Start in production mode**
3. Choose location: `asia-south1` (Mumbai)
4. Click **Enable**

### 1.4 Set Firestore Security Rules

Go to **Firestore Database** → **Rules** and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && request.auth.token.email == 'admin@example.com';
    }
    
    function isBusinessOwner(businessId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/businesses/$(businessId)).data.owner_email == request.auth.token.email;
    }
    
    // Businesses collection
    match /businesses/{businessId} {
      allow read: if isAuthenticated() && (isSuperAdmin() || isBusinessOwner(businessId));
      allow create: if isSuperAdmin();
      allow update, delete: if isSuperAdmin() || isBusinessOwner(businessId);
    }
    
    // Menu collection
    match /menu/{businessId}/items/{itemId} {
      allow read: if true; // Public read for WhatsApp bot
      allow write: if isAuthenticated() && (isSuperAdmin() || isBusinessOwner(businessId));
    }
    
    // Customers collection
    match /customers/{customerId} {
      allow read, write: if isAuthenticated() && (isSuperAdmin() || isBusinessOwner(resource.data.business_id));
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read, write: if isAuthenticated() && (isSuperAdmin() || isBusinessOwner(resource.data.business_id));
    }
    
    // Conversations collection (system only)
    match /conversations/{conversationId} {
      allow read: if isAuthenticated();
      allow write: if true; // Backend service account writes
    }
    
    // Campaigns collection
    match /campaigns/{campaignId} {
      allow read, write: if isAuthenticated() && (isSuperAdmin() || isBusinessOwner(resource.data.business_id));
    }
  }
}
```

### 1.5 Get Firebase Credentials

1. Go to **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Save as `firebase-credentials.json`
4. **Keep this file secure!**

### 1.6 Get Firebase Web Config

1. Go to **Project Settings** → **General**
2. Scroll to **Your apps** → Click **Web** icon
3. Register app name: `whatsapp-saas-frontend`
4. Copy the `firebaseConfig` object
5. Save for frontend environment setup

---

## Part 2: Meta WhatsApp Business Setup

### 2.1 Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Business** type
4. Enter app name: `WhatsApp SaaS`
5. Add **WhatsApp** product

### 2.2 Get WhatsApp Credentials

1. In WhatsApp setup, go to **API Setup**
2. Copy:
   - **Phone Number ID**
   - **WhatsApp Business Account ID (WABA ID)**
   - **Temporary Access Token** (for testing)
3. For production, create a **System User** and generate a permanent token

### 2.3 Configure Webhook (After Backend Deployment)

1. Go to **WhatsApp** → **Configuration**
2. Click **Edit** next to Webhook
3. Enter:
   - **Callback URL**: `https://your-backend-url.onrender.com/webhook`
   - **Verify Token**: `your_custom_verify_token` (from .env)
4. Subscribe to fields: `messages`
5. Click **Verify and Save**

---

## Part 3: Backend Deployment (Render)

### 3.1 Prepare Repository

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/whatsapp-saas.git
git push -u origin main
```

### 3.2 Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect GitHub repository
4. Configure:
   - **Name**: `whatsapp-saas-backend`
   - **Region**: `Singapore` (closest to India)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: `Free` (for testing) or `Starter` (for production)

### 3.3 Set Environment Variables

In Render dashboard, add these environment variables:

```
SECRET_KEY=your-secret-key-here-change-this
DEBUG=False
WHATSAPP_TOKEN=your-whatsapp-permanent-token
PHONE_NUMBER_ID=your-phone-number-id
WABA_ID=your-waba-id
VERIFY_TOKEN=your_custom_verify_token
FIREBASE_PROJECT_ID=whatsapp-notify-service
GEMINI_API_KEY=your-gemini-api-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
PAYMENT_SECRET_KEY=your-payment-hmac-secret
SUPER_ADMIN_EMAIL=admin@example.com
PORT=8000
HOST=0.0.0.0
```

### 3.4 Upload Firebase Credentials

1. In Render dashboard, go to **Environment** → **Secret Files**
2. Add file:
   - **Filename**: `firebase-credentials.json`
   - **Contents**: Paste your Firebase service account JSON
3. Save

### 3.5 Deploy

1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Test: `https://your-backend-url.onrender.com/ping`
4. Should return: `{"status": "ok", "timestamp": "..."}`

---

## Part 4: Frontend Deployment

### 4.1 Update Environment Files

Edit `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "whatsapp-notify-service.firebaseapp.com",
    projectId: "whatsapp-notify-service",
    storageBucket: "whatsapp-notify-service.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  },
  superAdminEmail: 'admin@example.com'
};
```

Edit `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.onrender.com',
  firebase: {
    // Same as above
  },
  superAdminEmail: 'admin@example.com'
};
```

### 4.2 Build Frontend

```bash
cd frontend
npm install
ng build --configuration production
```

### 4.3 Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel --prod
```

3. Follow prompts:
   - **Project name**: `whatsapp-saas-frontend`
   - **Framework**: `Angular`
   - **Build command**: `ng build --configuration production`
   - **Output directory**: `dist/frontend/browser`

4. Note the deployment URL

---

## Part 5: Post-Deployment Setup

### 5.1 Seed Initial Data

Run seed script:
```bash
python backend/seed_data.py
```

This creates "The Cake Shop" demo business with menu items.

### 5.2 Create Super Admin Account

1. Go to your frontend URL
2. Click **Register**
3. Use email: `admin@example.com`
4. Set password
5. Login - you'll be redirected to Super Admin dashboard

### 5.3 Configure WhatsApp Webhook

1. Go back to Meta for Developers
2. Configure webhook with your Render URL
3. Test by sending a WhatsApp message to your business number

### 5.4 Set Up UptimeRobot

1. Go to [UptimeRobot](https://uptimerobot.com/)
2. Add monitor:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: WhatsApp SaaS Backend
   - **URL**: `https://your-backend-url.onrender.com/ping`
   - **Monitoring Interval**: 5 minutes
3. This keeps Render from sleeping

---

## Part 6: Testing Checklist

### Backend Tests

- [ ] `GET /ping` returns 200 with timestamp
- [ ] `GET /webhook?hub.verify_token=test&hub.challenge=123` returns `123`
- [ ] `POST /webhook` with sample WhatsApp payload processes correctly
- [ ] `GET /api/menu/cake_shop` returns menu data
- [ ] `GET /pay/test123` returns payment HTML page
- [ ] Scheduler starts without errors

### Frontend Tests

- [ ] Login page loads
- [ ] Email/password login works
- [ ] Dashboard loads with data
- [ ] Menu management CRUD works
- [ ] Image upload works
- [ ] All routes accessible

### Integration Tests

- [ ] Send WhatsApp message → Bot responds
- [ ] Place order via WhatsApp → Order created in Firebase
- [ ] Payment link opens correctly
- [ ] Payment confirmation works
- [ ] Dashboard shows real-time data

---

## Part 7: Production Checklist

- [ ] Change all default passwords and secrets
- [ ] Enable Firebase App Check
- [ ] Set up proper CORS origins (not `*`)
- [ ] Enable rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Set up logging (Logtail)
- [ ] Configure backup strategy for Firestore
- [ ] Set up SSL certificates
- [ ] Configure CDN for frontend
- [ ] Set up monitoring and alerts
- [ ] Document API endpoints
- [ ] Create user documentation

---

## Troubleshooting

### Backend Issues

**Issue**: Render service keeps crashing
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure `firebase-credentials.json` is uploaded
- Check Python dependencies in `requirements.txt`

**Issue**: Webhook verification fails
- Verify `VERIFY_TOKEN` matches in Meta and Render
- Check webhook URL is correct
- Ensure `/webhook` endpoint is accessible

**Issue**: Firebase connection fails
- Verify `firebase-credentials.json` is correct
- Check Firebase project ID matches
- Ensure Firestore is enabled

### Frontend Issues

**Issue**: CORS errors
- Update CORS configuration in `app.py`
- Add frontend URL to allowed origins
- Check API URL in environment files

**Issue**: Firebase auth fails
- Verify Firebase config in environment files
- Check Firebase Authentication is enabled
- Ensure correct API key

**Issue**: Build fails
- Run `npm install` to update dependencies
- Check for TypeScript errors
- Verify Angular version compatibility

---

## Maintenance

### Daily Tasks
- Monitor error logs
- Check webhook delivery status
- Review customer conversations

### Weekly Tasks
- Backup Firestore data
- Review analytics
- Update menu items
- Check payment reconciliation

### Monthly Tasks
- Review and rotate API keys
- Update dependencies
- Performance optimization
- Security audit

---

## Support

For issues and questions:
- GitHub Issues: [Your Repo URL]
- Email: support@yourcompany.com
- Documentation: [Your Docs URL]

---

## License

[Your License]

---

**Deployment Complete!** 🎉

Your WhatsApp AI Sales Agent SaaS Platform is now live and ready to serve customers!
