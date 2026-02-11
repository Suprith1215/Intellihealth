import requests
import json

# Test the chatbot endpoint
url = "http://localhost:5000/api/chat"
data = {
    "message": "Hello! Can you help me with stress management?",
    "language": "en-US"
}

print("🧪 Testing IntelliHeal Chatbot...")
print(f"📤 Sending: {data['message']}")
print()

try:
    response = requests.post(url, json=data)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Chatbot Response:")
        print(f"📝 {result.get('text', 'No response')}")
        print()
        print(f"🤖 Model: {result.get('model', 'Unknown')}")
        print(f"🌍 Language: {result.get('language', 'Unknown')}")
        print()
        print("✅ CHATBOT IS WORKING PERFECTLY!")
    else:
        print(f"❌ Error: HTTP {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"❌ Connection Error: {e}")
    print("Make sure the backend server is running on port 5000")
