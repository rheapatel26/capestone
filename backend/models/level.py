from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LevelData(BaseModel):
    hints_used: int = 0
    solution_used: bool = False
    incorrect: int = 0
    correct_attempts: int = 0
    
    # Additional tracking fields
    start_time: Optional[datetime] = None
    completion_time: Optional[datetime] = None
    total_time_spent: int = 0  # in seconds
    is_completed: bool = False
    best_score: int = 0  # game-specific scoring
    attempts_count: int = 0  # total attempts on this level
    
    # Learning metrics
    independence_level: str = "not_started"  # "independent", "partial", "dependent", "not_started"
    difficulty_rating: int = 0  # 1-5 player-rated difficulty
    
    def mark_completion(self):
        """Mark level as completed and set completion time"""
        self.is_completed = True
        self.completion_time = datetime.utcnow()
        
        # Determine independence level
        if self.hints_used == 0 and not self.solution_used:
            self.independence_level = "independent"
        elif self.hints_used <= 2 and not self.solution_used:
            self.independence_level = "partial"
        else:
            self.independence_level = "dependent"
    
    def add_attempt(self, correct: bool):
        """Record an attempt"""
        self.attempts_count += 1
        if correct:
            self.correct_attempts += 1
        else:
            self.incorrect += 1
