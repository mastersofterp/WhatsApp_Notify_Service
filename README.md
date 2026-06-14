# 🚀 WhatsApp AI Sales Agent SaaS Platform

A complete multi-tenant SaaS platform that enables businesses to automate sales through WhatsApp using AI-powered conversations, built with Flask, Angular 20, Firebase, and Google Gemini AI.

## ✨ Features

### 🤖 AI-Powered Sales Agent
- Natural language conversations in multiple languages (Hindi, English, Marathi, Tamil, Telugu, Gujarati, Bengali)
- Auto-detects customer language and responds accordingly
- Guides customers through complete sales flow
- Handles objections and provides recommendations

### 💼 Multi-Tenant Architecture
- Multiple businesses on single platform
- Complete data isolation per business
- Business-specific AI personality and settings
- Unique WhatsApp number per business

### 💳 Secure Payment System
- UPI deep links (GPay, PhonePe, Paytm)
- HMAC-signed payment links
- 30-minute expiry for security
- Beautiful payment page with countdown timer

### 📊 Business Dashboard
- Real-time analytics and insights
- Order management with Kanban board
- Customer CRM with segmentation
- Menu management with image upload
- Campaign blast to customers
- Revenue tracking and reports

### 🎁 Customer Features
- Loyalty points system
- Birthday rewards
- Order tracking
- Special offers and discounts

### 🤖 Automation
- Birthday wishes (automatic)
- Festival greetings (Diwali, Christmas, Holi, Eid, New Year)
- Scheduled campaigns
- Order confirmations

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: Firebase Firestore
- **AI**: Google Gemini 1.5 Flash
- **WhatsApp**: Meta WhatsApp Business Cloud API
- **Storage**: Cloudinary
- **Hosting**: Render.com

### Frontend
- **Framework**: Angular 20
- **UI**: Angular Material + Custom SCSS
- **Auth**: Firebase Authentication
- **Charts**: Chart.js
- **State**: RxJS

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- Firebase account
- Meta WhatsApp Business account
- Google Gemini API key
- Cloudinary account

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd whatsapp-saas
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Download Firebase service account key
# Place it as firebase-credentials.json in backend folder

# Run server
python app.py
```

Server will start at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure Firebase
# Edit src/environments/environment.ts with your Firebase config

# Run development server
ng serve
```

Frontend will start at `http://localhost:4200`

## 🔑 Environment Variables

### Backend (.env)
```env
# Flask
SECRET_KEY=your_random_secret_key_here
DEBUG=False

# WhatsApp Business API
WHATSAPP_TOKEN=your_whatsapp_token
PHONE_NUMBER_ID=1092397067300949
WABA_ID=1511512567022058
VERIFY_TOKEN=your_custom_verify_token

# Firebase
FIREBASE_PROJECT_ID=whatsapp-notify-service

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=dhztv69b6
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Super Admin
SUPER_ADMIN_EMAIL=your_email@example.com

# Server
PORT=8000
HOST=0.0.0.0
```

### Frontend (environment.ts)
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
  }
};
```

## 📱 WhatsApp Setup

1. **Create Meta Business Account**
   - Go to https://business.facebook.com
   - Create new business account

2. **Set Up WhatsApp Business API**
   - Go to https://developers.facebook.com
   - Create new app
   - Add WhatsApp product
   - Get Phone Number ID and WABA ID

3. **Configure Webhook**
   - Webhook URL: `https://your-backend-url.onrender.com/webhook`
   - Verify Token: (set in .env)
   - Subscribe to messages

4. **Get Access Token**
   - Generate permanent access token
   - Add to .env as WHATSAPP_TOKEN

## 🔥 Firebase Setup

1. **Create Project**
   - Go to https://console.firebase.google.com
   - Create new project

2. **Enable Authentication**
   - Go to Authentication
   - Enable Email/Password

3. **Enable Firestore**
   - Go to Firestore Database
   - Create database in production mode

4. **Get Service Account Key**
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Save as `firebase-credentials.json` in backend folder

5. **Get Web Config**
   - Go to Project Settings > General
   - Add web app
   - Copy config to frontend environment files

## 🎨 Cloudinary Setup

1. Go to https://cloudinary.com
2. Create free account
3. Get Cloud Name, API Key, API Secret from Dashboard
4. Add to backend .env file

## 🤖 Gemini AI Setup

1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Add to backend .env as GEMINI_API_KEY

## 🚀 Deployment

### Backend (Render.com)

1. Push code to GitHub
2. Go to https://render.com
3. Create new Web Service
4. Connect GitHub repository
5. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app --workers 2 --timeout 120`
6. Add environment variables from .env
7. Deploy!

### Frontend (Netlify)

1. Build production:
   ```bash
   ng build --configuration production
   ```
2. Go to https://netlify.com
3. Drag and drop `dist/whatsapp-saas-frontend` folder
4. Or connect GitHub for auto-deploy

## 📊 Database Structure

```
businesses/
  {business_id}/
    - name, phone_number_id, upi_id, logo_url, etc.
    menu/
      {item_id}/
        - name, category, price, variants, image_url
    settings/
      config/
        - bot_personality, welcome_message, etc.

