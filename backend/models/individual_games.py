from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .level import LevelData

class BubbleCountingGameData(BaseModel):
    """Schema for Bubble Counting Game specific data"""
    game_id: str = "Game1"
    game_name: str = "Bubble Counting"
    
    # Level progress
    level1: LevelData = LevelData()
    level2: LevelData = LevelData()
    level3: LevelData = LevelData()
    level4: LevelData = LevelData()
    level5: LevelData = LevelData()
    
    # Game-specific metrics
    total_bubbles_popped: int = 0
    average_counting_accuracy: float = 0.0
    fastest_counting_time: Optional[float] = None
    preferred_bubble_colors: List[str] = []
    
    def get_current_level(self) -> int:
        """Get the current level player should play"""
        for i in range(1, 6):
            level_data = getattr(self, f'level{i}')
            if not level_data.is_completed:
                return i
        return 5  # All levels completed

class DigitTracingGameData(BaseModel):
    """Schema for Digit Tracing Game specific data"""
    game_id: str = "Game2"
    game_name: str = "Digit Tracing"
    
    # Level progress
    level1: LevelData = LevelData()
    level2: LevelData = LevelData() 
    level3: LevelData = LevelData()
    level4: LevelData = LevelData()
    level5: LevelData = LevelData()
    
    # Game-specific metrics
    total_digits_traced: int = 0
    average_tracing_accuracy: float = 0.0
    best_tracing_speed: Optional[float] = None
    digits_mastered: List[int] = []  # [0, 1, 2, 3...]
    
    def get_current_level(self) -> int:
        for i in range(1, 6):
            level_data = getattr(self, f'level{i}')
            if not level_data.is_completed:
                return i
        return 5

class ClockTimeGameData(BaseModel):
    """Schema for Clock Time Reading Game specific data"""
    game_id: str = "Game3"  
    game_name: str = "Clock Time"
    
    # Level progress
    level1: LevelData = LevelData()
    level2: LevelData = LevelData()
    level3: LevelData = LevelData()
    level4: LevelData = LevelData()
    level5: LevelData = LevelData()
    
    # Game-specific metrics
    time_reading_accuracy: float = 0.0
    digital_vs_analog_preference: str = "analog"  # "analog", "digital", "both"
    hour_hand_accuracy: float = 0.0
    minute_hand_accuracy: float = 0.0
    
    def get_current_level(self) -> int:
        for i in range(1, 6):
            level_data = getattr(self, f'level{i}')
            if not level_data.is_completed:
                return i
        return 5

class MoneyConceptGameData(BaseModel):
    """Schema for Money Concept Game specific data"""
    game_id: str = "Game4"
    game_name: str = "Money Concept"
    
    # Level progress
    level1: LevelData = LevelData()
    level2: LevelData = LevelData()
    level3: LevelData = LevelData()
    level4: LevelData = LevelData()
    level5: LevelData = LevelData()
    
    # Game-specific metrics
    coin_recognition_accuracy: float = 0.0
    note_recognition_accuracy: float = 0.0
    counting_money_accuracy: float = 0.0
    currency_concepts_learned: List[str] = []  # ["coins", "notes", "change", "addition"]
    
    def get_current_level(self) -> int:
        for i in range(1, 6):
            level_data = getattr(self, f'level{i}')
            if not level_data.is_completed:
                return i
        return 5

class AddSubBubblesGameData(BaseModel):
    """Schema for Addition/Subtraction Bubbles Game specific data"""
    game_id: str = "Game5"
    game_name: str = "Add/Sub Bubbles"
    
    # Level progress  
    level1: LevelData = LevelData()
    level2: LevelData = LevelData()
    level3: LevelData = LevelData()
    level4: LevelData = LevelData()
    level5: LevelData = LevelData()
    
    # Game-specific metrics
    addition_accuracy: float = 0.0
    subtraction_accuracy: float = 0.0
    mental_math_speed: Optional[float] = None
    number_range_mastered: int = 10  # up to what number they can work with
    operation_preference: str = "addition"  # "addition", "subtraction", "both"
    
    def get_current_level(self) -> int:
        for i in range(1, 6):
            level_data = getattr(self, f'level{i}')
            if not level_data.is_completed:
                return i
        return 5