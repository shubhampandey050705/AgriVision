# app/settings.py
import os

class Settings:
    PROJECT_NAME: str = "AgriVision ML Service"
    VERSION: str = "1.0.0"

    # Paths
    DATA_PATH: str = os.getenv("DATA_PATH", "data")
    MODELS_PATH: str = os.getenv("MODELS_PATH", "models")

    # CORS
    ALLOWED_ORIGINS: list[str] = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

    # Security
    API_KEY: str = os.getenv("ML_API_KEY", "changeme")  # secure in prod!

settings = Settings()
