import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'False') == 'True'
    
    # WhatsApp
    WHATSAPP_TOKEN = os.getenv('WHATSAPP_TOKEN')
    PHONE_NUMBER_ID = os.getenv('PHONE_NUMBER_ID', '1092397067300949')
    WABA_ID = os.getenv('WABA_ID', '1511512567022058')
    VERIFY_TOKEN = os.getenv('VERIFY_TOKEN', 'your_custom_verify_token')
    WHATSAPP_API_URL = f"https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages"
    
    # Firebase
    FIREBASE_PROJECT_ID = os.getenv('FIREBASE_PROJECT_ID', 'whatsapp-notify-service')
    FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')
    
    # Gemini AI
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    GEMINI_MODEL = 'gemini-1.5-flash'
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', 'dhztv69b6')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')
    
    # Payment
    PAYMENT_SECRET_KEY = os.getenv('PAYMENT_SECRET_KEY', 'payment-hmac-secret-key-change-in-production')
    PAYMENT_EXPIRY_MINUTES = int(os.getenv('PAYMENT_EXPIRY_MINUTES', 30))
    
    # Super Admin
    SUPER_ADMIN_EMAIL = os.getenv('SUPER_ADMIN_EMAIL', 'admin@example.com')
    
    # Timezone
    TIMEZONE = 'Asia/Kolkata'
    
    # WhatsApp API
    WHATSAPP_API_BASE_URL = 'https://graph.facebook.com/v18.0'
    
    # Server
    PORT = int(os.getenv('PORT', 8000))
    HOST = os.getenv('HOST', '0.0.0.0')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB max file upload
