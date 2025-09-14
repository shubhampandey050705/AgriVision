# backend/models.py
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, func, UniqueConstraint, Index
)
from db import Base


# ---------------------------
# User model (for /api/auth/*)
# ---------------------------
class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("email", name="uq_users_email"),
        # Optional but helpful for your OTP flow—enforce unique phone if you want 1 user per phone:
        # UniqueConstraint("phone", name="uq_users_phone"),
        Index("ix_users_phone", "phone"),
        Index("ix_users_email", "email"),
    )

    id            = Column(Integer, primary_key=True)
    name          = Column(String(120), nullable=False)
    email         = Column(String(120), nullable=False)   # stored lowercase in routes
    phone         = Column(String(20),  nullable=True)    # 10 digits for India; kept string
    village       = Column(String(120), nullable=True)
    pincode       = Column(String(12),  nullable=True)

    # Password (used for email/password login path)
    password_hash = Column(String(255), nullable=True)

    # OTP login support
    otp_code      = Column(String(8),  nullable=True)     # 4–8 digits (we send 6)
    otp_expires   = Column(DateTime,   nullable=True)     # UTC expiry time

    created_at    = Column(DateTime, server_default=func.now())

    def to_public_dict(self):
        # Do NOT include password_hash / otp fields in responses
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "village": self.village,
            "pincode": self.pincode,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} phone={self.phone}>"



# ---------------------------
# Field model (existing)
# ---------------------------
class Field(Base):
    __tablename__ = "fields"

    id         = Column(Integer, primary_key=True)
    name       = Column(String(120), nullable=False)
    village    = Column(String(120), nullable=False)
    area       = Column(Float, nullable=False, default=0.0)
    soil_type  = Column(String(80),  nullable=False, default="Unknown")
    irrigation = Column(String(80),  nullable=False, default="Unknown")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "village": self.village,
            "area": self.area,
            "soilType": self.soil_type,
            "irrigation": self.irrigation,
        }
