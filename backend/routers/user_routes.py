from fastapi import APIRouter, HTTPException
from backend.models.user import User
from backend.models.level import LevelData

router = APIRouter(prefix="/user", tags=["Users"])

# Create new user
@router.post("/")
async def create_user(user: User):
    # Clear any provided _id to let MongoDB generate a new one
    user.id = None
    
    existing = await User.find_one(User.username == user.username)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    try:
        await user.insert()
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

# Get a user
@router.get("/{username}")
async def get_user(username: str):
    user = await User.find_one(User.username == username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Update a specific level
@router.post("/{username}/game/{game}/level/{level}")
async def update_level(username: str, game: str, level: str, data: LevelData):
    user = await User.find_one(User.username == username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Dynamically access the game field (Game1, Game2…)
    game_obj = getattr(user, game, None)
    if game_obj is None:
        raise HTTPException(status_code=400, detail="Invalid game name")

    # For fixed 5 levels:
    setattr(game_obj, level, data)

    await user.save()
    return user
