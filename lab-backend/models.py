from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime
from datetime import datetime, timezone
from database import Base

class RadarLog(Base):
    __tablename__ = "radar_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    distance = Column(Float)
    zone = Column(String)
    presence = Column(Boolean)
