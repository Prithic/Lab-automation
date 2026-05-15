import paho.mqtt.client as mqtt
import time
import random
import json

# --- CONFIG ---
MQTT_BROKER = "localhost" # Update to your HA IP
MQTT_TOPIC_PIR = "lab/lab101/zoneA/pir/state"
MQTT_TOPIC_MMWAVE = "lab/lab101/zoneA/mmwave/state"

client = mqtt.Client("Mock_Hardware_Sensors")

def connect():
    client.connect(MQTT_BROKER, 1883, 60)
    print(f"✅ Mock Sensors Connected to {MQTT_BROKER}")

def run_simulation():
    connect()
    print("🚀 Simulating Sensor Activity (Press Ctrl+C to stop)")
    
    try:
        while True:
            # Simulate a person walking in/out every 10 seconds
            is_present = random.choice([True, False])
            payload = "1" if is_present else "0"
            
            # Publish to both topics
            client.publish(MQTT_TOPIC_PIR, payload)
            client.publish(MQTT_TOPIC_MMWAVE, payload)
            
            status = "DETECTED" if is_present else "CLEAR"
            print(f"📡 Mock Sensors: {status}")
            
            time.sleep(10)
    except KeyboardInterrupt:
        print("\nStopping simulation.")
        client.disconnect()

if __name__ == "__main__":
    run_simulation()
