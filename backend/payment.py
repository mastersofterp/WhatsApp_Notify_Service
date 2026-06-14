import hmac
import hashlib
from datetime import datetime, timedelta
from config import Config
import logging

logger = logging.getLogger(__name__)

class PaymentSystem:
    def __init__(self):
        self.secret_key = Config.SECRET_KEY
    
    def generate_signature(self, order_id):
        """Generate HMAC signature for payment link"""
        try:
            message = f"{order_id}:{self.secret_key}"
            signature = hmac.new(
                self.secret_key.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            return signature
        except Exception as e:
            logger.error(f"Error generating signature: {str(e)}")
            return None
    
    def verify_signature(self, order_id, signature):
        """Verify payment link signature"""
        try:
            expected_signature = self.generate_signature(order_id)
            return hmac.compare_digest(expected_signature, signature)
        except Exception as e:
            logger.error(f"Error verifying signature: {str(e)}")
            return False
    
    def generate_payment_link(self, order_id, base_url):
        """Generate secure payment link"""
        try:
            signature = self.generate_signature(order_id)
            payment_link = f"{base_url}/pay/{order_id}?sig={signature}"
            return payment_link
        except Exception as e:
            logger.error(f"Error generating payment link: {str(e)}")
            return None
    
    def generate_upi_deep_link(self, upi_id, business_name, amount, order_id):
        """Generate UPI deep link for payment apps"""
        try:
            upi_link = f"upi://pay?pa={upi_id}&pn={business_name}&am={amount}&tn=Order_{order_id}&cu=INR"
            return upi_link
        except Exception as e:
            logger.error(f"Error generating UPI link: {str(e)}")
            return None
    
    def calculate_expiry_time(self, minutes=30):
        """Calculate payment link expiry time"""
        return datetime.utcnow() + timedelta(minutes=minutes)
    
    def is_payment_expired(self, created_at, expiry_minutes=30):
        """Check if payment link has expired"""
        try:
            # Handle different timestamp formats
            if created_at is None:
                return True
            
            if isinstance(created_at, str):
                # Handle ISO format string
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            elif hasattr(created_at, 'timestamp'):
                # Handle Firestore timestamp
                created_at = datetime.fromtimestamp(created_at.timestamp())
            elif not isinstance(created_at, datetime):
                # Unknown format, assume expired
                logger.warning(f"Unknown timestamp format: {type(created_at)}")
                return True
            
            # Make timezone-aware if needed
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=None)
            
            expiry_time = created_at + timedelta(minutes=expiry_minutes)
            current_time = datetime.utcnow()
            
            return current_time > expiry_time
        except Exception as e:
            logger.error(f"Error checking expiry: {str(e)}")
            return True
    
    def render_payment_page(self, order_data, business_data):
        """Render payment page HTML"""
        try:
            from flask import render_template
            
            # Calculate expiry seconds
            created_at = order_data.get('created_at')
            expiry_minutes = Config.PAYMENT_EXPIRY_MINUTES
            
            if created_at:
                if hasattr(created_at, 'timestamp'):
                    created_timestamp = created_at.timestamp()
                else:
                    created_timestamp = datetime.now().timestamp()
                
                expiry_timestamp = created_timestamp + (expiry_minutes * 60)
                current_timestamp = datetime.now().timestamp()
                expiry_seconds = int(expiry_timestamp - current_timestamp)
            else:
                expiry_seconds = expiry_minutes * 60
            
            # Determine status
            status = 'active'
            if order_data.get('payment_status') == 'paid':
                status = 'paid'
            elif self.is_payment_expired(created_at, expiry_minutes):
                status = 'expired'
            
            return render_template(
                'payment.html',
                order_id=order_data.get('id', 'unknown'),
                business_name=business_data.get('name', 'Business'),
                logo_url=business_data.get('logo_url', ''),
                upi_id=business_data.get('upi_id', ''),
                order_items=order_data.get('items', []),
                total_amount=order_data.get('total_amount', 0),
                expiry_seconds=max(0, expiry_seconds),
                status=status
            )
        except Exception as e:
            logger.error(f"Error rendering payment page: {str(e)}")
            return f"<html><body><h1>Error loading payment page</h1><p>{str(e)}</p></body></html>"
    
    def confirm_payment(self, order_id, firebase_db, whatsapp_api):
        """Confirm payment and send WhatsApp confirmation"""
        try:
            # Update order payment status
            firebase_db.update_payment_status(order_id, 'paid')
            
            # Get order details
            order = firebase_db.get_order(order_id)
            if not order:
                return {'success': False, 'error': 'Order not found'}
            
            # Send WhatsApp confirmation
            customer_phone = order.get('customer_phone')
            business_id = order.get('business_id')
            
            if customer_phone:
                message = f"""✅ *Payment Received!*

Thank you for your payment! Your order #{order_id} has been confirmed.

We'll start preparing your order and notify you once it's ready.

If you have any questions, feel free to message us!"""
                
                whatsapp_api.send_text_message(customer_phone, message)
            
            return {'success': True, 'message': 'Payment confirmed'}
        except Exception as e:
            logger.error(f"Error confirming payment: {str(e)}")
            return {'success': False, 'error': str(e)}

payment_system = PaymentSystem()
