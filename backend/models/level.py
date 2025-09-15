from pydantic import BaseModel
from typing import Optional

class LevelData(BaseModel):
    attempts: int = 0
    incorrectAttempts: int = 0
    hintLevel: int = 0
    status: Optional[str] = None  # 'independent' | 'partial' | 'dependent'
    completed: bool = False
