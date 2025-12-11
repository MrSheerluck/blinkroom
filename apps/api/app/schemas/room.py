from datetime import datetime
from pydantic import BaseModel, Field


class RoomBase(BaseModel):
    """Base model for room data."""
    pass

class RoomCreate(RoomBase):
    """
    Schema for creating a new room.
    No input needed - room ID and expiry are auto generated.
    """
    pass

class RoomResponse(RoomBase):
    """
    Schema for a room response.
    Returns room details including ID, timestamps, and expiry info.
    """
    id: str = Field(..., description="6-character room ID")
    created_at: datetime = Field(..., description="Room creation timestamp")
    expires_at: datetime = Field(..., description="Room expiration timestamp(24 hours from creation)")
    is_active: bool = Field(..., description="Whether the room is active")    

    class Config:
        from_attributes = True

class RoomDetail(RoomResponse):
    is_expired: bool = Field(..., description="Whether the room has expired")
    
    @classmethod
    def from_room(cls, room):
        """Create RoomDetail from Room model instance."""
        return cls(
            id=room.id,
            created_at=room.created_at,
            expires_at=room.expires_at,
            is_active=room.is_active,
            is_expired=room.is_expired
        )
