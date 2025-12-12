"""
Message service for storing and retrieving messages from Redis.
"""

import json
from typing import Optional
import redis.asyncio as redis

from app.config import settings
from app.schemas.message import Message


class MessageService:
    """Service for managing chat messages in Redis."""

    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None

    async def get_redis(self) -> redis.Redis:
        """Get or create Redis client."""
        if self.redis_client is None:
            self.redis_client = redis.from_url(settings.redis_url)
        return self.redis_client

    def _get_messages_key(self, room_id: str) -> str:
        """Get Redis key for room messages."""
        return f"room:{room_id}:messages"

    async def save_message(self, room_id: str, message: Message) -> None:
        """
        Save a message to Redis.

        Args:
            room_id: The room ID
            message: The message to save
        """
        client = await self.get_redis()
        key = self._get_messages_key(room_id)

        # Convert message to JSON
        message_json = message.model_dump_json()

        # Append to list
        await client.rpush(key, message_json)

        # Set TTL to 24 hours if not already set
        ttl = await client.ttl(key)
        if ttl == -1:  # No expiration set
            await client.expire(key, 86400)  # 24 hours

    async def get_room_messages(self, room_id: str, limit: int = 50) -> list[Message]:
        """
        Get the last N messages for a room.

        Args:
            room_id: The room ID
            limit: Maximum number of messages to retrieve

        Returns:
            List of messages, ordered from oldest to newest
        """
        client = await self.get_redis()
        key = self._get_messages_key(room_id)

        # Get last N messages
        messages_json = await client.lrange(key, -limit, -1)

        # Parse JSON messages
        messages = []
        for msg_json in messages_json:
            try:
                msg_dict = json.loads(msg_json)
                messages.append(Message(**msg_dict))
            except Exception as e:
                print(f"Error parsing message: {e}")
                continue

        return messages

    async def delete_room_messages(self, room_id: str) -> None:
        """Delete all messages for a room."""
        client = await self.get_redis()
        key = self._get_messages_key(room_id)
        await client.delete(key)


# Singleton instance
message_service = MessageService()
