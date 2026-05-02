import cv2
import paho.mqtt.client as mqtt
import json
import time

# MQTT Configuration
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "lab/security/camera"

# Initialize MQTT Client
mqtt_client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
try:
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
    print("Connected to MQTT broker")
except Exception as e:
    print(f"Could not connect to MQTT broker: {e}")

# Load Haar Cascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Initialize Camera
cap = cv2.VideoCapture(0)

last_publish_time = 0
COOLDOWN_SECONDS = 5

print("Starting Vision Node. Press 'q' to quit.")

try:
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        current_time = time.time()
        
        if len(faces) > 0:
            # Draw bounding boxes
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            # Publish to MQTT if cooldown passed
            if current_time - last_publish_time > COOLDOWN_SECONDS:
                payload = {
                    "camera_zone": "Workstation",
                    "face_detected": True,
                    "timestamp": time.ctime()
                }
                mqtt_client.publish(MQTT_TOPIC, json.dumps(payload))
                print(f"Face detected! Published to {MQTT_TOPIC}")
                last_publish_time = current_time

        # Display output
        cv2.imshow('Smart Lab Vision Node', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

finally:
    cap.release()
    cv2.destroyAllWindows()
    mqtt_client.disconnect()
