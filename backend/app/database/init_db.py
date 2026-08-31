import logging
from app.database.session import engine, Base
import app.models  # Ensures all models are registered

logger = logging.getLogger(__name__)

def init_db():
    logger.info("Creating database tables if not existing...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")
    except Exception as e:
        logger.error(f"Error during init_db: {e}")
        raise e
