from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import setup_logger
import os

load_dotenv()

logger = setup_logger()
def configure_cors(app):
    raw_origins = os.getenv("ALLOWED_ORIGINS", "")
    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
        allow_headers=["*"],
    )
