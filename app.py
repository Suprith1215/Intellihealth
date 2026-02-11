from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import numpy as np
import pandas as pd
import json

from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score

import google.generativeai as genai
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path='.env.local')
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

app = Flask(__name__)
CORS(app)

# =========================
# GEMINI API SETUP
# =========================
gemini_available = False
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyCy8-vaDCyI1ocLgAEzVVUu-dld3zgSOnc')

try:
    genai.configure(api_key=GEMINI_API_KEY)
    # Test the configuration
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    print("✅ Gemini API configured successfully!")
    gemini_available = True
except Exception as e:
    print(f"⚠️ Warning: Could not configure Gemini API: {e}")
    model = None

# =========================
# BASE MODEL
# =========================
np.random.seed(42)
X_base = np.random.randint(0, 10, (1000, 5))
y_base = (X_base[:, 2] + X_base[:, 3] > 10).astype(int)

base_model = GradientBoostingClassifier(n_estimators=150)
base_model.fit(X_base, y_base)

# =========================
# UI TEMPLATE (SINGLE SOURCE)
# =========================
UPLOAD_HTML = """
<!DOCTYPE html>
<html>
<head>
<title>IntelliHeal – Evaluation Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
body { font-family: Arial; background:#f4f6f9; padding:40px; }
.card { background:white; padding:30px; border-radius:12px; max-width:1100px; margin:auto; }
.metrics { display:flex; gap:15px; flex-wrap:wrap; }
.metric { background:#ecf0f1; padding:15px; border-radius:10px; text-align:center; flex:1; }
.chart-row { display:flex; gap:40px; margin-top:40px; flex-wrap:wrap; justify-content:center; }
canvas { max-width:420px; }
button { padding:12px 24px; background:#3498db; color:white; border:none; border-radius:6px; }
</style>
</head>

<body>
<div class="card">
<h2>Upload Real Dataset (CSV)</h2>

<form method="post" enctype="multipart/form-data">
<input type="file" name="file" accept=".csv" required><br><br>
<button type="submit">Upload & Evaluate</button>
</form>

{% if metrics %}
<hr>

<div class="metrics">
  <div class="metric"><b>Accuracy</b><br>{{metrics.accuracy}}</div>
  <div class="metric"><b>F1</b><br>{{metrics.f1}}</div>
  <div class="metric"><b>ROC-AUC</b><br>{{metrics.roc}}</div>
  <div class="metric"><b>CV Accuracy</b><br>{{metrics.cv_acc}}</div>
  <div class="metric"><b>CV F1</b><br>{{metrics.cv_f1}}</div>
</div>

<div class="chart-row">
  <canvas id="barChart"></canvas>
  <canvas id="metricsPie"></canvas>
</div>

<div class="chart-row">
  <canvas id="featurePie"></canvas>
</div>

<script>
const metricsData = {{ metrics_list | safe }};
const labels = ["Accuracy","F1","ROC-AUC","CV Accuracy","CV F1"];

new Chart(document.getElementById("barChart"), {
  type: "bar",
  data: {
    labels: labels,
    datasets: [{
      data: metricsData,
      backgroundColor: "#3498db"
    }]
  }
});

new Chart(document.getElementById("metricsPie"), {
  type: "pie",
  data: {
    labels: labels,
    datasets: [{ data: metricsData }]
  }
});

new Chart(document.getElementById("featurePie"), {
  type: "pie",
  data: {
    labels: {{ feature_labels | safe }},
    datasets: [{ data: {{ feature_importance | safe }} }]
  }
});
</script>

{% endif %}
</div>
</body>
</html>
"""

# =========================
# ROUTES
# =========================
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "Server is running"}), 200

