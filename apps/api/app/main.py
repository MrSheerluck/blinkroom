from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as redis
from sqlalchemy import text

from app.config import settings
from app.database import AsyncSessionLocal

app = FastAPI(title="BlinkRoom API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """
    Health check endpoint that verifies:
    - API is running
    - Database connectivity
    - Redis connectivity
    """
    health_status = {
        "api": "ok",
        "database": "unknown",
        "redis": "unknown"
    }
    
    # Check database
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        health_status["database"] = "ok"
    except Exception as e:
        health_status["database"] = f"error: {str(e)}"
    
    # Check Redis
    try:
        redis_client = redis.from_url(settings.redis_url)
        await redis_client.ping()
        await redis_client.close()
        health_status["redis"] = "ok"
    except Exception as e:
        health_status["redis"] = f"error: {str(e)}"
    
    return health_status


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "BlinkRoom API - Use /health to check status"}