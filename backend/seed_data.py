"""
Seed Data Script for WhatsApp SaaS
Adds initial demo data for The Cake Shop
"""

from firebase_db import firebase_db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_cake_shop():
    """Seed The Cake Shop demo business with menu and settings"""
    
    business_id = 'cake_shop'
    
    # Business data
    business_data = {
        'id': business_id,
        'name': 'The Cake Shop',
        'display_name': 'The Cake Shop 🎂',
        'owner_email': 'owner@cakeshop.com',
        'phone_number_id': '1092397067300949',
        'waba_id': '1511512567022058',
        'upi_id': 'cakeshop@okaxis',
        'logo_url': 'https://via.placeholder.com/200/FF6B6B/FFFFFF?text=🎂',
        'theme_color': '#FF6B6B',
        'is_active': True,
        'bot_personality': 'friendly',
        'welcome_message': 'Welcome to The Cake Shop! 🎂 Main aapki kaise help kar sakta hun?',
        'offline_message': 'Sorry, we are currently closed. Our timings are 9 AM to 9 PM. Please message us during business hours!',
        'timings': {
            'open': '09:00',
            'close': '21:00'
        },
        'min_order': 200,
        'delivery_charge': 50,
        'free_delivery_above': 500,
        'languages': ['Hindi', 'English'],
        'created_at': firebase_db._get_timestamp()
    }
    
    logger.info(f"Creating business: {business_data['name']}")
    firebase_db.create_business(business_data)
    
    # Menu items
    menu_items = [
        {
            'name': 'Chocolate Truffle Cake',
            'category': 'Cakes',
            'description': 'Rich chocolate cake with truffle cream',
            'variants': [
                {'name': '500g', 'price': 450},
                {'name': '1kg', 'price': 850},
                {'name': '2kg', 'price': 1600}
            ],
            'image_url': 'https://via.placeholder.com/300/8B4513/FFFFFF?text=Chocolate+Truffle',
            'is_available': True,
            'is_bestseller': True,
            'prep_time': '24 hours',
            'allergens': ['eggs', 'dairy', 'gluten']
        },
        {
            'name': 'Red Velvet Cake',
            'category': 'Cakes',
            'description': 'Classic red velvet with cream cheese frosting',
            'variants': [
                {'name': '500g', 'price': 500},
                {'name': '1kg', 'price': 950},
                {'name': '2kg', 'price': 1800}
            ],
            'image_url': 'https://via.placeholder.com/300/DC143C/FFFFFF?text=Red+Velvet',
            'is_available': True,
            'is_bestseller': True,
            'prep_time': '24 hours',
            'allergens': ['eggs', 'dairy', 'gluten']
        },
        {
            'name': 'Black Forest Cake',
            'category': 'Cakes',
            'description': 'Chocolate sponge with cherry and cream',
            'variants': [
                {'name': '500g', 'price': 480},
                {'name': '1kg', 'price': 880},
                {'name': '2kg', 'price': 1700}
            ],
            'image_url': 'https://via.placeholder.com/300/2F4F4F/FFFFFF?text=Black+Forest',
            'is_available': True,
            'is_bestseller': False,
            'prep_time': '24 hours',
            'allergens': ['eggs', 'dairy', 'gluten']
        },
        {
            'name': 'Butterscotch Cake',
            'category': 'Cakes',
            'description': 'Butterscotch flavored cake with caramel',
            'variants': [
                {'name': '500g', 'price': 420},
                {'name': '1kg', 'price': 800},
                {'name': '2kg', 'price': 1500}
            ],
            'image_url': 'https://via.placeholder.com/300/DAA520/FFFFFF?text=Butterscotch',
            'is_available': True,
            'is_bestseller': False,
            'prep_time': '24 hours',
            'allergens': ['eggs', 'dairy', 'gluten']
        },
        {
            'name': 'Photo Cake',
            'category': 'Custom Orders',
            'description': 'Personalized cake with edible photo print',
            'variants': [
                {'name': '1kg', 'price': 1200},
                {'name': '2kg', 'price': 2200}
            ],
            'image_url': 'https://via.placeholder.com/300/FF69B4/FFFFFF?text=Photo+Cake',
            'is_available': True,
            'is_bestseller': False,
            'prep_time': '48 hours',
            'allergens': ['eggs', 'dairy', 'gluten']
        },
        {
            'name': 'Custom Fondant Cake',
            'category': 'Custom Orders',
            'description': 'Fully customized fondant cake with your design',
            'price': 1500,
            'image_url': 'https://via.placeholder.com/300/9370DB/FFFFFF?text=Fondant+Cake',
            'is_available': True,
            'is_bestseller': False,
            'prep_time': '72 hours',
            'allergens': ['eggs', 'dairy', 'gluten'],
            'note': 'Price starts at ₹1500 per kg'
        },
        {
            'name': 'Pastry Box (6 pieces)',
            'category': 'Pastries',
            'description': 'Assorted pastries - chocolate, pineapple, strawberry',
            'price': 280,
            'image_url': 'https://via.placeholder.com/300/FFB6C1/FFFFFF?text=Pastry+Box',
            'is_available': True,
            'is_bestseller': True,
            'prep_time': '2 hours',
            'allergens': ['eggs', 'dairy', 'gluten']
        },
        {
            'name': 'Chocolate Brownie',
            'category': 'Pastries',
            'description': 'Fudgy chocolate brownie with walnuts',
            'price': 60,
            'image_url': 'https://via.placeholder.com/300/654321/FFFFFF?text=Brownie',
            'is_available': True,
            'is_bestseller': False,
            'prep_time': '1 hour',
            'allergens': ['eggs', 'dairy', 'gluten', 'nuts']
        },
        {
            'name': 'Cold Coffee',
            'category': 'Beverages',
            'description': 'Chilled coffee with ice cream',
            'price': 120,
            'image_url': 'https://via.placeholder.com/300/8B4513/FFFFFF?text=Cold+Coffee',
            'is_available': True,
            'is_bestseller': False,
            'prep_time': '5 minutes',
            'allergens': ['dairy']
        },
        {
            'name': 'Fresh Fruit Juice',
            'category': 'Beverages',
            'description': 'Seasonal fresh fruit juice',
            'price': 80,
            'image_url': 'https://via.placeholder.com/300/FFA500/FFFFFF?text=Fruit+Juice',
            'is_available': True,
            'is_bestseller': False,
            'prep_time': '5 minutes',
            'allergens': []
        }
    ]
    
    logger.info(f"Adding {len(menu_items)} menu items...")
    for item in menu_items:
        firebase_db.add_menu_item(business_id, item)
        logger.info(f"  ✓ Added: {item['name']}")
    
    # Sample customers
    sample_customers = [
        {
            'phone': '919876543210',
            'name': 'Rahul Sharma',
            'birthday': '15-08',
            'tags': ['VIP'],
            'total_orders': 5,
            'total_spent': 4500,
            'loyalty_points': 450,
            'business_id': business_id
        },
        {
            'phone': '919876543211',
            'name': 'Priya Patel',
            'birthday': '22-12',
            'tags': ['Regular'],
            'total_orders': 3,
            'total_spent': 2800,
            'loyalty_points': 280,
            'business_id': business_id
        },
        {
            'phone': '919876543212',
            'name': 'Amit Kumar',
            'birthday': '10-03',
            'tags': ['New'],
            'total_orders': 1,
            'total_spent': 850,
            'loyalty_points': 85,
            'business_id': business_id
        }
    ]
    
    logger.info(f"Adding {len(sample_customers)} sample customers...")
    for customer in sample_customers:
        firebase_db.create_customer(customer['phone'], business_id, customer)
        logger.info(f"  ✓ Added: {customer['name']}")
    
    logger.info("✅ Seed data added successfully!")
    logger.info(f"Business ID: {business_id}")
    logger.info(f"Phone Number ID: {business_data['phone_number_id']}")
    logger.info(f"UPI ID: {business_data['upi_id']}")

if __name__ == '__main__':
    try:
        seed_cake_shop()
    except Exception as e:
        logger.error(f"Error seeding data: {str(e)}")
        raise
