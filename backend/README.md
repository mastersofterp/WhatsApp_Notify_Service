# WhatsApp AI Sales Agent SaaS Platform - Backend

Multi-tenant WhatsApp AI Sales Agent built with Flask, Firebase, and Google Gemini AI.

## Tech Stack
- **Framework**: Flask (Python)
- **Database**: Firebase Firestore
- **AI**: Google Gemini 1.5 Flash
- **WhatsApp**: Meta WhatsApp Business Cloud API
- **Image Storage**: Cloudinary
- **Hosting**: Render.com

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Required environment variables:
- `WHATSAPP_TOKEN`: Your Meta WhatsApp Business API token
- `VERIFY_TOKEN`: Custom token for webhook verification
- `GEMINI_API_KEY`: Google Gemini API key
- `CLOUDINARY_API_KEY` & `CLOUDINARY_API_SECRET`: Cloudinary credentials
- `SECRET_KEY`: Flask secret key for sessions
- `SUPER_ADMIN_EMAIL`: Platform super admin email

### 3. Run Development Server
```bash
python app.py
```

Server will start on `http://localhost:8000`

### 4. Test Webhook Verification
```bash
curl "http://localhost:8000/webhook?hub.mode=subscribe&hub.verify_token=your_custom_verify_token&hub.challenge=test123"
```

Should return: `test123`

## API Endpoints

### Health Check
- `GET /ping` - Returns server status

### Webhook
- `GET /webhook` - Meta webhook verification
- `POST /webhook` - Receive WhatsApp messages

### Root
- `GET /` - API information

## Deployment to Render

1. Push code to GitHub
2. Connect repository to Render
3. Render will use `render.yaml` for configuration
4. Add environment variables in Render dashboard
5. Deploy!

## Keep Server Alive (Free Tier)
Use UptimeRobot to ping `/ping` endpoint every 10 minutes to prevent server sleep.

## Project Structure
```
backend/
├── app.py                  # Main Flask server
├── config.py               # Configuration
├── requirements.txt        # Python dependencies
├── render.yaml            # Render deployment config
├── .env.example           # Environment variables template
└── README.md              # This file
```

## Next Steps
- Step 2: Firebase integration
- Step 3: Gemini AI agent
- Step 4: Payment system
- Step 5+: Frontend Angular app

## License
Proprietary - All rights reserved
