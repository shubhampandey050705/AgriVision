import os
from urllib.parse import quote_plus
from dotenv import load_dotenv              # <-- add
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()                               # <-- ensure .env is loaded here

DB_USER = os.getenv("DB_USER", "agri_user")
DB_PASS = quote_plus(os.getenv("DB_PASS", ""))  # encodes @ etc.
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "agrivision")

# Guard against accidental bad values like '4451@localhost'
assert "@" not in DB_HOST, f"Invalid DB_HOST value: {DB_HOST}"
assert "@" not in DB_USER, f"Invalid DB_USER value: {DB_USER}"

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=280,
    future=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()
