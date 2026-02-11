
export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  language?: string;
}

export const INITIAL_PROJECT_STRUCTURE: FileNode[] = [
  {
    name: 'backend',
    type: 'folder',
    children: [
      {
        name: 'app.py',
        type: 'file',
        language: 'python',
        content: `from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import numpy as np
import pandas as pd
import json

from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score

app = Flask(__name__)
CORS(app)

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
@app.route("/")
def home():
    return jsonify({"status":"running","message":"IntelliHeal backend live"})

@app.route("/upload", methods=["GET","POST"])
def upload():
    if request.method == "GET":
        return render_template_string(UPLOAD_HTML)

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

    return render_template_string(
        UPLOAD_HTML,
        metrics=metrics,
        metrics_list=json.dumps(list(metrics.values())),
        feature_importance=json.dumps(model.feature_importances_.tolist()),
        feature_labels=json.dumps([f"Feature {i+1}" for i in range(X.shape[1])])
    )

if __name__ == "__main__":
    app.run(debug=False)
`
      },
      {
        name: 'models',
        type: 'folder',
        children: [
          { name: 'relapse_rf.pkl', type: 'file', content: '[Binary Model Data]' },
          { name: 'sentiment_bert.bin', type: 'file', content: '[Binary NLP Weights]' }
        ]
      }
    ]
  },
  {
    name: 'frontend',
    type: 'folder',
    children: [
      {
        name: 'src',
        type: 'folder',
        children: [
          { name: 'App.tsx', type: 'file', language: 'typescript', content: '// Main Application Entry Point...' },
          { name: 'ChatBot.tsx', type: 'file', language: 'typescript', content: '// AI Powered Chatbot Component...' },
          { name: 'WellnessPlan.tsx', type: 'file', language: 'typescript', content: '// Adaptive Diet & Exercise Engine...' },
          { name: 'MLValidationLab.tsx', type: 'file', language: 'typescript', content: '// Model Training & Evaluation Dashboard...' },
          { name: 'types.ts', type: 'file', language: 'typescript', content: 'export interface UserProfile { ... }' }
        ]
      },
      { name: 'package.json', type: 'file', language: 'json', content: '{\n  "name": "addictive-care-frontend",\n  "version": "1.0.0"\n}' }
    ]
  },
  {
    name: 'README.md',
    type: 'file',
    language: 'markdown',
    content: `# AddictiveCare (IntelliHeal)

## AI-Powered Addiction Recovery Platform

This project uses a hybrid ML architecture combining Random Forest, K-Means, and NLP Transformers.

### Key Features
- Relapse Prediction
- 3D Persona Clustering
- Real-time GPS Trigger Detection
`
  }
];
