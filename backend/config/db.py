import motor.motor_asyncio
from beanie import init_beanie
from backend.models.user import User as user_model
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
if not MONGO_URL or not DB_NAME:
    raise ValueError("❌ Missing MONGO_URL or DB_NAME in .env")

async def init_db():
    await init_beanie(
        database=db,
        document_models=[user_model]  # add more models later
    )

