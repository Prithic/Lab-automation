from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, engine
import models
import mqtt_client
from contextlib import asynccontextmanager
import httpx
import re
from pydantic import BaseModel

# Create tables
models.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    mqtt_client.start_mqtt()
    yield
    # Shutdown logic
    mqtt_client.mqtt_client.loop_stop()
    mqtt_client.mqtt_client.disconnect()

app = FastAPI(title="Smart Lab Automation Platform API", lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/history/radar")
def get_radar_history(db: Session = Depends(get_db)):
    logs = db.query(models.RadarLog).order_by(models.RadarLog.timestamp.desc()).limit(50).all()
    return logs

class AIRequest(BaseModel):
    message: str

@app.post("/api/ai/command")
async def ai_command(request: AIRequest):
    system_prompt = "You are the Smart Lab AI. If the user implies they want the main lights toggled, you MUST output exactly [CMD: lab/relay/main_lights = TOGGLE]. Otherwise, just give a short, helpful response."
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "tinyllama",
                    "prompt": f"System: {system_prompt}\nUser: {request.message}",
                    "stream": False
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                return {"response": "AI Assistant is currently unavailable."}
                
            ai_text = response.json().get("response", "")
            
            # Interceptor Logic
            cmd_match = re.search(r"\[CMD: (.*?) = (.*?)\]", ai_text)
            if cmd_match:
                topic = cmd_match.group(1).strip()
                payload = cmd_match.group(2).strip()
                
                # Publish to MQTT
                mqtt_client.mqtt_client.publish(topic, payload)
                
                # Clean the response text
                ai_text = re.sub(r"\[CMD: .*?\]", "", ai_text).strip()
                
            return {"response": ai_text if ai_text else "Command executed successfully."}
            
    except Exception as e:
        print(f"AI error: {e}")
        return {"response": "Error communicating with AI service."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
