# blueprints/auth.py
from datetime import datetime, timedelta
import random
from time import time

import jwt
from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import select

from db import SessionLocal
from models import User

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

_OTP_STORE = {}  # phone -> {"code": "123456", "exp": epoch}


def _now() -> int:
    return int(time())


@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    village = (data.get("village") or "").strip()
    if not all([name, email, phone, village]):
        return jsonify(error="All fields are required"), 400
    with SessionLocal() as db:
        exists = db.execute(
            select(User).where((User.email == email) | (User.phone == phone))
        ).scalar_one_or_none()
        if exists:
            return jsonify(error="User already exists"), 400
        user = User(name=name, email=email, phone=phone, village=village)
        db.add(user)
        db.commit()
        db.refresh(user)
        return (
            jsonify(
                {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "phone": user.phone,
                    "village": user.village,
                }
            ),
            201,
        )


@bp.post("/request-otp")
def request_otp():
    data = request.get_json(silent=True) or {}
    phone = (data.get("phone") or "").strip()
    if not phone:
        return jsonify(error="Phone is required"), 400

    code = f"{random.randint(0, 999999):06d}"
    _OTP_STORE[phone] = {"code": code, "exp": _now() + 300}  # 5 min
    print(f"[DEV] OTP for {phone} = {code}")  # visible in Flask console

    # In dev you can return it to the client to simplify testing:
    if current_app.config.get("ENV", "development") != "production":
        return jsonify(message="OTP generated (dev)", dev_otp=code), 200

    return jsonify(message="OTP sent"), 200


@bp.post("/verify-otp")
def verify_otp():
    data = request.get_json(silent=True) or {}
    phone = (data.get("phone") or "").strip()
    otp = (data.get("otp") or "").strip()
    entry = _OTP_STORE.get(phone)
    if not entry:
        return jsonify(error="Request OTP first"), 400
    if _now() > entry["exp"]:
        return jsonify(error="OTP expired"), 400
    if otp != entry["code"]:
        return jsonify(error="Invalid OTP"), 400

    with SessionLocal() as db:
        user = db.execute(select(User).where(User.phone == phone)).scalar_one_or_none()
        if not user:
            return jsonify(error="User not found"), 404

    _OTP_STORE.pop(phone, None)

    payload = {
        "sub": user.id,
        "phone": user.phone,
        "exp": datetime.utcnow() + timedelta(days=7),
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    return jsonify(message="Login success", token=token), 200
