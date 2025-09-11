import motor.motor_asyncio
from beanie import init_beanie
from backend.models.user import User as user_model
import os
from dotenv import load_dotenv

# Load environment variables
if not load_dotenv():
    raise ValueError("❌ .env file not found")

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

if not MONGO_URL or not DB_NAME:
    raise ValueError("❌ Missing MONGO_URL or DB_NAME in .env")

try:
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
except Exception as e:
    raise ValueError(f"❌ Failed to connect to MongoDB: {str(e)}")

async def init_db():
    await init_beanie(
        database=db,
        document_models=[user_model]
    )

