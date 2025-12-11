import random
import string


def generate_room_id(length: int = 6) -> str:
    """
    Generate a random room ID.
    
    Args:
        length: Length of the room ID (default: 6)
    
    Returns:
        A random alphanumeric string (e.g., "aB3xK9")
    
    Note:
        Uses both uppercase, lowercase, and digits for maximum entropy.
        With 6 characters: 62^6 = ~56 billion possible combinations.
    """
    characters = string.ascii_letters + string.digits  # a-z, A-Z, 0-9
    return ''.join(random.choices(characters, k=length))