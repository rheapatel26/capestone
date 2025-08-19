from pydantic import BaseModel

class LevelData(BaseModel):
    hints_used: int = 0
    solution_used: bool = False
    incorrect: int = 0
    correct_attempts: int = 0
