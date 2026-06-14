#!/usr/bin/env python3
"""
Quick test script to verify Firebase credentials are working
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("🔥 FIREBASE CREDENTIALS TEST")
print("=" * 60)

# Check if credentials file exists
cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')
print(f"\n1. Checking credentials file: {cred_path}")

if os.path.exists(cred_path):
    print(f"   ✅ File found: {cred_path}")
    print(f"   📦 File size: {os.path.getsize(cred_path)} bytes")
else:
    print(f"   ❌ File NOT found: {cred_path}")
    exit(1)

# Try to initialize Firebase
print("\n2. Initializing Firebase Admin SDK...")
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    
    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("   ✅ Firebase Admin SDK initialized successfully!")
    
    # Test Firestore connection
    print("\n3. Testing Firestore connection...")
    db = firestore.client()
    print("   ✅ Firestore client created successfully!")
    
    # Get project info
    print("\n4. Firebase Project Info:")
    print(f"   📋 Project ID: {firebase_admin.get_app().project_id}")
    
    # Try to read from a collection (will create if doesn't exist)
    print("\n5. Testing database read/write...")
    test_ref = db.collection('_test').document('connection_test')
    test_ref.set({
        'status': 'connected',
        'timestamp': firestore.SERVER_TIMESTAMP,
        'message': 'Firebase is working!'
    })
    print("   ✅ Write test successful!")
    
    # Read back
    doc = test_ref.get()
    if doc.exists:
        print("   ✅ Read test successful!")
        print(f"   📄 Data: {doc.to_dict()}")
    
    # Clean up test document
    test_ref.delete()
    print("   ✅ Test document cleaned up!")
    
    print("\n" + "=" * 60)
    print("🎉 ALL TESTS PASSED! Firebase is ready to use!")
    print("=" * 60)
    
except Exception as e:
    print(f"   ❌ Error: {str(e)}")
    print("\n" + "=" * 60)
    print("❌ FIREBASE TEST FAILED!")
    print("=" * 60)
    exit(1)
