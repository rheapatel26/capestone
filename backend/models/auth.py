from pydantic import BaseModel, EmailStr
from typing import Optional

class UserSignUp(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    password: str

class UserSignIn(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    username: str
    email: Optional[str] = None
    created_at: str
    last_active: str
    levels_completed: dict
    total_play_time: int

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse