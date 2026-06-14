from functools import wraps
from flask import request, jsonify
import firebase_admin
from firebase_admin import auth
import logging

logger = logging.getLogger(__name__)

def verify_firebase_token(f):
    """Decorator to verify Firebase JWT token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                return jsonify({'error': 'No authorization header'}), 401
            
            if not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Invalid authorization header format'}), 401
            
            token = auth_header.split('Bearer ')[1]
            
            decoded_token = auth.verify_id_token(token)
            request.user_id = decoded_token['uid']
            request.user_email = decoded_token.get('email')
            
            return f(*args, **kwargs)
            
        except auth.InvalidIdTokenError:
            logger.warning("Invalid Firebase token")
            return jsonify({'error': 'Invalid token'}), 401
        except auth.ExpiredIdTokenError:
            logger.warning("Expired Firebase token")
            return jsonify({'error': 'Token expired'}), 401
        except Exception as e:
            logger.error(f"Token verification error: {str(e)}")
            return jsonify({'error': 'Authentication failed'}), 401
    
    return decorated_function

def verify_super_admin(f):
    """Decorator to verify super admin access"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            from config import Config
            
            if not hasattr(request, 'user_email'):
                return jsonify({'error': 'Authentication required'}), 401
            
            if request.user_email != Config.SUPER_ADMIN_EMAIL:
                return jsonify({'error': 'Super admin access required'}), 403
            
            return f(*args, **kwargs)
            
        except Exception as e:
            logger.error(f"Super admin verification error: {str(e)}")
            return jsonify({'error': 'Authorization failed'}), 403
    
    return decorated_function

def verify_business_access(f):
    """Decorator to verify business access"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            from firebase_db import firebase_db
            from config import Config
            
            if not hasattr(request, 'user_email'):
                return jsonify({'error': 'Authentication required'}), 401
            
            business_id = kwargs.get('business_id') or (request.json.get('business_id') if request.json else None)
            
            if not business_id:
                return jsonify({'error': 'Business ID required'}), 400
            
            business = firebase_db.get_business(business_id)
            
            if not business:
                return jsonify({'error': 'Business not found'}), 404
            
            # Super admin has access to all businesses
            is_super_admin = request.user_email == Config.SUPER_ADMIN_EMAIL
            is_owner = business.get('owner_email') == request.user_email
            
            if not is_super_admin and not is_owner:
                return jsonify({'error': 'Access denied to this business'}), 403
            
            request.business_id = business_id
            request.business_data = business
            
            return f(*args, **kwargs)
            
        except Exception as e:
            logger.error(f"Business access verification error: {str(e)}")
            return jsonify({'error': 'Authorization failed'}), 403
    
    return decorated_function
