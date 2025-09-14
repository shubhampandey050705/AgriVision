from sqlalchemy import Column, Integer, String, Float
from db import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    phone = Column(String, nullable=False, unique=True, index=True)
    village = Column(String, nullable=True)


class Field(Base):
    __tablename__ = "fields"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    area = Column(Float, nullable=True)          # acres
    soilType = Column(String, nullable=True)
    irrigation = Column(String, nullable=True)
    village = Column(String, nullable=True)