customers/
  {phone_number}/
    - name, business_id, birthday, total_orders, loyalty_points

orders/
  {order_id}/
    - customer_phone, business_id, items, total, status, payment_status

conversations/
  {phone_number}_{business_id}/
    - messages[], last_updated

campaigns/
  {campaign_id}/
    - business_id, type, message, sent_count
```

## 🎯 Usage

### For Business Owners

1. **Register**
   - Create account at `/register`
   - Verify email

2. **Setup Business**
   - Add business details
   - Configure WhatsApp phone number ID
   - Set UPI ID for payments
   - Upload logo

3. **Add Menu**
   - Go to Menu section
   - Add categories and items
   - Upload product images
   - Set prices and variants

4. **Configure Bot**
   - Go to Settings
   - Set bot personality
   - Customize welcome message
   - Configure delivery charges

5. **Start Receiving Orders!**
   - Customers message on WhatsApp
   - AI handles conversations
   - Orders appear in dashboard
   - Process and fulfill orders

### For Customers

1. Send WhatsApp message to business number
2. AI greets and shows menu
3. Browse and select items
4. Provide delivery details
5. Receive payment link
6. Pay via UPI (GPay/PhonePe/Paytm)
7. Get order confirmation

### For Super Admin

1. Login with super admin email
2. Access `/super-admin`
3. View all businesses
4. Monitor platform analytics
5. Manage settings

## 🔒 Security Features

- ✅ Firebase JWT authentication
- ✅ Role-based access control (Super Admin, Business Owner)
- ✅ Business data isolation
- ✅ HMAC-signed payment links
- ✅ 30-minute payment expiry
- ✅ HTTPS only in production
- ✅ Input validation and sanitization
- ✅ Firestore security rules
- ✅ Rate limiting ready

## 📈 Free Tier Limits

- **Firebase Spark**: 1GB storage, 50k reads/day, 20k writes/day
- **Gemini AI**: 1500 requests/day
- **Cloudinary**: 25GB storage
- **Render**: 750 hours/month (use /ping + UptimeRobot)

## 🧪 Testing

### Test Webhook
```bash
curl "http://localhost:8000/webhook?hub.mode=subscribe&hub.verify_token=your_verify_token&hub.challenge=test123"
```

### Test Payment Link
```bash
curl http://localhost:8000/pay/ORDER_ID?sig=SIGNATURE
```

### Test API
```bash
curl http://localhost:8000/ping
```

## 🐛 Troubleshooting

### Backend won't start
- Check Python version (3.11+)
- Verify all environment variables
- Check Firebase credentials file exists
- Review logs for errors

### Webhook not receiving messages
- Verify webhook URL in Meta dashboard
- Check verify token matches
- Ensure server is publicly accessible
- Check WhatsApp API subscription

### Payment link not working
- Verify UPI ID is correct
- Check order exists in database
- Verify signature is valid
- Check payment link not expired

### AI not responding
- Verify Gemini API key is valid
- Check API quota not exceeded
- Review conversation history
- Check business and menu data exists

## 📝 API Documentation

### Webhook Endpoints
- `GET /webhook` - Verify webhook
- `POST /webhook` - Receive messages

### Payment Endpoints
- `GET /pay/<order_id>` - Payment page
- `POST /pay/confirm` - Confirm payment

### Business API
- `GET /api/businesses` - List businesses (Super Admin)
- `POST /api/businesses` - Create business
- `PUT /api/businesses/<id>` - Update business
- `DELETE /api/businesses/<id>` - Delete business (Super Admin)

### Menu API
- `GET /api/menu/<business_id>` - Get menu
- `POST /api/menu/<business_id>` - Add item
- `PUT /api/menu/<business_id>/<id>` - Update item
- `DELETE /api/menu/<business_id>/<id>` - Delete item

### Orders API
- `GET /api/orders/<business_id>` - Get orders
- `PUT /api/orders/<order_id>` - Update order

### Customers API
- `GET /api/customers/<business_id>` - Get customers
- `POST /api/customers/<business_id>` - Add customer
- `PUT /api/customers/<phone>` - Update customer

### Campaigns API
- `POST /api/campaigns/blast` - Send campaign
- `GET /api/campaigns/<business_id>` - Get campaigns

### Analytics API
- `GET /api/analytics/<business_id>` - Get analytics

### Upload API
- `POST /api/upload/image` - Upload image

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is proprietary. All rights reserved.

## 🙏 Acknowledgments

- Flask for the backend framework
- Angular team for Angular 20
- Google for Gemini AI
- Meta for WhatsApp Business API
- Firebase for backend services
- Cloudinary for image hosting

## 📞 Support

For support, email support@example.com or create an issue in the repository.

## 🎉 What's Next?

- [ ] Add voice message support
- [ ] Implement image recognition for orders
- [ ] Add multi-currency support
- [ ] Create mobile app (React Native)
- [ ] Add inventory management
- [ ] Implement staff roles and permissions
- [ ] Add delivery tracking
- [ ] Create customer mobile app
- [ ] Add subscription billing
- [ ] Implement referral program

---

**Built with ❤️ for small businesses to grow with AI**
