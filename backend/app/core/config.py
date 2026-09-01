import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "ParkEase API"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Security
    JWT_SECRET: str = "parkease-super-secret-jwt-key-2026-secure-38491823"
    JWT_REFRESH_SECRET: str = "parkease-super-secret-refresh-key-2026-secure-8947239"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/parkease"
    MONGODB_URL: str = "mongodb://localhost:27017/parkease"
    
    # Fallback to SQLite if PostgreSQL connection fails locally during dev
    SQLITE_FALLBACK_URL: str = "sqlite:///./parkease.db"

    
    # Welcome Credits
    WELCOME_CREDITS: int = 100
    
    # Default Radius in KM for Haversine nearby search
    DEFAULT_NEARBY_RADIUS_KM: float = 10.0
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Default Admin & Manager credentials
    SEED_ADMIN_EMAIL: str = "admin@gmail.com"
    SEED_ADMIN_PASSWORD: str = "12345678"
    SEED_MANAGER_EMAIL: str = "manager1@gmail.com"
    SEED_MANAGER_PASSWORD: str = "12345678"
    SEED_MANAGER2_EMAIL: str = "manager2@gmail.com"
    SEED_MANAGER2_PASSWORD: str = "12345678"
    SEED_USER_EMAIL: str = "user@gmail.com"
    SEED_USER_PASSWORD: str = "12345678"


    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

settings = Settings()
