import random


ADJECTIVES = [
    "Brave",
    "Quick",
    "Silent",
    "Bright",
    "Swift",
    "Bold",
    "Calm",
    "Clever",
    "Eager",
    "Fierce",
    "Gentle",
    "Happy",
    "Kind",
    "Lazy",
    "Merry",
    "Nervous",
    "Open",
    "Proud",
    "Quick",
    "Quiet",
    "Rapid",
    "Shy",
    "Tender",
    "Upbeat",
    "Vibrant",
    "Wise",
    "Xeroxed",
    "Yummy",
    "Zany",
]

ANIMALS = [
    "Wolf",
    "Fox",
    "Bear",
    "Eagle",
    "Tiger",
    "Lion",
    "Hawk",
    "Owl",
    "Panda",
    "Raven",
    "Snake",
    "Turtle",
    "Vulture",
    "Wolf",
    "Xerus",
    "Yak",
    "Zebra",
]


def generate_username():
    """
    Generate a random username from a list of adjectives and animals.
    """
    adjective = random.choice(ADJECTIVES)
    animal = random.choice(ANIMALS)
    return f"{adjective}{animal}"
