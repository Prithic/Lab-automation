from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, engine
import models
import mqtt_client
from contextlib import asynccontextmanager

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
