# IntelliHealth Backend Startup Script
# This script starts the Flask backend server for the chatbot

Write-Host "🚀 Starting IntelliHealth Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (Test-Path ".venv\Scripts\python.exe") {
    Write-Host "✅ Virtual environment found" -ForegroundColor Green
    
    # Start the Flask server
    Write-Host "🔧 Starting Flask server on port 5000..." -ForegroundColor Yellow
    Write-Host ""
    
    .\.venv\Scripts\python.exe app.py
} else {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run: python -m venv .venv" -ForegroundColor Yellow
    Write-Host "Then run: .venv\Scripts\pip.exe install -r requirements.txt" -ForegroundColor Yellow
}
