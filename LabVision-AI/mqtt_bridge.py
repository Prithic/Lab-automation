import cv2
from ultralytics import YOLO
import paho.mqtt.client as mqtt
import json
import time
import os
import torch
from occupancy_engine import OccupancyEngine

# --- CONFIGURATION ---
MQTT_BROKER = "hari.local"
MQTT_PORT = 1883
MQTT_TOPIC_COUNT = "lab/vision/people_count"
CLIENT_ID = "LabVision_AI_Sensor"

MODEL_PATH = "yolov8s_final.pt"
CONFIDENCE = 0.25                 # Lowered for better crowd detection
IOU_THRESHOLD = 0.5               # Helps separate people standing close together
PUBLISH_INTERVAL = 1             # Faster updates for real-time sensing

# --- MQTT SETUP ---
try:
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1, CLIENT_ID)
except AttributeError:
    client = mqtt.Client(CLIENT_ID)

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to MQTT Broker!")
    else:
        print(f"❌ Connection failed: {rc}")

client.on_connect = on_connect

def connect_mqtt():
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start()
    except Exception as e:
        print(f"⚠️ MQTT Error: {e}")

# --- AI CORE ---
def run_sensor(source=0):
    device = '0' if torch.cuda.is_available() else 'cpu'
    model = YOLO(MODEL_PATH)
    cap = cv2.VideoCapture(source)
    
    connect_mqtt()
    engine = OccupancyEngine(client)
    last_publish_time = 0
    
    print(f"\n🚀 AI SENSOR ACTIVE: Publishing to {MQTT_TOPIC_COUNT}")
    
    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                if isinstance(source, str):
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                break

            results = model(frame, classes=[0], conf=CONFIDENCE, iou=IOU_THRESHOLD, device=device, verbose=False)
            person_count = len(results[0].boxes)
            
            # --- STABILIZER ENGINE ---
            engine.update(person_count)
            
            now = time.time()

            if (now - last_publish_time) >= PUBLISH_INTERVAL:
                # Send JSON payload for better HA integration
                payload = {
                    "count": engine.stable_count,
                    "raw_count": person_count,
                    "tier": engine.current_tier,
                    "status": "online"
                }
                client.publish(MQTT_TOPIC_COUNT, json.dumps(payload), qos=1, retain=True)
                
                # Also publish a simple number for basic sensors
                client.publish(f"{MQTT_TOPIC_COUNT}/state", str(engine.stable_count), qos=1, retain=True)
                
                print(f">>> DATA SENT TO HA: {engine.stable_count} people (Stable)")
                last_publish_time = now

            # --- PERFECT PREVIEW ---
            cv2.namedWindow("LabOS AI Sensor", cv2.WINDOW_NORMAL)
            cv2.resizeWindow("LabOS AI Sensor", 1280, 720) # HD Default
            
            annotated_frame = results[0].plot()
            
            # Premium Status Bar
            h, w, _ = annotated_frame.shape
            cv2.rectangle(annotated_frame, (0, 0), (w, 70), (30, 30, 30), -1) # Dark Bar
            
            # Status Text
            status_text = f"RAW: {person_count} | STABLE: {engine.stable_count} | TIER: {engine.current_tier}"
            cv2.putText(annotated_frame, status_text, (20, 30), cv2.FONT_HERSHEY_DUPLEX, 0.6, (255, 255, 255), 1)
            
            # Stabilization Indicator
            if any(engine.target_states[i] != engine.relay_states[i] for i in range(1, 9)):
                cv2.putText(annotated_frame, "", 
                            (20, 55), cv2.FONT_HERSHEY_DUPLEX, 0.5, (0, 165, 255), 1)
            
            # Connectivity Indicator (Small green dot)
            color = (0, 255, 0) if client.is_connected() else (0, 0, 255)
            cv2.circle(annotated_frame, (w-30, 25), 8, color, -1)

            cv2.imshow("LabOS AI Sensor", annotated_frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()
        client.disconnect()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=str, default="0")
    args = parser.parse_args()
    
    src = int(args.source) if args.source.isdigit() else args.source
    run_sensor(source=src)