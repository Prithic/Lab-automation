import paho.mqtt.client as mqtt
import json
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

# Create tables
models.Base.metadata.create_all(bind=engine)

MQTT_BROKER = "127.0.0.1"
MQTT_PORT = 1883
MQTT_TOPIC = "lab/radar/status"

def on_connect(client, userdata, flags, rc, properties=None):
    print(f"Connected to MQTT broker with result code {rc}")
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        print(f"Received message on {msg.topic}: {payload}")
        
        # Insert into database
        db = SessionLocal()
        try:
            new_log = models.RadarLog(
                distance=float(payload.get("distance", 0)),
                zone=payload.get("zone", "unknown"),
                presence=bool(payload.get("presence", False))
            )
            db.add(new_log)
            db.commit()
            db.refresh(new_log)
            print(f"Saved log with ID: {new_log.id}")
        except Exception as e:
            print(f"Error saving to database: {e}")
            db.rollback()
        finally:
            db.close()
            
    except Exception as e:
        print(f"Error parsing MQTT message: {e}")

mqtt_client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

def start_mqtt():
    try:
        mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
        mqtt_client.loop_start()
    except Exception as e:
        print(f"Could not connect to MQTT broker: {e}")
