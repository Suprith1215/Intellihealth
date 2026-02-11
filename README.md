# IntelliHeal — AI-Based Addiction Recovery & Relapse Prevention System

## Overview

**IntelliHeal** is an intelligent health-support platform designed to assist individuals undergoing addiction recovery through predictive analytics, behavioral monitoring, and emotional assessment.
The system combines machine learning, natural language processing, and time-series forecasting to analyze user patterns and provide personalized recovery insights.

The platform aims to support early relapse detection, improve self-awareness, and promote healthier behavioral habits using data-driven intervention strategies.

---

## Key Features

### Predictive Relapse Risk Analysis

* Uses behavioral indicators such as mood, stress, sleep, and cravings
* Machine learning models including:

  * Random Forest
  * Logistic Regression
  * Decision Tree
  * Gradient Boosting
* Provides probability-based risk classification

### Emotional Journal Intelligence

* Sentiment analysis powered by **TextBlob**
* Detects emotional instability through journal entries
* Correlates emotional trends with relapse likelihood

### Craving Trend Forecasting

* Time-series modeling using **ARIMA**
* Predicts future craving patterns
* Enables proactive recovery planning

### Music-Based Mood Support

* Intelligent playlist suggestions
* Includes motivational, devotional, and calming audio options
* Designed to improve emotional stability

### Interactive Recovery Dashboard

* Progress tracking
* Behavioral visualizations
* Risk-level comparison charts
* Feature importance insights

### Gamified Engagement Module

* Story-driven recovery game mechanics
* Encourages positive habit reinforcement
* Links recovery actions to in-game progression

### Therapist / Developer Tools

* Explainable risk visualization
* Dataset evaluation
* Model validation utilities

---

## Technology Stack

### Frontend

* React + TypeScript
* Vite
* Custom UI Components
* Three-dimensional visual elements

### Backend

* Python (Flask)
* REST-based services
* Data processing pipelines

### Machine Learning & Analytics

* Scikit-learn
* Statsmodels
* NumPy
* Pandas

### NLP

* TextBlob

### Visualization

* Chart.js
* Interactive dashboards

---

## Project Structure

```
components/        UI modules and features
services/          ML and backend logic
contexts/          Application state management
styles/            Theme and design assets
dataset/           Behavioral data samples
app.py             Backend entry point
```

---

## Installation & Setup

### Clone Repository

```
git clone https://github.com/YOUR_USERNAME/Intellihealth.git
cd Intellihealth
```

### Install Dependencies

Frontend

```
npm install
```

Backend

```
pip install -r requirements.txt
```

### Run Application

Frontend

```
npm run dev
```

Backend

```
python app.py
```

---

## Research Contributions

* Integrated behavioral prediction with emotional intelligence
* Combined ML, NLP, and forecasting in a single recovery pipeline
* Demonstrated explainable AI for mental-health support systems
* Developed an interactive deployment-ready prototype

---

## Future Enhancements

* Wearable device integration
* Real-time physiological monitoring
* Adaptive reinforcement learning interventions
* Mobile application deployment
* Clinical dataset validation
* Secure multi-user authentication system

---

## Author

**Thati Sai Suprith**
Artificial Intelligence & Machine Learning
Project: IntelliHeal — Intelligent Recovery Support System

---

## License

This project is developed for academic and research purposes.
Usage and modification permitted with attribution.

---

## Acknowledgment

This project explores the intersection of artificial intelligence and healthcare support systems, aiming to demonstrate how intelligent technologies can enhance behavioral monitoring and recovery guidance.
