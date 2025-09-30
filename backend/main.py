from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Register routers  
app.include_router(user_routes.router)
app.include_router(game_routes.router, prefix="/games", tags=["Games"])

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Educational Games Backend API", "status": "running"}

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


# Root endpoint
@app.get("/")
async def root():
    return {"message": "Hello World"}
