import requests
from config import Config
import logging

logger = logging.getLogger(__name__)

class WhatsAppAPI:
    def __init__(self):
        self.token = Config.WHATSAPP_TOKEN
        self.phone_number_id = Config.PHONE_NUMBER_ID
        self.api_url = Config.WHATSAPP_API_URL
        self.headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
    
    def send_text_message(self, to_phone, message):
        """Send text message via WhatsApp"""
        try:
            payload = {
                'messaging_product': 'whatsapp',
                'recipient_type': 'individual',
                'to': to_phone,
                'type': 'text',
                'text': {
                    'preview_url': False,
                    'body': message
                }
            }
            
            response = requests.post(self.api_url, json=payload, headers=self.headers)
            
            if response.status_code == 200:
                logger.info(f"Message sent successfully to {to_phone}")
                return True
            else:
                logger.error(f"Failed to send message: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending WhatsApp message: {str(e)}")
            return False
    
    def send_template_message(self, to_phone, template_name, language_code='en'):
        """Send template message"""
        try:
            payload = {
                'messaging_product': 'whatsapp',
                'to': to_phone,
                'type': 'template',
                'template': {
                    'name': template_name,
                    'language': {
                        'code': language_code
                    }
                }
            }
            
            response = requests.post(self.api_url, json=payload, headers=self.headers)
            
            if response.status_code == 200:
                logger.info(f"Template message sent to {to_phone}")
                return True
            else:
                logger.error(f"Failed to send template: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending template message: {str(e)}")
            return False
    
    def send_image_message(self, to_phone, image_url, caption=''):
        """Send image message"""
        try:
            payload = {
                'messaging_product': 'whatsapp',
                'recipient_type': 'individual',
                'to': to_phone,
                'type': 'image',
                'image': {
                    'link': image_url,
                    'caption': caption
                }
            }
            
            response = requests.post(self.api_url, json=payload, headers=self.headers)
            
            if response.status_code == 200:
                logger.info(f"Image sent to {to_phone}")
                return True
            else:
                logger.error(f"Failed to send image: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending image: {str(e)}")
            return False
    
    def send_button_message(self, to_phone, body_text, buttons):
        """Send interactive button message"""
        try:
            button_list = []
            for i, button in enumerate(buttons[:3]):
                button_list.append({
                    'type': 'reply',
                    'reply': {
                        'id': f'btn_{i}',
                        'title': button[:20]
                    }
                })
            
            payload = {
                'messaging_product': 'whatsapp',
                'recipient_type': 'individual',
                'to': to_phone,
                'type': 'interactive',
                'interactive': {
                    'type': 'button',
                    'body': {
                        'text': body_text
                    },
                    'action': {
                        'buttons': button_list
                    }
                }
            }
            
            response = requests.post(self.api_url, json=payload, headers=self.headers)
            
            if response.status_code == 200:
                logger.info(f"Button message sent to {to_phone}")
                return True
            else:
                logger.error(f"Failed to send button message: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending button message: {str(e)}")
            return False
    
    def mark_message_as_read(self, message_id):
        """Mark message as read"""
        try:
            payload = {
                'messaging_product': 'whatsapp',
                'status': 'read',
                'message_id': message_id
            }
            
            response = requests.post(self.api_url, json=payload, headers=self.headers)
            return response.status_code == 200
            
        except Exception as e:
            logger.error(f"Error marking message as read: {str(e)}")
            return False

whatsapp_api = WhatsAppAPI()
