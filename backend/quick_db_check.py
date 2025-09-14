from sqlalchemy import create_engine, text
from db import SQLALCHEMY_DATABASE_URL

print("URL:", SQLALCHEMY_DATABASE_URL)
engine = create_engine(SQLALCHEMY_DATABASE_URL, future=True)
with engine.connect() as conn:
    print("SELECT 1 ->", conn.execute(text("SELECT 1")).scalar())