@app.route("/")
def home():
    return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IntelliHealth - AI-Powered Recovery</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">IntelliHealth</h1>
            <p class="text-gray-600">Your AI-powered recovery companion</p>
        </header>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold mb-4">User Metrics</h3>
                <div id="metrics" class="space-y-2">
                    <p>Loading metrics...</p>
                </div>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold mb-4">Upload Dataset</h3>
                <form id="uploadForm" enctype="multipart/form-data">
                    <input type="file" name="file" accept=".csv" class="mb-4" required>
                    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Upload & Analyze
                    </button>
                </form>
                <div id="results" class="mt-4 hidden">
                    <h4 class="font-semibold">Analysis Results:</h4>
                    <div id="metrics-results"></div>
                </div>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold mb-4">Quick Actions</h3>
                <button onclick="getMetrics()" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-2 w-full">
                    Refresh Metrics
                </button>
                <a href="/upload" class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 inline-block w-full text-center">
                    Full Dashboard
                </a>
            </div>
        </div>
    </div>

    <script>
        async function getMetrics() {
            try {
                const response = await fetch('/api/metrics');
                const data = await response.json();
                document.getElementById('metrics').innerHTML = `
                    <p><strong>Sober Days:</strong> ${data.sober_days}</p>
                    <p><strong>Current Streak:</strong> ${data.current_streak} days</p>
                    <p><strong>Total Points:</strong> ${data.total_points}</p>
                    <p><strong>Relapse Probability:</strong> ${data.relapse_probability}%</p>
                `;
            } catch (error) {
                document.getElementById('metrics').innerHTML = '<p class="text-red-500">Error loading metrics</p>';
            }
        }

        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                const html = await response.text();
                
                // Extract metrics from HTML (simple parsing)
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const metricsDiv = doc.querySelector('.metrics');
                
                if (metricsDiv) {
                    document.getElementById('results').classList.remove('hidden');
                    document.getElementById('metrics-results').innerHTML = metricsDiv.innerHTML;
                }
            } catch (error) {
                alert('Error uploading file');
            }
        });

        // Load metrics on page load
        getMetrics();
    </script>
