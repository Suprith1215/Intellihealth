# 🏥 IntelliHeal - AI-Powered Addiction Recovery & Relapse Prevention System

<div align="center">
  <img width="1200" height="475" alt="IntelliHeal Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" style="border-radius: 12px; margin-bottom: 20px;" />
  <p><em>A medical-grade, AI-based addiction recovery platform utilizing Machine Learning, Natural Language Processing, and Time-Series Analytics for personalized behavioral monitoring and predictive relapse prevention.</em></p>
</div>

---

## 🎯 Overview

**IntelliHeal** is a professional, high-end healthcare application designed to support individuals in their journey towards long-term sobriety. By combining clinical psychology models (like CBT and recovery tracking) with modern AI tools, IntelliHeal offers a supportive, state-of-the-art companion that monitors mental health, tracks relapse triggers, analyzes journal sentiment, and provides immediate therapeutic interventions.

---

## ✨ Features & Architecture

### 🛡️ Clinical & Risk Monitoring
* **Explainable AI Risk Engine**: Utilizes custom machine learning and clinical heuristic calculations to categorize relapse risk levels (Low, Moderate, High, Critical) with clear, actionable rationale.
* **Biometric & Behavioral Time-Series Tracking**: Monitors metrics like sleep quality, stress levels, cravings, and social engagement using interactive glassmorphism dashboards.
* **Onboarding & Clinical Survey**: Custom medical survey integrated with clinically-validated questionnaires and beautiful progress tracking.

### 💬 Intelligent AI Companion
* **Multimodal Copilot**: Interactive 3D chatbot equipped to analyze text, images, and audio. It supports multilingual capabilities, including automated English and **Telugu voice guides** and automated language switching.
* **Sentiment & NLP Analytics**: Analyzes emotional state from text and journal entries, generating real-time mood timelines and tracking progression.
* **Audio Interventions**: Provides breathing exercises, calming ambient soundscapes, and AI-driven audio guides based on current craving levels.

### 🎨 Medical-Grade UI/UX Design System
* **Premium Glassmorphism**: Stunning backdrop filters, high-fidelity dark glass panels, and cyber-grid layers that create a premium feel.
* **Dual Theme Engine**: Seamless, persistent **Light/Dark Mode** tailored with specialized clinical color theory (Sky Blue/Teal for trust, calming HSL scales, and precise warning colors).
* **Micro-Animations & 3D Cards**: Smooth hover translations (`card-3d`), shimmers, glow borders, and SVG progress rings.

---

## 🚀 Technical Stack

### Frontend (React & TypeScript)
* **Core**: React 18, TypeScript, Tailwind CSS
* **Build System**: Vite
* **State & Theme**: React Context API
* **Icons & UI**: Lucide Icons, Custom SVG Components

### Backend (Python)
* **Core**: Flask, Python 3.10+
* **AI & NLP**: Gemini API (via `google-generativeai`), Custom Sentiment Heuristics
* **Task Automation**: Powers audio downloading (`download_videos.py`), custom script integrations, and automated weekly summary generation.

---

## ⚙️ Running Locally

### 1. Prerequisites
* **Node.js** (v18+)
* **Python** (v3.10+)

### 2. Frontend Setup
```bash
# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

### 3. Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install Python requirements
pip install -r requirements.txt

# Run the Flask backend
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

<div align="center">
  <p>Built with 🩵 to make addiction recovery more accessible, data-driven, and supportive.</p>
</div>
