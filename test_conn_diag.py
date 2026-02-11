
import requests
import json
import sys

def test_connection(url):
    print(f"Testing connection to {url}...")
    try:
        response = requests.post(
            url, 
            json={"message": "Hello", "language": "en-US"},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:100]}...")
        if response.status_code == 200:
            print("✅ SUCCESS")
            return True
        else:
            print("❌ FAILED (Status Code)")
            return False
    except Exception as e:
        print(f"❌ FAILED (Exception): {e}")
        return False

print("--- DIAGNOSTIC START ---")
success_local = test_connection("http://localhost:5000/api/chat")
success_ip = test_connection("http://127.0.0.1:5000/api/chat")
print("--- DIAGNOSTIC END ---")
