from beanie import Document
from typing import Dict, Optional
from datetime import datetime
from .individual_games import (
    BubbleCountingGameData,
    DigitTracingGameData, 
    ClockTimeGameData,
    MoneyConceptGameData,
    AddSubBubblesGameData
)
import hashlib

class User(Document):
    username: str
    email: Optional[str] = None
    password_hash: str  # Store hashed password
    created_at: datetime = datetime.utcnow()
    last_active: datetime = datetime.utcnow()
    levels_completed: Dict[str, int] = {}  # {"Game1": 2, "Game2": 3}

    # Individual game progress with specific schemas
    Game1: BubbleCountingGameData = BubbleCountingGameData()
    Game2: DigitTracingGameData = DigitTracingGameData()
    Game3: ClockTimeGameData = ClockTimeGameData()
    Game4: MoneyConceptGameData = MoneyConceptGameData()
    Game5: AddSubBubblesGameData = AddSubBubblesGameData()

    # Player stats
    total_play_time: int = 0  # in minutes
    preferred_difficulty: str = "normal"
    
    class Settings:
        name = "users"
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password with salt"""
        salt = "educational_games_salt"  # In production, use random salts
        return hashlib.sha256((password + salt).encode()).hexdigest()
    
    def verify_password(self, password: str) -> bool:
        """Verify a password against the stored hash"""
        return self.password_hash == User.hash_password(password)
    
    def update_last_active(self):
        """Update the last active timestamp"""
        self.last_active = datetime.utcnow()
    
    def get_overall_progress(self) -> Dict:
        """Get overall progress statistics"""
        total_levels_completed = sum(self.levels_completed.values())
        games_played = len([k for k, v in self.levels_completed.items() if v > 0])
        
        return {
            "total_levels_completed": total_levels_completed,
            "games_played": games_played,
            "total_play_time": self.total_play_time,
            "created_at": self.created_at,
            "last_active": self.last_active
        }
