"""
WhatsApp Cloud API Wrapper
Complete implementation for sending messages via WhatsApp Business API
"""

import requests
import logging
import time
from config import Config

logger = logging.getLogger(__name__)

class WhatsAppAPI:
    def __init__(self):
        self.base_url = Config.WHATSAPP_API_BASE_URL
        self.token = Config.WHATSAPP_TOKEN
        self.phone_number_id = Config.PHONE_NUMBER_ID
        
    def _get_headers(self):
        """Get headers for WhatsApp API requests"""
        return {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
    
    def _make_request(self, url, data, retries=3):
        """Make API request with retry logic"""
        for attempt in range(retries):
            try:
                response = requests.post(url, json=data, headers=self._get_headers(), timeout=10)
                response.raise_for_status()
                logger.info(f"WhatsApp API request successful: {response.json()}")
                return response.json()
            except requests.exceptions.RequestException as e:
                logger.error(f"WhatsApp API request failed (attempt {attempt + 1}/{retries}): {str(e)}")
                if attempt < retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    raise
    
    def send_text_message(self, phone, message, phone_number_id=None):
        """
        Send a text message to a WhatsApp number
        
        Args:
            phone (str): Recipient phone number (with country code)
            message (str): Message text
            phone_number_id (str, optional): Override default phone number ID
            
        Returns:
            dict: API response
        """
        if not phone_number_id:
            phone_number_id = self.phone_number_id
            
        url = f"{self.base_url}/{phone_number_id}/messages"
        
        data = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": phone,
            "type": "text",
            "text": {
                "preview_url": True,
                "body": message
            }
        }
        
        try:
            return self._make_request(url, data)
        except Exception as e:
            logger.error(f"Failed to send text message to {phone}: {str(e)}")
            return None
    
    def send_template_message(self, phone, template_name, parameters=None, phone_number_id=None):
        """
        Send a template message (for birthday wishes, notifications, etc.)
        
        Args:
            phone (str): Recipient phone number
            template_name (str): Name of the approved template
            parameters (list, optional): Template parameters
            phone_number_id (str, optional): Override default phone number ID
            
        Returns:
            dict: API response
        """
        if not phone_number_id:
            phone_number_id = self.phone_number_id
            
        url = f"{self.base_url}/{phone_number_id}/messages"
        
        data = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {
                    "code": "en"
                }
            }
        }
        
        if parameters:
            data["template"]["components"] = [
                {
                    "type": "body",
                    "parameters": [{"type": "text", "text": param} for param in parameters]
                }
            ]
        
        try:
            return self._make_request(url, data)
        except Exception as e:
            logger.error(f"Failed to send template message to {phone}: {str(e)}")
            return None
    
    def send_interactive_message(self, phone, buttons, header_text=None, body_text=None, footer_text=None, phone_number_id=None):
        """
        Send an interactive message with buttons
        
        Args:
            phone (str): Recipient phone number
            buttons (list): List of button dicts with 'id' and 'title'
            header_text (str, optional): Header text
            body_text (str, optional): Body text
            footer_text (str, optional): Footer text
            phone_number_id (str, optional): Override default phone number ID
            
        Returns:
            dict: API response
        """
        if not phone_number_id:
            phone_number_id = self.phone_number_id
            
        url = f"{self.base_url}/{phone_number_id}/messages"
        
        # Format buttons for WhatsApp API
        formatted_buttons = []
        for idx, button in enumerate(buttons[:3]):  # Max 3 buttons
            formatted_buttons.append({
                "type": "reply",
                "reply": {
                    "id": button.get('id', f"btn_{idx}"),
                    "title": button.get('title', f"Button {idx + 1}")[:20]  # Max 20 chars
                }
            })
        
        data = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": phone,
            "type": "interactive",
            "interactive": {
                "type": "button",
                "body": {
                    "text": body_text or "Please select an option"
                },
                "action": {
                    "buttons": formatted_buttons
                }
            }
        }
        
        if header_text:
            data["interactive"]["header"] = {
                "type": "text",
                "text": header_text
            }
        
        if footer_text:
            data["interactive"]["footer"] = {
                "text": footer_text
            }
        
        try:
            return self._make_request(url, data)
        except Exception as e:
            logger.error(f"Failed to send interactive message to {phone}: {str(e)}")
            return None
    
    def mark_message_as_read(self, message_id, phone_number_id=None):
        """
        Mark a message as read
        
        Args:
            message_id (str): WhatsApp message ID
            phone_number_id (str, optional): Override default phone number ID
            
        Returns:
            dict: API response
        """
        if not phone_number_id:
            phone_number_id = self.phone_number_id
            
        url = f"{self.base_url}/{phone_number_id}/messages"
        
        data = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": message_id
        }
        
        try:
            return self._make_request(url, data)
        except Exception as e:
            logger.error(f"Failed to mark message {message_id} as read: {str(e)}")
            return None
    
    def send_image(self, phone, image_url, caption=None, phone_number_id=None):
        """
        Send an image message
        
        Args:
            phone (str): Recipient phone number
            image_url (str): URL of the image
            caption (str, optional): Image caption
            phone_number_id (str, optional): Override default phone number ID
            
        Returns:
            dict: API response
        """
        if not phone_number_id:
            phone_number_id = self.phone_number_id
            
        url = f"{self.base_url}/{phone_number_id}/messages"
        
        data = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": phone,
            "type": "image",
            "image": {
                "link": image_url
            }
        }
        
        if caption:
            data["image"]["caption"] = caption
        
        try:
            return self._make_request(url, data)
        except Exception as e:
            logger.error(f"Failed to send image to {phone}: {str(e)}")
            return None

# Global instance
whatsapp_api = WhatsAppAPI()
