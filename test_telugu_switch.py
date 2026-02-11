import requests
import json

print("=" * 70)
print("🧪 TESTING TELUGU LANGUAGE SWITCHING")
print("=" * 70)
print()

# Test: Ask in English to respond in Telugu
print("📡 Test: Asking 'talk to me in telugu'...")
print()

try:
    data = {
        "message": "talk to me in telugu",
        "language": "en-US"  # Starting with English
    }
    
    response = requests.post("http://localhost:5000/api/chat", json=data, timeout=15)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ SUCCESS! Bot Response:")
        print("-" * 70)
        print(result.get('text', 'No response'))
        print("-" * 70)
        print()
        print(f"📊 Response Details:")
        print(f"   Model: {result.get('model', 'Unknown')}")
        print(f"   Language: {result.get('language', 'Unknown')}")
        print()
        
        # Check if response contains Telugu script
        response_text = result.get('text', '')
        has_telugu = any('\u0C00' <= char <= '\u0C7F' for char in response_text)
        
        if has_telugu:
            print("✅ TELUGU SCRIPT DETECTED! 🎉")
            print("   The bot is now responding in Telugu!")
        else:
            print("⚠️  No Telugu script detected in response")
            print("   Response might still be in English")
        
    else:
        print(f"❌ Error: HTTP {response.status_code}")
        print(f"   {response.text}")
        
except Exception as e:
    print(f"❌ Request failed: {e}")

print()
print("=" * 70)
print("🎯 HOW TO USE IN THE APP:")
print("=" * 70)
print()
print("1. Open http://localhost:3000")
print("2. Go to ChatBot")
print("3. Type: 'talk to me in telugu'")
print("4. Bot will switch to Telugu!")
print("5. All future responses will be in Telugu")
print("6. Enable voice to hear Telugu speech!")
print()
print("Other commands you can try:")
print("  - 'speak in telugu'")
print("  - 'respond in telugu'")
print("  - 'talk in hindi'")
print("  - 'speak in tamil'")
print()
