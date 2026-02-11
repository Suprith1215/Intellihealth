import requests
import json
import time

print("=" * 60)
print("🧪 TESTING INTELLIHEAL CHATBOT CONNECTION")
print("=" * 60)
print()

# Test 1: Check if server is running
print("📡 Test 1: Checking server connection...")
try:
    response = requests.get("http://localhost:5000/", timeout=5)
    print(f"✅ Server is running! Status: {response.status_code}")
except Exception as e:
    print(f"❌ Server connection failed: {e}")
    print("⚠️  Make sure backend is running: python app.py")
    exit(1)

print()

# Test 2: Test English chatbot
print("📡 Test 2: Testing English chatbot...")
try:
    data = {
        "message": "How can I manage my cravings?",
        "language": "en-US"
    }
    response = requests.post("http://localhost:5000/api/chat", json=data, timeout=10)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ English Response:")
        print(f"   {result.get('text', 'No response')[:100]}...")
        print(f"   Model: {result.get('model', 'Unknown')}")
    else:
        print(f"❌ Error: HTTP {response.status_code}")
        print(f"   {response.text}")
except Exception as e:
    print(f"❌ Request failed: {e}")

print()

# Test 3: Test Telugu chatbot
print("📡 Test 3: Testing Telugu chatbot...")
try:
    data = {
        "message": "నాకు ఒత్తిడి నిర్వహణలో సహాయం చేయగలరా?",  # "Can you help me with stress management?" in Telugu
        "language": "te-IN"
    }
    response = requests.post("http://localhost:5000/api/chat", json=data, timeout=10)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Telugu Response:")
        print(f"   {result.get('text', 'No response')}")
        print(f"   Model: {result.get('model', 'Unknown')}")
        print(f"   Language: {result.get('language', 'Unknown')}")
    else:
        print(f"❌ Error: HTTP {response.status_code}")
        print(f"   {response.text}")
except Exception as e:
    print(f"❌ Request failed: {e}")

print()
print("=" * 60)
print("✅ ALL TESTS COMPLETED!")
print("=" * 60)
print()
print("🎯 Next Steps:")
print("   1. Open your browser to http://localhost:3000")
print("   2. Go to ChatBot section")
print("   3. Try typing in English or Telugu")
print("   4. Enable voice output to hear Telugu responses!")
print()
