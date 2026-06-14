import google.generativeai as genai
from config import Config
import logging
import json
import re

logger = logging.getLogger(__name__)

genai.configure(api_key=Config.GEMINI_API_KEY)

class AIAgent:
    def __init__(self):
        self.model = genai.GenerativeModel(Config.GEMINI_MODEL)
    
    def format_menu(self, menu_items):
        """Format menu items for system prompt"""
        if not menu_items:
            return "No items available"
        
        menu_text = ""
        categories = {}
        
        for item in menu_items:
            if not item.get('is_available', True):
                continue
            
            category = item.get('category', 'Other')
            if category not in categories:
                categories[category] = []
            categories[category].append(item)
        
        for category, items in categories.items():
            menu_text += f"\n{category}:\n"
            for item in items:
                name = item.get('name', 'Unknown')
                price = item.get('price', 0)
                variants = item.get('variants', [])
                
                if variants:
                    menu_text += f"  • {name}:\n"
                    for variant in variants:
                        v_name = variant.get('name', '')
                        v_price = variant.get('price', 0)
                        menu_text += f"    - {v_name}: ₹{v_price}\n"
                else:
                    menu_text += f"  • {name}: ₹{price}\n"
                
                if item.get('is_bestseller'):
                    menu_text += "    (Bestseller ⭐)\n"
                
                prep_time = item.get('prep_time')
                if prep_time:
                    menu_text += f"    Prep time: {prep_time}\n"
        
        return menu_text
    
    def build_system_prompt(self, business_data, menu_data, settings_data):
        """Build system prompt for AI agent"""
        business_name = business_data.get('name', 'Our Business')
        timings = business_data.get('timings', {})
        open_time = timings.get('open', '9:00 AM')
        close_time = timings.get('close', '9:00 PM')
        upi_id = business_data.get('upi_id', '')
        
        personality = settings_data.get('bot_personality', 'friendly and professional')
        welcome_msg = settings_data.get('welcome_message', f'Welcome to {business_name}! 🎉')
        min_order = settings_data.get('min_order', 0)
        delivery_charge = settings_data.get('delivery_charge', 0)
        free_delivery_above = settings_data.get('free_delivery_above', 0)
        
        menu_text = self.format_menu(menu_data)
        
        prompt = f"""You are {business_name}'s AI sales assistant on WhatsApp. You help customers place orders through natural conversation.

BUSINESS INFORMATION:
- Name: {business_name}
- Timings: {open_time} to {close_time}
- UPI ID: {upi_id}
- Minimum Order: ₹{min_order}
- Delivery Charge: ₹{delivery_charge}
- Free Delivery Above: ₹{free_delivery_above}

MENU:
{menu_text}

YOUR PERSONALITY: {personality}

CONVERSATION RULES:
1. **Language Detection**: Automatically detect the customer's language (Hindi, English, Marathi, etc.) and respond in the SAME language
2. **WhatsApp Formatting**: Use *bold* for emphasis, _italic_ for subtle text, and • for bullet points
3. **Sales Flow**: Guide customers through: greeting → menu browsing → item selection → size/variant → customization → customer name → delivery/pickup → address (if delivery) → delivery date/time → order summary → payment link
4. **Be Natural**: Have a friendly conversation, don't be robotic
5. **Handle Objections**: If customer hesitates, offer alternatives or discounts politely
6. **Never Hallucinate**: Only mention items and prices from the menu above. Never make up products or prices
7. **Order Summary**: Before payment, always show a clear summary with item names, quantities, and total price
8. **Special Instructions**: Ask if they have any special instructions (e.g., "Happy Birthday" message on cake, no onions, etc.)

SPECIAL COMMANDS (customer can type these):
- "menu" → Show full menu with prices
- "help" → Show available commands
- "cancel" → Cancel current order
- "talk to human" or "agent" → Escalate to human agent

ORDER CONFIRMATION FORMAT:
When customer confirms the order, respond with this EXACT format:
ORDER_CONFIRMED:{{
  "customer_name": "name",
  "items": [{{"name": "item", "quantity": 1, "price": 850}}],
  "total": 850,
  "delivery_type": "delivery or pickup",
  "address": "full address if delivery",
  "delivery_date": "YYYY-MM-DD",
  "delivery_slot": "time slot",
  "special_instructions": "any special requests"
}}

PAYMENT LINK FORMAT:
After order is confirmed and saved, respond with:
SEND_PAYMENT:order_id_here

GREETING MESSAGE:
{welcome_msg}

Remember: Be helpful, friendly, and guide customers smoothly to complete their orders!
"""
        return prompt
    
    def generate_response(self, user_message, conversation_history, business_data, menu_data, settings_data, customer_data=None):
        """Generate AI response"""
        try:
            system_prompt = self.build_system_prompt(business_data, menu_data, settings_data)
            
            chat_history = []
            for msg in conversation_history:
                role = "user" if msg['role'] == 'user' else "model"
                chat_history.append({
                    "role": role,
                    "parts": [msg['content']]
                })
            
            chat = self.model.start_chat(history=chat_history)
            
            full_prompt = f"{system_prompt}\n\nCustomer message: {user_message}"
            
            if customer_data:
                customer_name = customer_data.get('name', '')
                total_orders = customer_data.get('total_orders', 0)
                loyalty_points = customer_data.get('loyalty_points', 0)
                
                if customer_name:
                    full_prompt += f"\n\nCustomer Info: Name is {customer_name}, has placed {total_orders} orders before, has {loyalty_points} loyalty points."
            
            response = chat.send_message(full_prompt)
            response_text = response.text
            
            order_data = None
            payment_order_id = None
            
            if "ORDER_CONFIRMED:" in response_text:
                try:
                    json_match = re.search(r'ORDER_CONFIRMED:(\{.*?\})', response_text, re.DOTALL)
                    if json_match:
                        order_data = json.loads(json_match.group(1))
                        response_text = response_text.replace(json_match.group(0), '').strip()
                except Exception as e:
                    logger.error(f"Error parsing order data: {str(e)}")
            
            if "SEND_PAYMENT:" in response_text:
                try:
                    payment_match = re.search(r'SEND_PAYMENT:(\w+)', response_text)
                    if payment_match:
                        payment_order_id = payment_match.group(1)
                        response_text = response_text.replace(payment_match.group(0), '').strip()
                except Exception as e:
                    logger.error(f"Error parsing payment order ID: {str(e)}")
            
            return {
                'response': response_text,
                'order_data': order_data,
                'payment_order_id': payment_order_id
            }
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return {
                'response': "I apologize, I'm having trouble processing your request right now. Please try again in a moment.",
                'order_data': None,
                'payment_order_id': None
            }
    
    def detect_language(self, text):
        """Detect language of text"""
        try:
            prompt = f"Detect the language of this text and respond with only the language name (e.g., 'Hindi', 'English', 'Marathi'): {text}"
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Error detecting language: {str(e)}")
            return "English"

ai_agent = AIAgent()
