from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from firebase_db import firebase_db
from whatsapp_api import whatsapp_api
from config import Config
import pytz
import logging

logger = logging.getLogger(__name__)

class AutomationScheduler:
    def __init__(self):
        # Set timezone to Asia/Kolkata (IST)
        timezone = pytz.timezone(Config.TIMEZONE)
        self.scheduler = BackgroundScheduler(timezone=timezone)
    
    def start(self):
        """Start the scheduler"""
        self.scheduler.add_job(
            func=self.send_birthday_wishes,
            trigger='cron',
            hour=9,
            minute=0,
            id='birthday_wishes'
        )
        
        self.scheduler.add_job(
            func=self.check_festivals,
            trigger='cron',
            hour=8,
            minute=0,
            id='festival_check'
        )
        
        self.scheduler.start()
        logger.info("Scheduler started successfully")
    
    def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
        logger.info("Scheduler stopped")
    
    def send_birthday_wishes(self):
        """Send birthday wishes to customers"""
        try:
            logger.info("Running birthday wishes job")
            
            birthday_customers = firebase_db.get_birthday_customers_today()
            
            for customer in birthday_customers:
                phone = customer.get('phone')
                name = customer.get('name', 'Valued Customer')
                business_id = customer.get('business_id')
                
                business = firebase_db.get_business(business_id)
                if not business or not business.get('is_active'):
                    continue
                
                business_name = business.get('name', 'Our Store')
                
                message = f"""🎉🎂 Happy Birthday {name}! 🎂🎉

Wishing you a wonderful day filled with joy and happiness!

As a special birthday gift, enjoy *20% OFF* on your order today! 🎁

Reply to this message to place your order.

- Team {business_name}"""
                
                whatsapp_api.send_text_message(phone, message)
                
                firebase_db.update_customer(phone, {
                    'loyalty_points': customer.get('loyalty_points', 0) + 50
                })
                
                logger.info(f"Birthday wish sent to {phone}")
            
            logger.info(f"Birthday wishes sent to {len(birthday_customers)} customers")
            
        except Exception as e:
            logger.error(f"Error sending birthday wishes: {str(e)}")
    
    def check_festivals(self):
        """Check and send festival greetings"""
        try:
            today = datetime.now()
            month = today.month
            day = today.day
            
            festival_message = None
            
            if month == 1 and day == 1:
                festival_message = "🎉 Happy New Year! 🎉\n\nStart the year with sweetness! Get *15% OFF* on all orders today!"
            
            elif month == 10 and day == 24:
                festival_message = "✨ Happy Diwali! ✨\n\nCelebrate the festival of lights with our special treats! *20% OFF* on all orders!"
            
            elif month == 12 and day == 25:
                festival_message = "🎄 Merry Christmas! 🎄\n\nSpread joy with our delicious offerings! *15% OFF* today!"
            
            elif month == 3 and day == 8:
                festival_message = "🎨 Happy Holi! 🎨\n\nAdd colors to your celebration! *20% OFF* on all orders today!"
            
            if festival_message:
                businesses = firebase_db.get_all_businesses()
                
                for business in businesses:
                    if not business.get('is_active'):
                        continue
                    
                    business_id = business.get('id')
                    business_name = business.get('name')
                    
                    customers = firebase_db.get_customers_by_business(business_id)
                    
                    full_message = f"{festival_message}\n\n- Team {business_name}"
                    
                    for customer in customers:
                        phone = customer.get('phone')
                        whatsapp_api.send_text_message(phone, full_message)
                    
                    logger.info(f"Festival message sent to {len(customers)} customers of {business_name}")
            
        except Exception as e:
            logger.error(f"Error checking festivals: {str(e)}")

scheduler = AutomationScheduler()