</body>
</html>
"""

@app.route("/api/upload", methods=["POST"])
def api_upload():
    df = pd.read_csv(request.files["file"])

    X = df.iloc[:, :-1].apply(pd.to_numeric, errors="coerce").fillna(0)
    y = pd.to_numeric(df.iloc[:, -1], errors="coerce").fillna(0)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    model = GradientBoostingClassifier(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=3,
        random_state=42
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:,1]

    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred),2),
        "f1": round(f1_score(y_test, y_pred),2),
        "roc": round(roc_auc_score(y_test, y_prob),2)
    }

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    metrics["cv_acc"] = round(cross_val_score(model,X,y,cv=cv,scoring="accuracy").mean(),2)
    metrics["cv_f1"] = round(cross_val_score(model,X,y,cv=cv,scoring="f1").mean(),2)

    return jsonify({
        "metrics": metrics,
        "metrics_list": list(metrics.values()),
        "feature_importance": model.feature_importances_.tolist(),
        "feature_labels": [f"Feature {i+1}" for i in range(X.shape[1])]
    })

def get_intelligent_fallback(message: str, language: str) -> str:
    """
    Provide intelligent, helpful responses based on message content
    Works even when Gemini API fails
    Supports Telugu, Hindi, Tamil, and English
    """
    message_lower = message.lower()
    
    # Multilingual responses dictionary
    responses = {
        # General greeting
        'greeting': {
            'en-US': "Hello! I'm here to support your recovery journey. I can help with: managing cravings, stress relief, sleep tips, motivation, mindfulness, and more. What would you like to talk about today? 😊",
            'te-IN': "నమస్కారం! మీ రికవరీ ప్రయాణంలో మీకు సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను. నేను సహాయం చేయగలను: కోరికలను నిర్వహించడం, ఒత్తిడి తగ్గింపు, నిద్ర చిట్కాలు, ప్రేరణ, మైండ్‌ఫుల్‌నెస్ మరియు మరిన్ని. ఈరోజు మీరు దేని గురించి మాట్లాడాలనుకుంటున్నారు? 😊",
            'hi-IN': "नमस्ते! मैं आपकी रिकवरी यात्रा में सहायता के लिए यहां हूं। मैं मदद कर सकता हूं: cravings प्रबंधन, तनाव राहत, नींद टिप्स, प्रेरणा, माइंडफुलनेस और अधिक। आज आप किस बारे में बात करना चाहेंगे? 😊",
            'ta-IN': "வணக்கம்! உங்கள் மீட்பு பயணத்தில் உங்களுக்கு உதவ நான் இங்கே இருக்கிறேன். நான் உதவ முடியும்: ஆசைகளை நிர்வகித்தல், மன அழுத்தம் நிவாரணம், தூக்க உதவிக்குறிப்புகள், ஊக்கம், நினைவாற்றல் மற்றும் பல. இன்று நீங்கள் எதைப் பற்றி பேச விரும்புகிறீர்கள்? �"
        },
        # Stress & Anxiety
        'stress': {
            'en-US': "Try the 4-4-4 breathing technique: Inhale for 4 counts, hold for 4, exhale for 4. This activates your parasympathetic nervous system and reduces stress. You're doing great by reaching out! 🌟",
            'te-IN': "4-4-4 శ్వాస సాంకేతికతను ప్రయత్నించండి: 4 లెక్కలకు ఊపిరి పీల్చుకోండి, 4 లెక్కలు పట్టుకోండి, 4 లెక్కలకు వదలండి. ఇది మీ పారాసింపథెటిక్ నాడీ వ్యవస్థను సక్రియం చేస్తుంది మరియు ఒత్తిడిని తగ్గిస్తుంది. మీరు చేరుకోవడం ద్వారా గొప్పగా చేస్తున్నారు! 🌟",
            'hi-IN': "4-4-4 श्वास तकनीक आज़माएं: 4 गिनती के लिए सांस लें, 4 के लिए रोकें, 4 के लिए छोड़ें। यह आपकी पैरासिम्पेथेटिक तंत्रिका तंत्र को सक्रिय करता है और तनाव कम करता है। आप पहुंच कर बहुत अच्छा कर रहे हैं! 🌟",
            'ta-IN': "4-4-4 சுவாச நுட்பத்தை முயற்சிக்கவும்: 4 எண்ணிக்கைக்கு மூச்சை உள்ளிழுக்கவும், 4க்கு பிடிக்கவும், 4க்கு வெளியேற்றவும். இது உங்கள் பாராசிம்பதெடிக் நரம்பு மண்டலத்தை செயல்படுத்துகிறது மற்றும் மன அழுத்தத்தை குறைக்கிறது. நீங்கள் அருமையாக செய்கிறீர்கள்! 🌟"
        },
        # Cravings
        'craving': {
            'en-US': "Cravings are temporary and will pass. Try the HALT method: Are you Hungry, Angry, Lonely, or Tired? Address these basic needs first. Take deep breaths, call a friend, or go for a walk. You've got this! 💪",
            'te-IN': "కోరికలు తాత్కాలికమైనవి మరియు గడిచిపోతాయి. HALT పద్ధతిని ప్రయత్నించండి: మీరు ఆకలిగా, కోపంగా, ఒంటరిగా లేదా అలసిపోయారా? ముందుగా ఈ ప్రాథమిక అవసరాలను తీర్చండి. లోతైన శ్వాసలు తీసుకోండి, స్నేహితుడికి కాల్ చేయండి లేదా నడవండి. మీరు దీన్ని పొందారు! 💪",
            'hi-IN': "Cravings अस्थायी हैं और गुजर जाएंगी। HALT विधि आज़माएं: क्या आप भूखे, गुस्से में, अकेले या थके हुए हैं? पहले इन बुनियादी जरूरतों को पूरा करें। गहरी सांस लें, किसी दोस्त को कॉल करें या टहलने जाएं। आप यह कर सकते हैं! 💪",
            'ta-IN': "ஆசைகள் தற்காலிகமானவை மற்றும் கடந்து செல்லும். HALT முறையை முயற்சிக்கவும்: நீங்கள் பசியாக, கோபமாக, தனிமையாக அல்லது சோர்வாக இருக்கிறீர்களா? முதலில் இந்த அடிப்படை தேவைகளை நிவர்த்தி செய்யுங்கள். ஆழமான மூச்சு எடுங்கள், நண்பரை அழையுங்கள் அல்லது நடக்கச் செல்லுங்கள். உங்களால் முடியும்! 💪"
        },
        # Sleep
        'sleep': {
            'en-US': "Good sleep is crucial for recovery. Try: no screens 1 hour before bed, keep room cool (60-67°F), maintain consistent sleep schedule, avoid caffeine after 2pm. Your body will thank you! 😴",
            'te-IN': "మంచి నిద్ర రికవరీకి కీలకం. ప్రయత్నించండి: పడకటానికి 1 గంట ముందు స్క్రీన్‌లు లేవు, గదిని చల్లగా ఉంచండి, స్థిరమైన నిద్ర షెడ్యూల్‌ను నిర్వహించండి, మధ్యాహ్నం 2 తర్వాత కెఫీన్‌ను నివారించండి. మీ శరీరం మీకు ధన్యవాదాలు చెబుతుంది! 😴",
            'hi-IN': "अच्छी नींद रिकवरी के लिए महत्वपूर्ण है। प्रयास करें: सोने से 1 घंटे पहले कोई स्क्रीन नहीं, कमरे को ठंडा रखें, नियमित नींद कार्यक्रम बनाए रखें, दोपहर 2 बजे के बाद कैफीन से बचें। आपका शरीर आपको धन्यवाद देगा! 😴",
            'ta-IN': "நல்ல தூக்கம் மீட்புக்கு முக்கியமானது. முயற்சிக்கவும்: படுக்கைக்கு 1 மணி நேரத்திற்கு முன் திரைகள் இல்லை, அறையை குளிர்ச்சியாக வைத்திருங்கள், நிலையான தூக்க அட்டவணையை பராமரிக்கவும், மதியம் 2 மணிக்கு பிறகு காஃபினை தவிர்க்கவும். உங்கள் உடல் நன்றி கூறும்! 😴"
        },
        # Default
        'default': {
            'en-US': "I'm here to support you on your recovery journey. I can help with cravings, stress management, sleep, motivation, and wellness tips. What's on your mind today? 💙",
            'te-IN': "మీ రికవరీ ప్రయాణంలో మీకు మద్దతు ఇవ్వడానికి నేను ఇక్కడ ఉన్నాను. నేను కోరికలు, ఒత్తిడి నిర్వహణ, నిద్ర, ప్రేరణ మరియు వెల్నెస్ చిట్కాలతో సహాయం చేయగలను. ఈరోజు మీ మనసులో ఏమి ఉంది? 💙",
            'hi-IN': "मैं आपकी रिकवरी यात्रा में आपका समर्थन करने के लिए यहां हूं। मैं cravings, तनाव प्रबंधन, नींद, प्रेरणा और wellness टिप्स में मदद कर सकता हूं। आज आपके मन में क्या है? 💙",
            'ta-IN': "உங்கள் மீட்பு பயணத்தில் உங்களுக்கு ஆதரவளிக்க நான் இங்கே இருக்கிறேன். ஆசைகள், மன அழுத்த மேலாண்மை, தூக்கம், ஊக்கம் மற்றும் ஆரோக்கிய உதவிக்குறிப்புகளில் என்னால் உதவ முடியும். இன்று உங்கள் மனதில் என்ன இருக்கிறது? 💙"
        }
    }
    
    # Determine which response category to use
    response_key = 'default'
    
    if any(word in message_lower for word in ['hi', 'hello', 'hey', 'help', 'support', 'talk', 'ఎలా', 'నమస్కారం', 'హలో']):
        response_key = 'greeting'
    elif any(word in message_lower for word in ['stress', 'anxiety', 'anxious', 'worried', 'panic', 'ఒత్తిడి', 'चिंता', 'கவலை']):
        response_key = 'stress'
    elif any(word in message_lower for word in ['angry', 'anger', 'mad', 'frustrated', 'irritated', 'blood boiling', 'కోపం', 'கோபம்']):
        response_key = 'stress' # Anger is handled under stress/emotion regulation
    elif any(word in message_lower for word in ['craving', 'urge', 'temptation', 'addiction', 'smoke', 'drink', 'కోరిక', 'लालसा', 'ஆசை']):
        response_key = 'craving'
    elif any(word in message_lower for word in ['sleep', 'insomnia', 'tired', 'exhausted', 'నిద్ర', 'नींद', 'தூக்கம்']):
        response_key = 'sleep'
    
    # Get response in the appropriate language
    lang_code = language if language in ['en-US', 'te-IN', 'hi-IN', 'ta-IN'] else 'en-US'
    return responses[response_key].get(lang_code, responses[response_key]['en-US'])


@app.route("/api/chat", methods=["POST"])
def chat():
    """Chatbot endpoint - Uses Gemini API directly"""
    try:
        if not gemini_available:
            # Try to re-configure if key is available
            if GEMINI_API_KEY:
                genai.configure(api_key=GEMINI_API_KEY)
            else:
                return jsonify({
                    "error": "Gemini API not available. Please check configuration."
                }), 500
        
        data = request.json
        user_message = data.get("message", "")
        user_language = data.get("language", "en-US")
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        print(f"📨 Received message: {user_message[:50]}...")
        
        print(f"📍 Initial language: {user_language}")
        
        # Automatic language detection (like Google Translate)
        try:
            from langdetect import detect, LangDetectException
            
            # Try to detect the language from the message
            try:
                detected_lang_code = detect(user_message)
                print(f"🔍 Detected language code: {detected_lang_code}")
                
                # Map detected language to our format
                lang_map = {
                    'te': 'te-IN',  # Telugu
                    'hi': 'hi-IN',  # Hindi
                    'ta': 'ta-IN',  # Tamil
                    'en': 'en-US',  # English
                    'es': 'es-ES',  # Spanish
                    'fr': 'fr-FR',  # French
                    'de': 'de-DE',  # German
                    'it': 'it-IT',  # Italian
                    'pt': 'pt-BR',  # Portuguese
                    'ru': 'ru-RU',  # Russian
                    'ja': 'ja-JP',  # Japanese
                    'ko': 'ko-KR',  # Korean
                    'zh-cn': 'zh-CN',  # Chinese
                    'ar': 'ar-SA',  # Arabic
                }
                
                if detected_lang_code in lang_map:
                    user_language = lang_map[detected_lang_code]
                    print(f"✅ Auto-detected language: {user_language}")
                    
            except LangDetectException as e:
                print(f"⚠️ Language detection failed: {e}, using default")
                
        except ImportError:
            print("⚠️ langdetect not installed, using manual detection")
        
        # Detect if user is requesting a specific language (manual override)
        message_lower = user_message.lower()
        
        # Check for Telugu language requests
        if any(keyword in message_lower for keyword in ['telugu', 'telgu', 'తెలుగు', 'talk in telugu', 'speak telugu', 'respond in telugu']):
            user_language = 'te-IN'
            print(f"🌍 Manual language request: Switching to Telugu")
        
        # Check for Hindi language requests
        elif any(keyword in message_lower for keyword in ['hindi', 'हिन्दी', 'talk in hindi', 'speak hindi', 'respond in hindi']):
            user_language = 'hi-IN'
            print(f"🌍 Manual language request: Switching to Hindi")
        
        # Check for Tamil language requests
        elif any(keyword in message_lower for keyword in ['tamil', 'தமிழ்', 'talk in tamil', 'speak tamil', 'respond in tamil']):
            user_language = 'ta-IN'
            print(f"🌍 Manual language request: Switching to Tamil")
        
        print(f"🎯 Final language: {user_language}")
        
        # Create health-focused system prompt
        language_instruction = get_language_instruction(user_language)
        
        # ... (System prompt code omitted for brevity) ...

        system_prompt = f"""You are Shalini, a warm and caring female health assistant specializing in addiction recovery, mental wellness, and holistic health support. 

