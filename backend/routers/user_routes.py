from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.models.user import User
from backend.models.level import LevelData
from backend.models.auth import UserSignUp, UserSignIn, UserResponse, Token
from datetime import datetime
import jwt
import os

router = APIRouter(prefix="/users", tags=["Users"])
security = HTTPBearer()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"

def create_access_token(data: dict):
    """Create JWT access token"""
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Sign Up
@router.post("/signup", response_model=Token)
async def sign_up(user_data: UserSignUp):
    # Check if user already exists
    existing_user = await User.find_one(User.username == user_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check email if provided
    if user_data.email:
        existing_email = await User.find_one(User.email == user_data.email)
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already exists")
    
    # Create new user
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=User.hash_password(user_data.password)
    )
    
    await new_user.insert()
    
    # Create access token
    access_token = create_access_token(data={"sub": new_user.username})
    
    user_response = UserResponse(
        username=new_user.username,
        email=new_user.email,
        created_at=new_user.created_at.isoformat(),
        last_active=new_user.last_active.isoformat(),
        levels_completed=new_user.levels_completed,
        total_play_time=new_user.total_play_time
    )
    
    return Token(access_token=access_token, user=user_response)

# Sign In
@router.post("/signin", response_model=Token)
async def sign_in(user_data: UserSignIn):
    # Find user
    user = await User.find_one(User.username == user_data.username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Verify password
    if not user.verify_password(user_data.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Update last active
    user.update_last_active()
    await user.save()
    
    # Create access token
    access_token = create_access_token(data={"sub": user.username})
    
    user_response = UserResponse(
        username=user.username,
        email=user.email,
        created_at=user.created_at.isoformat(),
        last_active=user.last_active.isoformat(),
        levels_completed=user.levels_completed,
        total_play_time=user.total_play_time
    )
    
    return Token(access_token=access_token, user=user_response)

# Legacy create user (for backward compatibility)
@router.post("/user/")
async def create_user(user: User):
    existing = await User.find_one(User.username == user.username)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    await user.insert()
    return user

# Get a user (protected route)
@router.get("/user/{username}")
async def get_user(username: str, current_user: str = Depends(get_current_user)):
    # Users can only access their own data
    if username != current_user:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = await User.find_one(User.username == username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Update a specific level (protected route)
@router.post("/user/{username}/game/{game}/level/{level}")
async def update_level(
    username: str, 
    game: str, 
    level: str, 
    data: LevelData,
    current_user: str = Depends(get_current_user)
):
    # Users can only update their own data
    if username != current_user:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = await User.find_one(User.username == username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Dynamically access the game field (Game1, Game2…)
    game_obj = getattr(user, game, None)
    if game_obj is None:
        raise HTTPException(status_code=400, detail="Invalid game name")

    # Update the level data
    setattr(game_obj, level, data)
    
    # Update last active
    user.update_last_active()
    await user.save()
    return user
