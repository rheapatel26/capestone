from fastapi import APIRouter, HTTPException
from backend.models.user import User

router = APIRouter(prefix="/game", tags=["Games"])

@router.post("/{username}/{game}/complete/{level}")
async def mark_level_complete(username: str, game: str, level: str):
    user = await User.find_one(User.username == username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # increment completed level count
    user.levels_completed[game] = user.levels_completed.get(game, 0) + 1
    await user.save()
    return {"message": f"{game} {level} marked as completed", "levels_completed": user.levels_completed}
