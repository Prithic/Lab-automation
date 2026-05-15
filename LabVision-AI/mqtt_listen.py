import paho.mqtt.client as mqtt
import json

# --- CONFIG ---
MQTT_BROKER = "hari.local" # Using mDNS for stable connection
MQTT_TOPIC = "lab/#"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"CONNECTED to {MQTT_BROKER}")
        client.subscribe(MQTT_TOPIC)
        print(f"Subscribed to {MQTT_TOPIC}. Waiting for AI data...")
    else:
        print(f"FAILED to connect. Code: {rc}")

def on_message(client, userdata, msg):
    print(f"\n[{msg.topic}]")
    print(f"Payload: {msg.payload.decode()}")

# Setup Client (Updated for Paho MQTT v2.0)
try:
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1, "Debug_Listener")
except AttributeError:
    client = mqtt.Client("Debug_Listener")
client.on_connect = on_connect
client.on_message = on_message

try:
    print(f"CONNECTING to {MQTT_BROKER}...")
    client.connect(MQTT_BROKER, 1883, 60)
    client.loop_forever()
except Exception as e:
    print(f"ERROR: Could not connect to {MQTT_BROKER}")
    print(f"Details: {e}")
    print("\nHELP: Is your Raspberry Pi turned ON? Are you on the same WiFi?")
