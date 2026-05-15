import cv2
from ultralytics import YOLO
import paho.mqtt.client as mqtt
import json
import time
import os
import torch

# --- CONFIGURATION ---
MQTT_BROKER = "127.0.0.1"
MQTT_PORT = 1883
MQTT_TOPIC_COUNT = "lab/vision/people_count"
CLIENT_ID = "LabVision_AI_Sensor"

MODEL_PATH = "yolov8s_final.pt"
CONFIDENCE = 0.35
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

            results = model(frame, classes=[0], conf=CONFIDENCE, device=device, verbose=False)
            person_count = len(results[0].boxes)
            now = time.time()

            if (now - last_publish_time) >= PUBLISH_INTERVAL:
                client.publish(MQTT_TOPIC_COUNT, str(person_count), qos=1, retain=True)
                print(f">>> DATA SENT TO BROKER: {person_count} people") # Heartbeat
                print(f"📡 Sent Count: {person_count}")
                last_publish_time = now

            # --- PERFECT PREVIEW ---
            cv2.namedWindow("LabOS AI Sensor", cv2.WINDOW_NORMAL)
            cv2.resizeWindow("LabOS AI Sensor", 1280, 720) # HD Default
            
            annotated_frame = results[0].plot()
            
            # Premium Status Bar
            h, w, _ = annotated_frame.shape
            cv2.rectangle(annotated_frame, (0, 0), (w, 50), (30, 30, 30), -1) # Dark Bar
            cv2.putText(annotated_frame, f"LABOS AI SENSOR | PEOPLE: {person_count}", 
                        (20, 35), cv2.FONT_HERSHEY_DUPLEX, 0.8, (255, 255, 255), 1)
            
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