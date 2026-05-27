# 🏥 IntelliHeal — AI-Based Addiction Recovery & Relapse Prevention System

<div align="center">
  <img width="1200" height="475" alt="IntelliHeal Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" style="border-radius: 12px; margin-bottom: 20px;" />
  <p><em>A medical-grade, AI-based addiction recovery platform utilizing Machine Learning, Natural Language Processing, and Time-Series Analytics for personalized behavioral monitoring and predictive relapse prevention.</em></p>
</div>

---

## 🎯 Overview

**IntelliHeal** is an intelligent health-support platform designed to assist individuals undergoing addiction recovery through predictive analytics, behavioral monitoring, and emotional assessment. 

By combining clinical psychology models (like CBT and recovery tracking) with modern AI tools, IntelliHeal offers a supportive, state-of-the-art companion that monitors mental health, tracks relapse triggers, analyzes journal sentiment, and provides immediate therapeutic interventions.

The platform aims to support early relapse detection, improve self-awareness, and promote healthier behavioral habits using data-driven intervention strategies.

---

## ✨ Features & Architecture

### 🛡️ Predictive Relapse Risk Analysis
* **Explainable AI Risk Engine**: Utilizes custom machine learning and clinical heuristic calculations to categorize relapse risk levels (Low, Moderate, High, Critical) with clear, actionable rationale.
* **Machine Learning Classifiers**: Integrates models including:
  * **Random Forest**
  * **Logistic Regression**
  * **Decision Tree**
  * **Gradient Boosting**
* Provides probability-based risk classification and feature importance insights.
* **Biometric & Behavioral Time-Series Tracking**: Monitors metrics like sleep quality, stress levels, cravings, and social engagement using interactive dashboards.

### 🧠 Emotional Journal Intelligence & Forecasting
* **NLP Sentiment Analysis**: Powered by **TextBlob** to analyze emotional instability from text and journal entries, generating real-time mood timelines.
* **Craving Trend Forecasting**: Uses **ARIMA** time-series modeling to predict future craving patterns, enabling proactive recovery planning.

### 💬 Intelligent Multimodal Copilot
* **AI Chatbot Companion**: Equipped to analyze text, images, and audio. It supports multilingual capabilities, including automated English and **Telugu voice guides** with automated language switching.
* **Music-Based Mood Support**: Intelligent playlist suggestions including motivational, devotional, and calming audio options designed to improve emotional stability.
* **Audio Interventions**: Provides breathing exercises, calming ambient soundscapes, and AI-driven audio guides based on current craving levels.

### 🎮 Gamified Engagement Module
* **Story-Driven Recovery Game**: Aegis-themed RPG mechanics designed to reinforce positive habits.
* Links real-world recovery actions (sleep, exercise, hydration, journaling) directly to in-game character progression.

### 🎨 Medical-Grade UI/UX Design System
* **Premium Glassmorphism**: Stunning backdrop filters, high-fidelity dark glass panels, and cyber-grid layers.
* **Dual Theme Engine**: Seamless, persistent **Light/Dark Mode** tailored with specialized clinical color theory (Sky Blue/Teal for trust, calming HSL scales, and precise warning colors).
* **Micro-Animations & 3D Cards**: Smooth hover translations (`card-3d`), shimmers, glow borders, and SVG progress rings.

---

## ⚙️ Running Locally

### 1. Prerequisites
* **Node.js** (v18+)
* **Python** (v3.10+)

### 2. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Suprith1215/Intellihealth.git
cd Intellihealth

# Install Frontend dependencies
npm install

# Install Backend dependencies
pip install -r requirements.txt
```

### 3. Run the Application

#### Frontend (Vite)
```bash
npm run dev
```

#### Backend (Flask)
```bash
python app.py
```

### 4. Configuration
Create a `.env.local` file in the root directory and add your keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5173
```

---

## 📅 Weekly Reports & Verification
* Detailed weekly summaries and exercise therapy guides are integrated directly within the platform.
* To verify exercise videos, refer to `EXERCISE_VIDEOS_VERIFICATION.md`.
* For audio and Telugu language guides, refer to `AUDIO_FIXED.md` and `TELUGU_LANGUAGE_SWITCHING.md`.

---

## 🔬 Research Contributions & Design Philosophy

* **Integrated Recovery Pipeline**: Merged behavioral prediction with emotional intelligence and forecasting in a single deployment-ready recovery prototype.
* **Clinical Color Psychology**: Uses Sky Blue/Teal for trust, Green for health, Amber for moderate risk, and Red for urgent clinical attention.
* **Explainable AI in Mental Health**: Designed to empower both recovery patients and healthcare professionals with clear, transparent insights.

---

## 🚀 Future Enhancements
* [ ] Wearable device integration (Fitbit, Apple Watch)
* [ ] Real-time physiological monitoring (heart rate, HRV)
* [ ] Adaptive reinforcement learning interventions
* [ ] Mobile application deployment (iOS/Android)
* [ ] Clinical dataset validation & secure multi-user authentication

---

## 👨‍💻 Author

**Thati Sai Suprith**  
Artificial Intelligence & Machine Learning  
*Project: IntelliHeal — Intelligent Recovery Support System*

---

## 📄 License & Acknowledgment

This project is developed for academic and research purposes. Usage and modification are permitted with proper attribution. It explores the intersection of artificial intelligence and healthcare support systems to demonstrate how intelligent technologies can enhance behavioral monitoring and recovery guidance.
