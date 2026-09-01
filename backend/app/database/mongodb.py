import logging
from typing import Optional
from pymongo import MongoClient
from app.core.config import settings

logger = logging.getLogger("parkease.mongodb")

mongodb_client: Optional[MongoClient] = None
mongodb_db = None

def get_mongodb_client() -> Optional[MongoClient]:
    global mongodb_client, mongodb_db
    if mongodb_client is None:
        mongo_uri = getattr(settings, "MONGODB_URL", "mongodb://localhost:27017/parkease")
        try:
            mongodb_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
            # Ping connection
            mongodb_client.admin.command('ping')
            db_name = mongo_uri.split("/")[-1].split("?")[0] or "parkease"
            mongodb_db = mongodb_client[db_name]
            logger.info(f"Connected to MongoDB database: {db_name}")
        except Exception as e:
            logger.warning(f"MongoDB connection notice ({mongo_uri}): {e}. Using database service.")
            return None
    return mongodb_client

def get_mongo_db():
    global mongodb_db
    if mongodb_db is None:
        get_mongodb_client()
    return mongodb_db

# Helper collections
def get_users_collection():
    db = get_mongo_db()
    return db["users"] if db is not None else None

def get_otps_collection():
    db = get_mongo_db()
    return db["email_otps"] if db is not None else None

def get_bookings_collection():
    db = get_mongo_db()
    return db["bookings"] if db is not None else None

def get_wallets_collection():
    db = get_mongo_db()
    return db["wallets"] if db is not None else None
