from fastapi import FastAPI
from contextlib import asynccontextmanager
from backend.config.db import init_db
from backend.routers import user_routes, game_routes


# Lifespan for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize DB
    await init_db()
    yield
    # Shutdown: optional cleanup (if needed)
app = FastAPI(lifespan=lifespan)

# Register routers
app.include_router(user_routes.router, tags=["Users"])
app.include_router(game_routes.router, tags=["Games"])

# Add CORS middleware
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Modify this in production to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
async def root():
    return {"message": "Hello World"}
