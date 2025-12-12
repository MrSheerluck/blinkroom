from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime


class MessageType(str, Enum):
    """
    Different types of messages we can send.
    """

    MESSAGE = "message"
    USER_JOINED = "user_joined"
    USER_LEFT = "user_left"
    MESSAGE_HISTORY = "message_history"


class MessageCreate(BaseModel):
    """
    Request body for creating a message
    """

    contents: str = Field(..., min_length=1, max_length=2000)


class Message(BaseModel):
    """
    A complete chat message.
    """

    type: MessageType = MessageType.MESSAGE
    id: str
    username: str
    contents: str
    timestamp: datetime
