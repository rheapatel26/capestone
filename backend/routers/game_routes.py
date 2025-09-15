from fastapi import APIRouter, HTTPException, Body
from backend.models.user import User
from backend.models.level import LevelData
from typing import Dict

router = APIRouter(prefix="/game", tags=["Games"])

@router.post("/{username}/{game}/{level}/update")
async def update_game_progress(
    username: str,
    game: str,
    level: str,
    data: LevelData
):
    user = await User.find_one(User.username == username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    game_obj = getattr(user, game, None)
    if not game_obj:
        raise HTTPException(status_code=400, detail="Invalid game name")

    level_obj = getattr(game_obj, level, None)
    if not level_obj:
        raise HTTPException(status_code=400, detail="Invalid level name")

    # Update level data
    setattr(game_obj, level, data)

    # Update completion status if needed
    if data.status and data.status in ['independent', 'partial', 'dependent']:
        if game not in user.levels_completed:
            user.levels_completed[game] = 0
        current_level_num = int(level.replace('level', ''))
        if current_level_num > user.levels_completed[game]:
            user.levels_completed[game] = current_level_num

    await user.save()
    return {"message": "Progress updated", "data": data}
