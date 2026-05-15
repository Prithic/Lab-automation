$pi_ip = "192.168.137.37"
$pi_user = "hari"

echo "Syncing LabVision-AI..."
scp -r "LabVision-AI" "${pi_user}@${pi_ip}:~/"

echo "Syncing LabVision-Hailo..."
scp -r "LabVision-Hailo" "${pi_user}@${pi_ip}:~/"

echo "Done! You can now log into your Pi: ssh ${pi_user}@${pi_ip}"
