"""
Unit tests for payment system
Run with: pytest tests/test_payment.py
"""

import unittest
from unittest.mock import Mock, patch
from datetime import datetime, timedelta
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from payment import PaymentSystem

class TestPaymentSystem(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures"""
        self.payment_system = PaymentSystem()
    
    def test_generate_signature(self):
        """Test HMAC signature generation"""
        order_id = "test_order_123"
        signature = self.payment_system.generate_signature(order_id)
        
        self.assertIsNotNone(signature)
        self.assertIsInstance(signature, str)
        self.assertEqual(len(signature), 64)  # SHA256 hex is 64 chars
    
    def test_verify_signature_valid(self):
        """Test signature verification with valid signature"""
        order_id = "test_order_123"
        signature = self.payment_system.generate_signature(order_id)
        
        is_valid = self.payment_system.verify_signature(order_id, signature)
        self.assertTrue(is_valid)
    
    def test_verify_signature_invalid(self):
        """Test signature verification with invalid signature"""
        order_id = "test_order_123"
        invalid_signature = "invalid_signature_123"
        
        is_valid = self.payment_system.verify_signature(order_id, invalid_signature)
        self.assertFalse(is_valid)
    
    def test_generate_payment_link(self):
        """Test payment link generation"""
        order_id = "test_order_123"
        base_url = "https://example.com"
        
        payment_link = self.payment_system.generate_payment_link(order_id, base_url)
        
        self.assertIsNotNone(payment_link)
        self.assertIn(base_url, payment_link)
        self.assertIn(order_id, payment_link)
        self.assertIn("sig=", payment_link)
    
    def test_generate_upi_deep_link(self):
        """Test UPI deep link generation"""
        upi_id = "test@upi"
        business_name = "Test Business"
        amount = 500
        order_id = "test_order_123"
        
        upi_link = self.payment_system.generate_upi_deep_link(
            upi_id, business_name, amount, order_id
        )
        
        self.assertIsNotNone(upi_link)
        self.assertIn("upi://pay", upi_link)
        self.assertIn(upi_id, upi_link)
        self.assertIn(str(amount), upi_link)
        self.assertIn(order_id, upi_link)
    
    def test_calculate_expiry_time(self):
        """Test expiry time calculation"""
        minutes = 30
        expiry_time = self.payment_system.calculate_expiry_time(minutes)
        
        self.assertIsInstance(expiry_time, datetime)
        
        # Check if expiry is approximately 30 minutes from now
        now = datetime.utcnow()
        diff = (expiry_time - now).total_seconds()
        self.assertAlmostEqual(diff, minutes * 60, delta=5)
    
    def test_is_payment_expired_not_expired(self):
        """Test payment expiry check for non-expired payment"""
        created_at = datetime.utcnow()
        is_expired = self.payment_system.is_payment_expired(created_at, expiry_minutes=30)
        
        self.assertFalse(is_expired)
    
    def test_is_payment_expired_expired(self):
        """Test payment expiry check for expired payment"""
        created_at = datetime.utcnow() - timedelta(minutes=35)
        is_expired = self.payment_system.is_payment_expired(created_at, expiry_minutes=30)
        
        self.assertTrue(is_expired)
    
    def test_is_payment_expired_none(self):
        """Test payment expiry check with None timestamp"""
        is_expired = self.payment_system.is_payment_expired(None)
        
        self.assertTrue(is_expired)

if __name__ == '__main__':
    unittest.main()
