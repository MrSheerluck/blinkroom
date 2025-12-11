from datetime import datetime, timedelta, timezone
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.sql import func

from app.database import Base

class Room(Base):
    """
    Room model for storing room metadata.
    Rooms are ephemeral and auto-delete after 24 hours.
    """
    __tablename__ = "rooms"

    id = Column(String(6), primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    def __repr__(self):
        return f"<Room(id={self.id}, created_at={self.created_at}, expires_at={self.expires_at})>"
    
    @property
    def is_expired(self) -> bool:
        """Check if the room has expired."""
        return datetime.now(timezone.utc) > self.expires_at
    
    @property
    def time_remaining(self) -> timedelta:
        """Get the time remaining before the room expires."""
        return self.expires_at - datetime.now(timezone.utc)

