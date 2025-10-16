from beanie import Document
from typing import Dict
from .game import Game

class User(Document):
    username: str
    levels_completed: Dict[str, int] = {}  # {"Game1": 2, "Game2": 3}

    Game1: Game = Game()
    Game2: Game = Game()
    Game3: Game = Game()
    Game4: Game = Game()
    Game5: Game = Game()

    class Settings:
        name = "users"
