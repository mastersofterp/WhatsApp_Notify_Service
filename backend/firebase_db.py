import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import logging
import os

logger = logging.getLogger(__name__)

class FirebaseDB:
    _instance = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirebaseDB, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize Firebase Admin SDK"""
        try:
            if not firebase_admin._apps:
                # Try to get credentials from environment variable (JSON string)
                cred_json = os.getenv('FIREBASE_CREDENTIALS_JSON')
                
                if cred_json:
                    # Production: Use JSON string from environment
                    import json
                    cred_dict = json.loads(cred_json)
                    cred = credentials.Certificate(cred_dict)
                    firebase_admin.initialize_app(cred)
                    logger.info("Firebase initialized from environment JSON")
                else:
                    # Local: Use file path
                    cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')
                    
                    if os.path.exists(cred_path):
                        cred = credentials.Certificate(cred_path)
                        firebase_admin.initialize_app(cred)
                        logger.info("Firebase initialized from file")
                    else:
                        # Fallback to default credentials (won't work on Render)
                        firebase_admin.initialize_app()
                        logger.warning("Firebase initialized with default credentials")
                
                self._db = firestore.client()
                logger.info("Firebase Firestore client created successfully")
        except Exception as e:
            logger.error(f"Firebase initialization error: {str(e)}")
            raise
    
    @property
    def db(self):
        return self._db
    
    def get_business(self, business_id):
        """Get business by ID"""
        try:
            doc = self._db.collection('businesses').document(business_id).get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Error getting business {business_id}: {str(e)}")
            return None
    
    def get_business_by_phone_id(self, phone_number_id):
        """Get business by WhatsApp phone number ID"""
        try:
            docs = self._db.collection('businesses').where('phone_number_id', '==', phone_number_id).limit(1).stream()
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                return data
            return None
        except Exception as e:
            logger.error(f"Error getting business by phone ID: {str(e)}")
            return None
    
    def get_all_businesses(self):
        """Get all businesses"""
        try:
            docs = self._db.collection('businesses').stream()
            businesses = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                businesses.append(data)
            return businesses
        except Exception as e:
            logger.error(f"Error getting all businesses: {str(e)}")
            return []
    
    def create_business(self, business_data):
        """Create new business"""
        try:
            business_data['created_at'] = firestore.SERVER_TIMESTAMP
            business_data['is_active'] = True
            doc_ref = self._db.collection('businesses').document()
            doc_ref.set(business_data)
            return doc_ref.id
        except Exception as e:
            logger.error(f"Error creating business: {str(e)}")
            return None
    
    def update_business(self, business_id, update_data):
        """Update business"""
        try:
            self._db.collection('businesses').document(business_id).update(update_data)
            return True
        except Exception as e:
            logger.error(f"Error updating business: {str(e)}")
            return False
    
    def delete_business(self, business_id):
        """Delete business"""
        try:
            self._db.collection('businesses').document(business_id).delete()
            return True
        except Exception as e:
            logger.error(f"Error deleting business: {str(e)}")
            return False
    
    def get_menu(self, business_id):
        """Get menu items for a business"""
        try:
            docs = self._db.collection('businesses').document(business_id).collection('menu').stream()
            menu_items = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                menu_items.append(data)
            return menu_items
        except Exception as e:
            logger.error(f"Error getting menu: {str(e)}")
            return []
    
    def add_menu_item(self, business_id, item_data):
        """Add menu item"""
        try:
            item_data['is_available'] = True
            doc_ref = self._db.collection('businesses').document(business_id).collection('menu').document()
            doc_ref.set(item_data)
            return doc_ref.id
        except Exception as e:
            logger.error(f"Error adding menu item: {str(e)}")
            return None
    
    def update_menu_item(self, business_id, item_id, update_data):
        """Update menu item"""
        try:
            self._db.collection('businesses').document(business_id).collection('menu').document(item_id).update(update_data)
            return True
        except Exception as e:
            logger.error(f"Error updating menu item: {str(e)}")
            return False
    
    def delete_menu_item(self, business_id, item_id):
        """Delete menu item"""
        try:
            self._db.collection('businesses').document(business_id).collection('menu').document(item_id).delete()
            return True
        except Exception as e:
            logger.error(f"Error deleting menu item: {str(e)}")
            return False
    
    def get_settings(self, business_id):
        """Get business settings"""
        try:
            doc = self._db.collection('businesses').document(business_id).collection('settings').document('config').get()
            if doc.exists:
                return doc.to_dict()
            return {}
        except Exception as e:
            logger.error(f"Error getting settings: {str(e)}")
            return {}
    
    def update_settings(self, business_id, settings_data):
        """Update business settings"""
        try:
            self._db.collection('businesses').document(business_id).collection('settings').document('config').set(settings_data, merge=True)
            return True
        except Exception as e:
            logger.error(f"Error updating settings: {str(e)}")
            return False
    
    def get_customer(self, phone_number):
        """Get customer by phone number"""
        try:
            doc = self._db.collection('customers').document(phone_number).get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Error getting customer: {str(e)}")
            return None
    
    def create_customer(self, phone_number, customer_data):
        """Create new customer"""
        try:
            customer_data['created_at'] = firestore.SERVER_TIMESTAMP
            customer_data['last_active'] = firestore.SERVER_TIMESTAMP
            customer_data['total_orders'] = 0
            customer_data['total_spent'] = 0
            customer_data['loyalty_points'] = 0
            self._db.collection('customers').document(phone_number).set(customer_data)
            return True
        except Exception as e:
            logger.error(f"Error creating customer: {str(e)}")
            return False
    
    def update_customer(self, phone_number, update_data):
        """Update customer"""
        try:
            update_data['last_active'] = firestore.SERVER_TIMESTAMP
            self._db.collection('customers').document(phone_number).update(update_data)
            return True
        except Exception as e:
            logger.error(f"Error updating customer: {str(e)}")
            return False
    
    def get_customers_by_business(self, business_id):
        """Get all customers for a business"""
        try:
            docs = self._db.collection('customers').where('business_id', '==', business_id).stream()
            customers = []
            for doc in docs:
                data = doc.to_dict()
                data['phone'] = doc.id
                customers.append(data)
            return customers
        except Exception as e:
            logger.error(f"Error getting customers: {str(e)}")
            return []
    
    def create_order(self, order_data):
        """Create new order"""
        try:
            order_data['created_at'] = firestore.SERVER_TIMESTAMP
            order_data['status'] = 'pending'
            order_data['payment_status'] = 'unpaid'
            doc_ref = self._db.collection('orders').document()
            doc_ref.set(order_data)
            return doc_ref.id
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}")
            return None
    
    def get_order(self, order_id):
        """Get order by ID"""
        try:
            doc = self._db.collection('orders').document(order_id).get()
            if doc.exists:
                data = doc.to_dict()
                data['id'] = doc.id
                return data
            return None
        except Exception as e:
            logger.error(f"Error getting order: {str(e)}")
            return None
    
    def update_order(self, order_id, update_data):
        """Update order"""
        try:
            self._db.collection('orders').document(order_id).update(update_data)
            return True
        except Exception as e:
            logger.error(f"Error updating order: {str(e)}")
            return False
    
    def get_orders_by_business(self, business_id, limit=100):
        """Get orders for a business"""
        try:
            docs = self._db.collection('orders').where('business_id', '==', business_id).order_by('created_at', direction=firestore.Query.DESCENDING).limit(limit).stream()
            orders = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                orders.append(data)
            return orders
        except Exception as e:
            logger.error(f"Error getting orders: {str(e)}")
            return []
    
    def get_conversation(self, phone_number, business_id):
        """Get conversation history"""
        try:
            conv_id = f"{phone_number}_{business_id}"
            doc = self._db.collection('conversations').document(conv_id).get()
            if doc.exists:
                return doc.to_dict()
            return {'messages': []}
        except Exception as e:
            logger.error(f"Error getting conversation: {str(e)}")
            return {'messages': []}
    
    def save_conversation(self, phone_number, business_id, messages):
        """Save conversation history"""
        try:
            conv_id = f"{phone_number}_{business_id}"
            self._db.collection('conversations').document(conv_id).set({
                'messages': messages,
                'last_updated': firestore.SERVER_TIMESTAMP
            })
            return True
        except Exception as e:
            logger.error(f"Error saving conversation: {str(e)}")
            return False
    
    def add_message_to_conversation(self, phone_number, business_id, role, content):
        """Add a message to conversation"""
        try:
            conv_id = f"{phone_number}_{business_id}"
            message = {
                'role': role,
                'content': content,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            doc_ref = self._db.collection('conversations').document(conv_id)
            doc = doc_ref.get()
            
            if doc.exists:
                doc_ref.update({
                    'messages': firestore.ArrayUnion([message]),
                    'last_updated': firestore.SERVER_TIMESTAMP
                })
            else:
                doc_ref.set({
                    'messages': [message],
                    'last_updated': firestore.SERVER_TIMESTAMP
                })
            return True
        except Exception as e:
            logger.error(f"Error adding message: {str(e)}")
            return False
    
    def create_campaign(self, campaign_data):
        """Create campaign"""
        try:
            campaign_data['created_at'] = firestore.SERVER_TIMESTAMP
            doc_ref = self._db.collection('campaigns').document()
            doc_ref.set(campaign_data)
            return doc_ref.id
        except Exception as e:
            logger.error(f"Error creating campaign: {str(e)}")
            return None
    
    def get_campaigns_by_business(self, business_id):
        """Get campaigns for a business"""
        try:
            docs = self._db.collection('campaigns').where('business_id', '==', business_id).order_by('created_at', direction=firestore.Query.DESCENDING).stream()
            campaigns = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                campaigns.append(data)
            return campaigns
        except Exception as e:
            logger.error(f"Error getting campaigns: {str(e)}")
            return []
    
    def get_birthday_customers_today(self):
        """Get customers with birthday today"""
        try:
            today = datetime.now().strftime('%m-%d')
            docs = self._db.collection('customers').stream()
            birthday_customers = []
            for doc in docs:
                data = doc.to_dict()
                if 'birthday' in data and data['birthday']:
                    try:
                        birthday_date = datetime.strptime(data['birthday'], '%Y-%m-%d')
                        if birthday_date.strftime('%m-%d') == today:
                            data['phone'] = doc.id
                            birthday_customers.append(data)
                    except:
                        continue
            return birthday_customers
        except Exception as e:
            logger.error(f"Error getting birthday customers: {str(e)}")
            return []
    
    def get_customers_by_birthday(self, date_str):
        """Get customers with birthday on specific date (MM-DD format)"""
        try:
            docs = self._db.collection('customers').stream()
            customers = []
            for doc in docs:
                data = doc.to_dict()
                if 'birthday' in data and data['birthday']:
                    try:
                        birthday_date = datetime.strptime(data['birthday'], '%Y-%m-%d')
                        if birthday_date.strftime('%m-%d') == date_str:
                            data['phone'] = doc.id
                            customers.append(data)
                    except:
                        continue
            return customers
        except Exception as e:
            logger.error(f"Error getting customers by birthday: {str(e)}")
            return []
    
    def get_customer_segments(self, business_id):
        """Get customer segments (VIP, Regular, New, Inactive)"""
        try:
            customers = self.get_customers_by_business(business_id)
            segments = {'VIP': [], 'Regular': [], 'New': [], 'Inactive': []}
            
            for customer in customers:
                tags = customer.get('tags', [])
                if 'VIP' in tags:
                    segments['VIP'].append(customer)
                elif 'Regular' in tags:
                    segments['Regular'].append(customer)
                elif 'New' in tags:
                    segments['New'].append(customer)
                elif 'Inactive' in tags:
                    segments['Inactive'].append(customer)
            
            return segments
        except Exception as e:
            logger.error(f"Error getting customer segments: {str(e)}")
            return {'VIP': [], 'Regular': [], 'New': [], 'Inactive': []}
    
    def update_order_status(self, order_id, status):
        """Update order status"""
        try:
            self._db.collection('orders').document(order_id).update({
                'status': status,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            return True
        except Exception as e:
            logger.error(f"Error updating order status: {str(e)}")
            return False
    
    def update_payment_status(self, order_id, status):
        """Update payment status"""
        try:
            self._db.collection('orders').document(order_id).update({
                'payment_status': status,
                'payment_updated_at': firestore.SERVER_TIMESTAMP
            })
            return True
        except Exception as e:
            logger.error(f"Error updating payment status: {str(e)}")
            return False
    
    def get_todays_orders(self, business_id):
        """Get today's orders for a business"""
        try:
            today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            docs = self._db.collection('orders').where('business_id', '==', business_id).where('created_at', '>=', today_start).stream()
            orders = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                orders.append(data)
            return orders
        except Exception as e:
            logger.error(f"Error getting today's orders: {str(e)}")
            return []
    
    def get_revenue_stats(self, business_id, days=30):
        """Get revenue statistics for last N days"""
        try:
            from datetime import timedelta
            start_date = datetime.now() - timedelta(days=days)
            
            docs = self._db.collection('orders').where('business_id', '==', business_id).where('created_at', '>=', start_date).where('payment_status', '==', 'paid').stream()
            
            total_revenue = 0
            order_count = 0
            
            for doc in docs:
                data = doc.to_dict()
                total_revenue += data.get('total_amount', 0)
                order_count += 1
            
            return {
                'total_revenue': total_revenue,
                'order_count': order_count,
                'average_order_value': total_revenue / order_count if order_count > 0 else 0
            }
        except Exception as e:
            logger.error(f"Error getting revenue stats: {str(e)}")
            return {'total_revenue': 0, 'order_count': 0, 'average_order_value': 0}
    
    def clear_conversation(self, phone_number, business_id):
        """Clear conversation history"""
        try:
            conv_id = f"{phone_number}_{business_id}"
            self._db.collection('conversations').document(conv_id).delete()
            return True
        except Exception as e:
            logger.error(f"Error clearing conversation: {str(e)}")
            return False
    
    def get_dashboard_stats(self, business_id):
        """Get dashboard statistics"""
        try:
            today_orders = self.get_todays_orders(business_id)
            all_orders = self.get_orders_by_business(business_id, limit=1000)
            customers = self.get_customers_by_business(business_id)
            
            today_revenue = sum(order.get('total_amount', 0) for order in today_orders if order.get('payment_status') == 'paid')
            pending_orders = [order for order in all_orders if order.get('status') == 'pending']
            new_customers_today = [c for c in customers if c.get('created_at') and c['created_at'].date() == datetime.now().date()]
            
            return {
                'todays_orders': len(today_orders),
                'todays_revenue': today_revenue,
                'pending_orders': len(pending_orders),
                'new_customers': len(new_customers_today),
                'total_customers': len(customers)
            }
        except Exception as e:
            logger.error(f"Error getting dashboard stats: {str(e)}")
            return {'todays_orders': 0, 'todays_revenue': 0, 'pending_orders': 0, 'new_customers': 0, 'total_customers': 0}
    
    def get_revenue_by_date(self, business_id, days=30):
        """Get revenue grouped by date"""
        try:
            from datetime import timedelta
            from collections import defaultdict
            
            start_date = datetime.now() - timedelta(days=days)
            docs = self._db.collection('orders').where('business_id', '==', business_id).where('created_at', '>=', start_date).where('payment_status', '==', 'paid').stream()
            
            revenue_by_date = defaultdict(float)
            
            for doc in docs:
                data = doc.to_dict()
                date_str = data['created_at'].strftime('%Y-%m-%d') if hasattr(data['created_at'], 'strftime') else datetime.now().strftime('%Y-%m-%d')
                revenue_by_date[date_str] += data.get('total_amount', 0)
            
            return dict(revenue_by_date)
        except Exception as e:
            logger.error(f"Error getting revenue by date: {str(e)}")
            return {}
    
    def get_best_selling_items(self, business_id, limit=10):
        """Get best selling menu items"""
        try:
            from collections import Counter
            
            orders = self.get_orders_by_business(business_id, limit=1000)
            item_counts = Counter()
            
            for order in orders:
                items = order.get('items', [])
                for item in items:
                    item_name = item.get('name', 'Unknown')
                    quantity = item.get('quantity', 1)
                    item_counts[item_name] += quantity
            
            return [{'name': name, 'count': count} for name, count in item_counts.most_common(limit)]
        except Exception as e:
            logger.error(f"Error getting best selling items: {str(e)}")
            return []
    
    def get_peak_hours(self, business_id):
        """Get peak ordering hours"""
        try:
            from collections import defaultdict
            
            orders = self.get_orders_by_business(business_id, limit=1000)
            hour_counts = defaultdict(int)
            
            for order in orders:
                created_at = order.get('created_at')
                if created_at and hasattr(created_at, 'hour'):
                    hour_counts[created_at.hour] += 1
            
            return dict(hour_counts)
        except Exception as e:
            logger.error(f"Error getting peak hours: {str(e)}")
            return {}
    
    def add_loyalty_points(self, phone_number, business_id, points):
        """Add loyalty points to customer"""
        try:
            customer = self.get_customer(phone_number)
            if customer:
                current_points = customer.get('loyalty_points', 0)
                self.update_customer(phone_number, {'loyalty_points': current_points + points})
                return True
            return False
        except Exception as e:
            logger.error(f"Error adding loyalty points: {str(e)}")
            return False
    
    def get_loyalty_points(self, phone_number, business_id):
        """Get customer loyalty points"""
        try:
            customer = self.get_customer(phone_number)
            if customer:
                return customer.get('loyalty_points', 0)
            return 0
        except Exception as e:
            logger.error(f"Error getting loyalty points: {str(e)}")
            return 0
    
    def redeem_loyalty_points(self, phone_number, business_id, points):
        """Redeem loyalty points"""
        try:
            customer = self.get_customer(phone_number)
            if customer:
                current_points = customer.get('loyalty_points', 0)
                if current_points >= points:
                    self.update_customer(phone_number, {'loyalty_points': current_points - points})
                    return True
            return False
        except Exception as e:
            logger.error(f"Error redeeming loyalty points: {str(e)}")
            return False
    
    def _get_timestamp(self):
        """Get current timestamp"""
        return firestore.SERVER_TIMESTAMP

firebase_db = FirebaseDB()
