import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.database.init_db import init_db
from app.api.v1.router import api_router

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("parkease")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing ParkEase backend services...")
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization warning: {e}")
    yield
    logger.info("Shutting down ParkEase backend services.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="ParkEase Smart Parking Availability & Location API - Find. Reserve. Park.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For flexible local & Docker access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(api_router, prefix="/api")
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "app": "ParkEase API",
        "status": "online",
        "tagline": "Find. Reserve. Park.",
        "docs": "/docs",
        "version": settings.PROJECT_VERSION
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
