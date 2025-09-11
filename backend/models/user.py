from beanie import Document
from typing import Dict, Optional
from .game import Game

class User(Document):
    username: str
    levels_completed: Dict[str, int] = {}  # {"Game1": 2, "Game2": 3}
    Game1: Optional[Game] = None
    Game2: Optional[Game] = None
    Game3: Optional[Game] = None
    Game4: Optional[Game] = None
    Game5: Optional[Game] = None

    def __init__(self, **data):
        super().__init__(**data)
        # Initialize games if not provided
        if self.Game1 is None:
            self.Game1 = Game()
        if self.Game2 is None:
            self.Game2 = Game()
        if self.Game3 is None:
            self.Game3 = Game()
        if self.Game4 is None:
            self.Game4 = Game()
        if self.Game5 is None:
            self.Game5 = Game()

    class Settings:
        name = "users"
