from pydantic import BaseModel
from .level import LevelData

class Game(BaseModel):
    level1: LevelData = LevelData()
    level2: LevelData = LevelData()
    level3: LevelData = LevelData()
    level4: LevelData = LevelData()
    level5: LevelData = LevelData()