{language_instruction}

Your personality:
- You are Shalini - a compassionate, intelligent, and supportive friend
- You speak naturally and conversationally
- You are empathetic, understanding, and non-judgmental

Your role:
- Provide empathetic, evidence-based guidance
- Offer practical coping strategies
- Support users through their recovery journey
- Be natural and human-like in your responses"""
        
        # Create the chat with Gemini with safety settings
        # Using gemini-pro (stable) which is most reliable
        try:
            chat_model = genai.GenerativeModel(
                'gemini-pro',
                generation_config={
                    'temperature': 0.7,
                    'top_p': 0.95,
                    'top_k': 40,
                    'max_output_tokens': 500, # Increased for better answers
                },
                safety_settings={
                    'HARM_CATEGORY_HARASSMENT': 'BLOCK_NONE',
                    'HARM_CATEGORY_HATE_SPEECH': 'BLOCK_NONE',
                    'HARM_CATEGORY_SEXUALLY_EXPLICIT': 'BLOCK_NONE',
                    'HARM_CATEGORY_DANGEROUS_CONTENT': 'BLOCK_NONE',
                }
            )
        except Exception as model_error:
            print(f"❌ Model creation error: {model_error}")
            # Use fallback model
            chat_model = genai.GenerativeModel('gemini-pro')
        
        # Combine system prompt with user message
        full_prompt = f"{system_prompt}\n\nUser: {user_message}\n\nAssistant:"
        
        print(f"🤖 Calling Gemini API...")
        print(f"📝 Prompt length: {len(full_prompt)} characters")
        
        try:
            response = chat_model.generate_content(full_prompt)
            
            print(f"✅ Gemini API responded")
            print(f"📊 Response object: {type(response)}")
            
            # Check if response was blocked
            if hasattr(response, 'prompt_feedback'):
                print(f"🔍 Prompt feedback: {response.prompt_feedback}")
                if hasattr(response.prompt_feedback, 'block_reason') and response.prompt_feedback.block_reason:
                    print(f"❌ Response blocked: {response.prompt_feedback.block_reason}")
                    bot_response = "I'm here to support you. Let me help you with recovery strategies and wellness tips. What specific area would you like to focus on?"
                else:
                    print(f"✅ No blocking detected")
            
            # Check if response has text
            if hasattr(response, 'text'):
                if response.text:
                    bot_response = response.text.strip()
                    print(f"✅ Got response text: {bot_response[:100]}...")
                else:
                    print(f"⚠️ Response.text is empty")
                    bot_response = "I'm here to support you on your recovery journey. Could you tell me more about how you're feeling today?"
            elif hasattr(response, 'parts'):
                print(f"📦 Response has parts: {len(response.parts)}")
                if response.parts:
                    bot_response = ''.join([part.text for part in response.parts if hasattr(part, 'text')])
                    print(f"✅ Got response from parts: {bot_response[:100]}...")
                else:
                    print(f"⚠️ Response.parts is empty")
                    bot_response = "I'm here to support you on your recovery journey. Could you tell me more about how you're feeling today?"
            else:
                print(f"❌ Response has no text or parts attribute")
                print(f"🔍 Response attributes: {dir(response)}")
                # Use intelligent fallback instead of generic message
                bot_response = get_intelligent_fallback(user_message, user_language)
                
        except Exception as gen_error:
            print(f"❌ Generation error: {type(gen_error).__name__}: {gen_error}")
            import traceback
            traceback.print_exc()
            
            # Use intelligent fallback instead of generic message
            bot_response = get_intelligent_fallback(user_message, user_language)
        
        print(f"📤 Sending response: {bot_response[:100]}...")
        
        return jsonify({
            "text": bot_response,
            "model": "gemini-2.0-flash-exp",
            "language": user_language
        })
        
    except Exception as e:
        print(f"Chat error: {e}")
        import traceback
        traceback.print_exc()
        
        # Provide a helpful fallback response
        fallback_response = "I'm here to help you with your recovery journey. While I'm experiencing a technical issue, please know that you're not alone. If you're in crisis, please reach out to a mental health professional or call a crisis hotline."
        
        return jsonify({
            "error": str(e),
            "text": fallback_response
        }), 200  # Return 200 so the UI can still show the fallback message

def get_language_instruction(language_code: str) -> str:
    """Get language-specific instruction for the AI"""
    language_map = {
        'te-IN': 'You MUST respond ONLY in Telugu (తెలుగు). Write your entire response using Telugu script. Use proper Telugu grammar and vocabulary. Do NOT use English or Roman script.',
        'hi-IN': 'You MUST respond ONLY in Hindi (हिन्दी). Write your entire response using Devanagari script. Use proper Hindi grammar and vocabulary. Do NOT use English or Roman script.',
        'ta-IN': 'You MUST respond ONLY in Tamil (தமிழ்). Write your entire response using Tamil script. Use proper Tamil grammar and vocabulary. Do NOT use English or Roman script.',
        'en-US': 'Respond in English.',
        'es-ES': 'Respond in Spanish (Español).',
        'fr-FR': 'Respond in French (Français).',
        'de-DE': 'Respond in German (Deutsch).',
        'it-IT': 'Respond in Italian (Italiano).',
        'pt-BR': 'Respond in Portuguese (Português).',
        'ru-RU': 'Respond in Russian (Русский).',
        'ja-JP': 'Respond in Japanese (日本語).',
        'ko-KR': 'Respond in Korean (한국어).',
        'zh-CN': 'Respond in Chinese (中文).',
        'ar-SA': 'Respond in Arabic (العربية).'
    }
    
    return language_map.get(language_code, 'Respond in English.')

if __name__ == "__main__":
    app.run(debug=False, port=5000)
