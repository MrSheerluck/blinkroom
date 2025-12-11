from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.room import Room
from app.schemas.room import RoomCreate, RoomResponse, RoomDetail
from app.utils.room_id import generate_room_id

router = APIRouter(
    prefix="/api/rooms",
    tags=["rooms"]
)

@router.post("/", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(db: AsyncSession = Depends(get_db)):
    """
    Create a new room.

    - Generates a unique 6-character room ID
    - Sets expiry to 24 hours from creation
    - Returns the new room details
    """
    room_id = generate_room_id()

    existing_room = await db.get(Room, room_id)
    while existing_room is not None:
        room_id = generate_room_id()
        existing_room = await db.get(Room, room_id)
    
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=24)

    new_room = Room(
        id=room_id,
        expires_at=expires_at,
        is_active=True
    )

    db.add(new_room)
    await db.commit()
    await db.refresh(new_room)

    return new_room


@router.get("/{room_id}", response_model=RoomDetail)
async def get_room(room_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get room details by ID.

    - Returns room information including expiry status.
    - Retursn 404 is room doesn't exist or has expired.
    """

    room = await db.get(Room, room_id)
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Room '{room_id}' not found"
        )

    if room.is_expired:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail=f"Room '{room_id}' has expired"
        )

    return RoomDetail.from_room(room)