"""
WebSocket connection manager with Redis Pub/Sub for multi-server support.
"""

import asyncio
import json
import logging
from typing import Dict
from fastapi import WebSocket
import redis.asyncio as redis

from app.config import settings


class ConnectionManager:
    """Manages WebSocket connections across multiple servers using Redis Pub/Sub."""

    def __init__(self):
        # Local connections on THIS server only
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}

        # Redis clients
        self.redis_client: redis.Redis | None = None
        self.pubsub: redis.client.PubSub | None = None

        # Task management
        self._listener_tasks: Dict[str, asyncio.Task] = {}

        # Lock for thread-safe room creation
        self._global_lock = asyncio.Lock()

    async def connect(self, room_id: str, user_id: str, websocket: WebSocket):
        """Add a user to a room."""
        await websocket.accept()

        # Use lock to prevent race condition on concurrent joins
        async with self._global_lock:
            if room_id not in self.active_connections:
                self.active_connections[room_id] = {}
                await self._subscribe_to_room(room_id)

        self.active_connections[room_id][user_id] = websocket

    async def disconnect(self, room_id: str, user_id: str):
        """Remove a user from a room."""
        if room_id in self.active_connections:
            self.active_connections[room_id].pop(user_id, None)

            if not self.active_connections[room_id]:
                await self._unsubscribe_from_room(room_id)
                del self.active_connections[room_id]

    async def broadcast_to_room(self, room_id: str, message: dict):
        """Publish message to Redis (reaches all servers)."""
        if self.redis_client is None:
            self.redis_client = redis.from_url(settings.redis_url)

        channel = f"room:{room_id}"
        message_json = json.dumps(message)
        await self.redis_client.publish(channel, message_json)

    async def _subscribe_to_room(self, room_id: str):
        """Subscribe to Redis channel for a room."""
        if self.redis_client is None:
            self.redis_client = redis.from_url(settings.redis_url)

        if self.pubsub is None:
            self.pubsub = self.redis_client.pubsub()

        channel = f"room:{room_id}"
        await self.pubsub.subscribe(channel)

        # Start listening in background and store task reference
        task = asyncio.create_task(self._listen_to_redis(room_id))
        self._listener_tasks[room_id] = task

    async def _unsubscribe_from_room(self, room_id: str):
        """Unsubscribe from Redis channel and cancel listener task."""
        # Cancel listener task
        if room_id in self._listener_tasks:
            self._listener_tasks[room_id].cancel()
            try:
                await self._listener_tasks[room_id]
            except asyncio.CancelledError:
                pass  # Expected
            del self._listener_tasks[room_id]

        # Unsubscribe from Redis
        if self.pubsub:
            channel = f"room:{room_id}"
            await self.pubsub.unsubscribe(channel)

    async def _listen_to_redis(self, room_id: str):
        """Listen for messages from Redis and broadcast to local users."""
        logger = logging.getLogger(__name__)
        expected_channel = f"room:{room_id}".encode()  # Redis returns bytes

        try:
            async for message in self.pubsub.listen():
                # Only process messages for THIS room's channel
                if (
                    message["type"] == "message"
                    and message.get("channel") == expected_channel
                ):
                    data = json.loads(message["data"])
                    await self._send_to_local_connections(room_id, data)
        except asyncio.CancelledError:
            pass  # Expected on unsubscribe
        except Exception:
            logger.exception(f"Error in Redis listener for room {room_id}")

    async def _send_to_local_connections(self, room_id: str, message: dict):
        """Send message to all local users in a room."""
        if room_id not in self.active_connections:
            return

        disconnected = []
        for user_id, websocket in self.active_connections[room_id].items():
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.append(user_id)

        # Clean up dead connections
        for user_id in disconnected:
            await self.disconnect(room_id, user_id)


# Singleton instance
manager = ConnectionManager()
