# start_labvision.ps1
# This script runs everything using GLOBAL Python

Write-Host "🚀 INITIALIZING LABVISION-AI SYSTEM (GLOBAL MODE)..." -ForegroundColor Cyan

# 1. Start the MQTT Listener in a NEW window
Write-Host "📡 Starting Listener (Topic: lab/#)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python './LabVision-AI/mqtt_listen.py'"

# 2. Start the AI Sensor in THIS window
Write-Host "🤖 Starting AI Sensor (Camera: 0)..." -ForegroundColor Green
python "./LabVision-AI/mqtt_bridge.py" --source 0
