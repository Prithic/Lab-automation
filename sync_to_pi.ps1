$pi_host = "hari.local"
$pi_user = "hari"

Write-Host "📦 SYNCING LABOS TO RASPBERRY PI (hari.local)..." -ForegroundColor Cyan

# 1. Sync the AI and Hailo folders
scp -r "LabVision-AI" "${pi_user}@${pi_host}:~/"
scp -r "LabVision-Hailo" "${pi_user}@${pi_host}:~/"

# 2. Sync the Documentation
scp "LABOS_ARCHITECTURE.md" "${pi_user}@${pi_host}:~/LabVision-Hailo/"

Write-Host "✅ DEPLOYMENT READY!" -ForegroundColor Green
Write-Host "To run on Pi: ssh ${pi_user}@${pi_host} 'python3 ~/LabVision-Hailo/src/hailo_app.py'" -ForegroundColor Yellow
