
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

api_key = os.getenv('GEMINI_API_KEY')
print(f"API Key present: {bool(api_key)}")

genai.configure(api_key=api_key)

models_to_try = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro']

for model_name in models_to_try:
    print(f"\n--- Testing {model_name} ---")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Explain how to manage anger in one sentence.")
        print(f"✅ Success! Response: {response.text}")
        break # Stop if one works
    except Exception as e:
        print(f"❌ Failed: {e}")
