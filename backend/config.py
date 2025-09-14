import os

class Config:
    # CORS: set your frontend origin in prod
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
    # SQLite file in backend/ by default
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///agrivision.db")
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 8 * 1024 * 1024))  # 8 MB uploads
    # Secret key for JWT signing/session management
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
