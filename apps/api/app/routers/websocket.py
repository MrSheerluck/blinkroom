"""
WebSocket router for real-time chat.
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.room import Room
from app.schemas.message import (
    Message,
    MessageCreate,
    MessageHistory,
    UserJoinedEvent,
    UserLeftEvent,
    MessageType,
)
from app.services.websocket_manager import manager
from app.services.message_service import message_service
from app.utils.username_generator import generate_username


router = APIRouter()


@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """WebSocket endpoint for real-time chat."""

    # Validate room exists and not expired
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Room).where(Room.id == room_id))
        room = result.scalar_one_or_none()

        if not room:
            await websocket.close(code=1008, reason="Room not found")
            return

        if room.is_expired:
            await websocket.close(code=1008, reason="Room expired")
            return

    # Generate username and connect
    username = generate_username()
    user_id = str(uuid.uuid4())

    await manager.connect(room_id, user_id, websocket)

    try:
        # Send message history
        messages = await message_service.get_room_messages(room_id, limit=50)
        history = MessageHistory(
            type=MessageType.MESSAGE_HISTORY, messages=messages, username=username
        )
        await websocket.send_json(history.model_dump(mode="json"))

        # Broadcast "user joined"
        join_event = UserJoinedEvent(
            type=MessageType.USER_JOINED, username=username, timestamp=datetime.utcnow()
        )
        await manager.broadcast_to_room(room_id, join_event.model_dump(mode="json"))

        # Listen for messages
        while True:
            data = await websocket.receive_json()
            message_create = MessageCreate(**data)

            message = Message(
                type=MessageType.MESSAGE,
                id=f"msg_{uuid.uuid4().hex[:8]}",
                username=username,
                contents=message_create.contents,
                timestamp=datetime.utcnow(),
            )

            await message_service.save_message(room_id, message)
            await manager.broadcast_to_room(room_id, message.model_dump(mode="json"))

    except WebSocketDisconnect:
        pass  # Normal disconnect
    finally:
        # Always cleanup, regardless of how we exited
        await manager.disconnect(room_id, user_id)

        left_event = UserLeftEvent(
            type=MessageType.USER_LEFT, username=username, timestamp=datetime.utcnow()
        )
        await manager.broadcast_to_room(room_id, left_event.model_dump(mode="json"))
