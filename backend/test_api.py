"""
Basic API Tests for WhatsApp SaaS
Run with: python test_api.py
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_ping():
    """Test health check endpoint"""
    print("Testing /ping endpoint...")
    response = requests.get(f"{BASE_URL}/ping")
    
    if response.status_code == 200:
        data = response.json()
        if 'status' in data and data['status'] == 'ok':
            print("✅ /ping endpoint working")
            return True
    print("❌ /ping endpoint failed")
    return False

def test_webhook_verification():
    """Test webhook verification"""
    print("\nTesting /webhook verification...")
    params = {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'your_custom_verify_token',
        'hub.challenge': 'test_challenge_123'
    }
    response = requests.get(f"{BASE_URL}/webhook", params=params)
    
    if response.status_code == 200 and response.text == 'test_challenge_123':
        print("✅ Webhook verification working")
        return True
    print("❌ Webhook verification failed")
    return False

def test_menu_endpoint():
    """Test menu endpoint (no auth required)"""
    print("\nTesting /api/menu/cake_shop endpoint...")
    response = requests.get(f"{BASE_URL}/api/menu/cake_shop")
    
    if response.status_code == 200:
        data = response.json()
        if 'menu' in data:
            print(f"✅ Menu endpoint working - {len(data['menu'])} items found")
            return True
    print("❌ Menu endpoint failed")
    return False

def test_payment_page():
    """Test payment page rendering"""
    print("\nTesting /pay/test123 endpoint...")
    response = requests.get(f"{BASE_URL}/pay/test123")
    
    if response.status_code == 200 and 'html' in response.text.lower():
        print("✅ Payment page rendering")
        return True
    print("❌ Payment page failed")
    return False

def run_all_tests():
    """Run all tests"""
    print("=" * 50)
    print("WhatsApp SaaS - API Tests")
    print("=" * 50)
    
    tests = [
        test_ping,
        test_webhook_verification,
        test_menu_endpoint,
        test_payment_page
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ Test failed with error: {str(e)}")
            failed += 1
    
    print("\n" + "=" * 50)
    print(f"Tests Passed: {passed}/{len(tests)}")
    print(f"Tests Failed: {failed}/{len(tests)}")
    print("=" * 50)
    
    if failed == 0:
        print("\n🎉 All tests passed!")
    else:
        print(f"\n⚠️  {failed} test(s) failed. Check the output above.")

if __name__ == "__main__":
    print("\n⚠️  Make sure the Flask server is running on http://localhost:8000")
    print("Run: python app.py\n")
    
    input("Press Enter to start tests...")
    run_all_tests()
