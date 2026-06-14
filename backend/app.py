from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from config import Config
from firebase_db import firebase_db
from ai_agent import ai_agent
from whatsapp_api import whatsapp_api
from payment import payment_system
from cloudinary_upload import cloudinary_uploader
from auth_middleware import verify_firebase_token, verify_super_admin, verify_business_access
from scheduler import scheduler
import logging
import os

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_object(Config)
app.config['MAX_CONTENT_LENGTH'] = Config.MAX_CONTENT_LENGTH
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/ping', methods=['GET'])
def ping():
    """Health check endpoint to keep Render alive"""
    from datetime import datetime
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/webhook', methods=['GET'])
def webhook_verify():
    """Webhook verification endpoint for Meta WhatsApp Business API"""
    mode = request.args.get('hub.mode')
    token = request.args.get('hub.verify_token')
    challenge = request.args.get('hub.challenge')
    
    logger.info(f"Webhook verification request - Mode: {mode}, Token: {token}")
    
    if mode == 'subscribe' and token == app.config['VERIFY_TOKEN']:
        logger.info("Webhook verified successfully")
        return challenge, 200
    else:
        logger.warning("Webhook verification failed - Invalid token")
        return jsonify({'error': 'Verification failed'}), 403

@app.route('/webhook', methods=['POST'])
def webhook_receive():
    """Webhook endpoint to receive WhatsApp messages from Meta"""
    try:
        data = request.get_json()
        logger.info(f"Received webhook data: {data}")
        
        if not data:
            return jsonify({'error': 'No data received'}), 400
        
        if 'entry' in data:
            for entry in data['entry']:
                if 'changes' in entry:
                    for change in entry['changes']:
                        if 'value' in change:
                            value = change['value']
                            
                            if 'messages' in value:
                                messages = value['messages']
                                metadata = value.get('metadata', {})
                                phone_number_id = metadata.get('phone_number_id')
                                
                                business = firebase_db.get_business_by_phone_id(phone_number_id)
                                if not business:
                                    logger.warning(f"No business found for phone_number_id: {phone_number_id}")
                                    continue
                                
                                business_id = business['id']
                                
                                for message in messages:
                                    from_number = message.get('from')
                                    message_type = message.get('type')
                                    message_id = message.get('id')
                                    
                                    whatsapp_api.mark_message_as_read(message_id)
                                    
                                    if message_type == 'text':
                                        text_body = message.get('text', {}).get('body', '')
                                        
                                        customer = firebase_db.get_customer(from_number)
                                        if not customer:
                                            firebase_db.create_customer(from_number, {
                                                'phone': from_number,
                                                'business_id': business_id,
                                                'name': ''
                                            })
                                            customer = firebase_db.get_customer(from_number)
                                        
                                        firebase_db.add_message_to_conversation(from_number, business_id, 'user', text_body)
                                        
                                        conversation = firebase_db.get_conversation(from_number, business_id)
                                        menu_data = firebase_db.get_menu(business_id)
                                        settings_data = firebase_db.get_settings(business_id)
                                        
                                        ai_response = ai_agent.generate_response(
                                            text_body,
                                            conversation.get('messages', []),
                                            business,
                                            menu_data,
                                            settings_data,
                                            customer
                                        )
                                        
                                        response_text = ai_response['response']
                                        order_data = ai_response['order_data']
                                        payment_order_id = ai_response['payment_order_id']
                                        
                                        if order_data:
                                            order_data['customer_phone'] = from_number
                                            order_data['customer_name'] = customer.get('name', '')
                                            order_data['business_id'] = business_id
                                            
                                            order_id = firebase_db.create_order(order_data)
                                            
                                            if order_id:
                                                base_url = request.url_root.rstrip('/')
                                                payment_link = payment_system.generate_payment_link(order_id, base_url)
                                                
                                                firebase_db.update_order(order_id, {'payment_link': payment_link})
                                                
                                                payment_message = f"\n\n💳 *Payment Link*:\n{payment_link}\n\n⏰ Link expires in 30 minutes"
                                                response_text += payment_message
                                        
                                        whatsapp_api.send_text_message(from_number, response_text)
                                        
                                        firebase_db.add_message_to_conversation(from_number, business_id, 'assistant', response_text)
                            
                            if 'statuses' in value:
                                statuses = value['statuses']
                                for status in statuses:
                                    message_id = status.get('id')
                                    status_type = status.get('status')
                                    logger.info(f"Message {message_id} status: {status_type}")
        
        return jsonify({'status': 'received'}), 200
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/pay/<order_id>', methods=['GET'])
def payment_page(order_id):
    """Payment page for UPI payment"""
    try:
        signature = request.args.get('sig')
        
        if not signature or not payment_system.verify_signature(order_id, signature):
            return jsonify({'error': 'Invalid payment link'}), 403
        
        order = firebase_db.get_order(order_id)
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        if payment_system.is_payment_expired(order.get('created_at')):
            return jsonify({'error': 'Payment link expired'}), 410
        
        if order.get('payment_status') == 'paid':
            return jsonify({'message': 'Payment already completed'}), 200
        
        business = firebase_db.get_business(order['business_id'])
        
        upi_link = payment_system.generate_upi_deep_link(
            business['upi_id'],
            business['name'],
            order['total'],
            order_id
        )
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment - {business['name']}</title>
            <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }}
                .container {{ max-width: 500px; margin: 0 auto; background: white; border-radius: 20px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }}
                .logo {{ text-align: center; margin-bottom: 20px; }}
                .logo img {{ width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }}
                h1 {{ color: #333; text-align: center; font-size: 24px; margin-bottom: 10px; }}
                .business-name {{ color: #667eea; text-align: center; font-size: 18px; margin-bottom: 30px; }}
                .order-details {{ background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px; }}
                .order-item {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }}
                .order-item:last-child {{ border-bottom: none; }}
                .total {{ font-size: 24px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }}
                .timer {{ text-align: center; font-size: 18px; color: #ff6b6b; margin-bottom: 20px; font-weight: bold; }}
                .upi-buttons {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }}
                .upi-btn {{ padding: 15px; border: none; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; text-decoration: none; display: flex; align-items: center; justify-content: center; color: white; }}
                .gpay {{ background: #4285f4; }}
                .phonepe {{ background: #5f259f; }}
                .paytm {{ background: #00baf2; }}
                .upi {{ background: #667eea; }}
                .confirm-btn {{ width: 100%; padding: 15px; background: #10b981; color: white; border: none; border-radius: 10px; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 20px; }}
                .confirm-btn:hover {{ background: #059669; }}
                .note {{ text-align: center; color: #666; font-size: 14px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <img src="{business.get('logo_url', 'https://via.placeholder.com/80')}" alt="Logo">
                </div>
                <h1>Complete Payment</h1>
                <div class="business-name">{business['name']}</div>
                
                <div class="timer" id="timer">⏰ 30:00</div>
                
                <div class="order-details">
                    <h3 style="margin-bottom: 15px;">Order Details</h3>
                    {''.join([f'<div class="order-item"><span>{item["name"]} x {item["quantity"]}</span><span>₹{item["price"]}</span></div>' for item in order['items']])}
                </div>
                
                <div class="total">Total: ₹{order['total']}</div>
                
                <div class="upi-buttons">
                    <a href="{upi_link}" class="upi-btn gpay">Google Pay</a>
                    <a href="{upi_link}" class="upi-btn phonepe">PhonePe</a>
                    <a href="{upi_link}" class="upi-btn paytm">Paytm</a>
                    <a href="{upi_link}" class="upi-btn upi">Other UPI</a>
                </div>
                
                <button class="confirm-btn" onclick="confirmPayment()">✓ I've Paid</button>
                
                <div class="note">After payment, click "I've Paid" button above</div>
            </div>
            
            <script>
                let timeLeft = 30 * 60;
                const timerEl = document.getElementById('timer');
                
                setInterval(() => {{
                    if (timeLeft <= 0) {{
                        alert('Payment link expired!');
                        return;
                    }}
                    timeLeft--;
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    timerEl.textContent = `⏰ ${{minutes}}:${{seconds.toString().padStart(2, '0')}}`;
                }}, 1000);
                
                function confirmPayment() {{
                    fetch('/pay/confirm', {{
                        method: 'POST',
                        headers: {{ 'Content-Type': 'application/json' }},
                        body: JSON.stringify({{ order_id: '{order_id}' }})
                    }})
                    .then(res => res.json())
                    .then(data => {{
                        if (data.success) {{
                            alert('✓ Payment confirmed! You will receive order confirmation on WhatsApp.');
                            window.close();
                        }} else {{
                            alert('Error: ' + data.error);
                        }}
                    }});
                }}
            </script>
        </body>
        </html>
        """
        
        return render_template_string(html)
        
    except Exception as e:
        logger.error(f"Error loading payment page: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/pay/confirm', methods=['POST'])
def confirm_payment():
    """Confirm payment"""
    try:
        data = request.get_json()
        order_id = data.get('order_id')
        
        if not order_id:
            return jsonify({'success': False, 'error': 'Order ID required'}), 400
        
        order = firebase_db.get_order(order_id)
        
        if not order:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        
        firebase_db.update_order(order_id, {
            'payment_status': 'paid',
            'status': 'confirmed'
        })
        
        customer_phone = order['customer_phone']
        business_id = order['business_id']
        business = firebase_db.get_business(business_id)
        
        confirmation_msg = f"""✅ *Payment Received!*

Thank you for your order!

*Order ID*: {order_id}
*Total*: ₹{order['total']}

Your order is confirmed and will be prepared soon. We'll notify you when it's ready!

- {business['name']}"""
        
        whatsapp_api.send_text_message(customer_phone, confirmation_msg)
        
        customer = firebase_db.get_customer(customer_phone)
        if customer:
            new_total_orders = customer.get('total_orders', 0) + 1
            new_total_spent = customer.get('total_spent', 0) + order['total']
            new_loyalty_points = customer.get('loyalty_points', 0) + int(order['total'] / 10)
            
            firebase_db.update_customer(customer_phone, {
                'total_orders': new_total_orders,
                'total_spent': new_total_spent,
                'loyalty_points': new_loyalty_points
            })
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        logger.error(f"Error confirming payment: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/businesses', methods=['GET'])
@verify_firebase_token
@verify_super_admin
def get_businesses():
    """Get all businesses (Super Admin only)"""
    try:
        businesses = firebase_db.get_all_businesses()
        return jsonify({'businesses': businesses}), 200
    except Exception as e:
        logger.error(f"Error getting businesses: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/businesses/<business_id>', methods=['GET'])
@verify_firebase_token
@verify_business_access
def get_business(business_id):
    """Get single business by ID"""
    try:
        business = firebase_db.get_business(business_id)
        if business:
            business['id'] = business_id
            return jsonify(business), 200
        else:
            return jsonify({'error': 'Business not found'}), 404
    except Exception as e:
        logger.error(f"Error getting business: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/businesses', methods=['POST'])
@verify_firebase_token
def create_business():
    """Create new business"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'phone_number_id', 'waba_id', 'upi_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        data['owner_email'] = request.user_email
        
        business_id = firebase_db.create_business(data)
        
        if business_id:
            return jsonify({'success': True, 'business_id': business_id}), 201
        else:
            return jsonify({'error': 'Failed to create business'}), 500
            
    except Exception as e:
        logger.error(f"Error creating business: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/businesses/<business_id>', methods=['PUT'])
@verify_firebase_token
@verify_business_access
def update_business(business_id):
    """Update business"""
    try:
        data = request.get_json()
        
        success = firebase_db.update_business(business_id, data)
        
        if success:
            return jsonify({'success': True}), 200
        else:
            return jsonify({'error': 'Failed to update business'}), 500
            
    except Exception as e:
        logger.error(f"Error updating business: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/businesses/<business_id>', methods=['DELETE'])
@verify_firebase_token
@verify_super_admin
def delete_business(business_id):
    """Delete business (Super Admin only)"""
    try:
        success = firebase_db.delete_business(business_id)
        
        if success:
            return jsonify({'success': True}), 200
        else:
            return jsonify({'error': 'Failed to delete business'}), 500
            
    except Exception as e:
        logger.error(f"Error deleting business: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/menu/<business_id>', methods=['GET'])
def get_menu(business_id):
    """Get menu items"""
    try:
        menu_items = firebase_db.get_menu(business_id)
        return jsonify({'menu': menu_items}), 200
    except Exception as e:
        logger.error(f"Error getting menu: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/menu/<business_id>', methods=['POST'])
@verify_firebase_token
@verify_business_access
def add_menu_item(business_id):
    """Add menu item"""
    try:
        data = request.get_json()
        
        item_id = firebase_db.add_menu_item(business_id, data)
        
        if item_id:
            return jsonify({'success': True, 'item_id': item_id}), 201
        else:
            return jsonify({'error': 'Failed to add menu item'}), 500
            
    except Exception as e:
        logger.error(f"Error adding menu item: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/menu/<business_id>/<item_id>', methods=['PUT'])
@verify_firebase_token
@verify_business_access
def update_menu_item(business_id, item_id):
    """Update menu item"""
    try:
        data = request.get_json()
        
        success = firebase_db.update_menu_item(business_id, item_id, data)
        
        if success:
            return jsonify({'success': True}), 200
        else:
            return jsonify({'error': 'Failed to update menu item'}), 500
            
    except Exception as e:
        logger.error(f"Error updating menu item: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/menu/<business_id>/<item_id>', methods=['DELETE'])
@verify_firebase_token
@verify_business_access
def delete_menu_item(business_id, item_id):
    """Delete menu item"""
    try:
        success = firebase_db.delete_menu_item(business_id, item_id)
        
        if success:
            return jsonify({'success': True}), 200
        else:
            return jsonify({'error': 'Failed to delete menu item'}), 500
            
    except Exception as e:
        logger.error(f"Error deleting menu item: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/orders/<business_id>', methods=['GET'])
@verify_firebase_token
@verify_business_access
def get_orders(business_id):
    """Get orders"""
    try:
        orders = firebase_db.get_orders_by_business(business_id)
        return jsonify({'orders': orders}), 200
    except Exception as e:
        logger.error(f"Error getting orders: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/orders/<order_id>', methods=['PUT'])
@verify_firebase_token
def update_order(order_id):
    """Update order status"""
    try:
        data = request.get_json()
        
        success = firebase_db.update_order(order_id, data)
        
        if success:
            return jsonify({'success': True}), 200
        else:
            return jsonify({'error': 'Failed to update order'}), 500
            
    except Exception as e:
        logger.error(f"Error updating order: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/customers/<business_id>', methods=['GET'])
@verify_firebase_token
@verify_business_access
def get_customers(business_id):
    """Get customers"""
    try:
        customers = firebase_db.get_customers_by_business(business_id)
        return jsonify({'customers': customers}), 200
    except Exception as e:
        logger.error(f"Error getting customers: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/customers/<business_id>', methods=['POST'])
@verify_firebase_token
@verify_business_access
def add_customer(business_id):
    """Add customer"""
    try:
        data = request.get_json()
        phone = data.get('phone')
        
        if not phone:
            return jsonify({'error': 'Phone number required'}), 400
        
        data['business_id'] = business_id
        success = firebase_db.create_customer(phone, data)
        
        if success:
            return jsonify({'success': True}), 201
        else:
            return jsonify({'error': 'Failed to add customer'}), 500
            
    except Exception as e:
        logger.error(f"Error adding customer: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/customers/<phone>', methods=['PUT'])
@verify_firebase_token
def update_customer_info(phone):
    """Update customer"""
    try:
        data = request.get_json()
        
        success = firebase_db.update_customer(phone, data)
        
        if success:
            return jsonify({'success': True}), 200
        else:
            return jsonify({'error': 'Failed to update customer'}), 500
            
    except Exception as e:
        logger.error(f"Error updating customer: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/campaigns/blast', methods=['POST'])
@verify_firebase_token
@verify_business_access
def send_campaign_blast():
    """Send campaign blast"""
    try:
        import time
        
        data = request.get_json()
        business_id = data.get('business_id')
        message = data.get('message')
        target = data.get('target', 'all')
        
        if not message:
            return jsonify({'error': 'Message required'}), 400
        
        customers = firebase_db.get_customers_by_business(business_id)
        
        # Filter customers based on target
        filtered_customers = []
        if target == 'all':
            filtered_customers = customers
        else:
            for customer in customers:
                tags = customer.get('tags', [])
                if target in tags:
                    filtered_customers.append(customer)
        
        sent_count = 0
        for customer in filtered_customers:
            phone = customer.get('phone')
            whatsapp_api.send_text_message(phone, message)
            sent_count += 1
            
            # Rate limiting: 0.5 second delay between messages to avoid API limits
            time.sleep(0.5)
        
        campaign_data = {
            'business_id': business_id,
            'type': data.get('type', 'offer_blast'),
            'message': message,
            'target': target,
            'status': 'sent',
            'sent_count': sent_count
        }
        
        campaign_id = firebase_db.create_campaign(campaign_data)
        
        return jsonify({'success': True, 'sent_count': sent_count, 'campaign_id': campaign_id}), 200
        
    except Exception as e:
        logger.error(f"Error sending campaign: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/campaigns/<business_id>', methods=['GET'])
@verify_firebase_token
@verify_business_access
def get_campaigns(business_id):
    """Get campaign history"""
    try:
        campaigns = firebase_db.get_campaigns_by_business(business_id)
        return jsonify({'campaigns': campaigns}), 200
    except Exception as e:
        logger.error(f"Error getting campaigns: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/analytics/<business_id>', methods=['GET'])
@verify_firebase_token
@verify_business_access
def get_analytics(business_id):
    """Get analytics data"""
    try:
        orders = firebase_db.get_orders_by_business(business_id, limit=1000)
        customers = firebase_db.get_customers_by_business(business_id)
        
        total_revenue = sum(order.get('total', 0) for order in orders if order.get('payment_status') == 'paid')
        total_orders = len([o for o in orders if o.get('payment_status') == 'paid'])
        total_customers = len(customers)
        
        analytics = {
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'total_customers': total_customers,
            'average_order_value': total_revenue / total_orders if total_orders > 0 else 0
        }
        
        return jsonify({'analytics': analytics}), 200
        
    except Exception as e:
        logger.error(f"Error getting analytics: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/upload/image', methods=['POST'])
@verify_firebase_token
def upload_image():
    """Upload image to Cloudinary"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        result = cloudinary_uploader.upload_image(file)
        
        if result['success']:
            return jsonify({'success': True, 'url': result['url']}), 200
        else:
            return jsonify({'error': result['error']}), 500
            
    except Exception as e:
        logger.error(f"Error uploading image: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/verify', methods=['POST'])
@verify_firebase_token
def verify_auth():
    """Verify Firebase token"""
    return jsonify({
        'success': True,
        'user_id': request.user_id,
        'email': request.user_email
    }), 200

@app.route('/api/super-admin/platform-stats', methods=['GET'])
@verify_firebase_token
@verify_super_admin
def get_platform_stats():
    """Get platform-wide statistics (Super Admin only)"""
    try:
        businesses = firebase_db.get_all_businesses()
        
        total_businesses = len(businesses)
        active_businesses = len([b for b in businesses if b.get('is_active')])
        
        total_revenue = 0
        total_orders = 0
        total_customers = 0
        
        for business in businesses:
            business_id = business.get('id')
            orders = firebase_db.get_orders_by_business(business_id, limit=1000)
            customers = firebase_db.get_customers_by_business(business_id)
            
            total_revenue += sum(o.get('total_amount', 0) for o in orders if o.get('payment_status') == 'paid')
            total_orders += len([o for o in orders if o.get('payment_status') == 'paid'])
            total_customers += len(customers)
        
        stats = {
            'total_businesses': total_businesses,
            'active_businesses': active_businesses,
            'inactive_businesses': total_businesses - active_businesses,
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'total_customers': total_customers,
            'average_revenue_per_business': total_revenue / active_businesses if active_businesses > 0 else 0
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"Error getting platform stats: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/super-admin/all-orders', methods=['GET'])
@verify_firebase_token
@verify_super_admin
def get_all_orders():
    """Get all orders across all businesses (Super Admin only)"""
    try:
        businesses = firebase_db.get_all_businesses()
        all_orders = []
        
        for business in businesses:
            business_id = business.get('id')
            business_name = business.get('name')
            orders = firebase_db.get_orders_by_business(business_id, limit=100)
            
            for order in orders:
                order['business_name'] = business_name
                all_orders.append(order)
        
        # Sort by created_at descending
        all_orders.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return jsonify({'orders': all_orders[:200]}), 200  # Limit to 200 most recent
        
    except Exception as e:
        logger.error(f"Error getting all orders: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/super-admin/all-customers', methods=['GET'])
@verify_firebase_token
@verify_super_admin
def get_all_customers():
    """Get all customers across all businesses (Super Admin only)"""
    try:
        businesses = firebase_db.get_all_businesses()
        all_customers = []
        
        for business in businesses:
            business_id = business.get('id')
            business_name = business.get('name')
            customers = firebase_db.get_customers_by_business(business_id)
            
            for customer in customers:
                customer['business_name'] = business_name
                all_customers.append(customer)
        
        return jsonify({'customers': all_customers}), 200
        
    except Exception as e:
        logger.error(f"Error getting all customers: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/super-admin/revenue-by-business', methods=['GET'])
@verify_firebase_token
@verify_super_admin
def get_revenue_by_business():
    """Get revenue breakdown by business (Super Admin only)"""
    try:
        businesses = firebase_db.get_all_businesses()
        revenue_data = []
        
        for business in businesses:
            business_id = business.get('id')
            business_name = business.get('name')
            orders = firebase_db.get_orders_by_business(business_id, limit=1000)
            
            revenue = sum(o.get('total_amount', 0) for o in orders if o.get('payment_status') == 'paid')
            order_count = len([o for o in orders if o.get('payment_status') == 'paid'])
            
            revenue_data.append({
                'business_id': business_id,
                'business_name': business_name,
                'revenue': revenue,
                'orders': order_count,
                'average_order_value': revenue / order_count if order_count > 0 else 0
            })
        
        # Sort by revenue descending
        revenue_data.sort(key=lambda x: x['revenue'], reverse=True)
        
        return jsonify({'revenue_by_business': revenue_data}), 200
        
    except Exception as e:
        logger.error(f"Error getting revenue by business: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/super-admin/business/<business_id>/full-access', methods=['GET'])
@verify_firebase_token
@verify_super_admin
def super_admin_business_access(business_id):
    """Super Admin can access any business data"""
    try:
        business = firebase_db.get_business(business_id)
        if not business:
            return jsonify({'error': 'Business not found'}), 404
        
        orders = firebase_db.get_orders_by_business(business_id, limit=100)
        customers = firebase_db.get_customers_by_business(business_id)
        menu = firebase_db.get_menu(business_id)
        campaigns = firebase_db.get_campaigns_by_business(business_id)
        
        return jsonify({
            'business': business,
            'orders': orders,
            'customers': customers,
            'menu': menu,
            'campaigns': campaigns
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting business full access: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/', methods=['GET'])
def home():
    """Root endpoint"""
    return jsonify({
        'message': 'WhatsApp AI Sales Agent SaaS Platform',
        'version': '1.0.0',
        'status': 'active'
    }), 200

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    scheduler.start()
    logger.info(f"Starting Flask server on {app.config['HOST']}:{app.config['PORT']}")
    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    )
