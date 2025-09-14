import os

class Config:
    _origins = os.getenv("CORS_ORIGINS")
    if _origins:
        CORS_ORIGINS = [o.strip() for o in _origins.split(",") if o.strip()]
    else:
        CORS_ORIGINS = [
            "http://localhost:5173","http://127.0.0.1:5173",
            "http://localhost:5174","http://127.0.0.1:5174",
        ]

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///agrivision.db")
<<<<<<< HEAD
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 8 * 1024 * 1024))  # 8 MB uploads
    # Secret key for JWT signing/session management
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
=======
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 8 * 1024 * 1024))
>>>>>>> 16afa67 (feat(auth): add password login + OTP)
