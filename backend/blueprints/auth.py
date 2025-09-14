<<<<<<< HEAD
# blueprints/auth.py
from datetime import datetime, timedelta
import random
from time import time

import jwt
from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import select

from db import SessionLocal
=======
# backend/blueprints/auth.py
from flask import Blueprint, request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
import random
>>>>>>> 16afa67 (feat(auth): add password login + OTP)
from models import User

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# -------- helpers --------
def _gen_otp(n=6):
    start, end = 10 ** (n - 1), (10 ** n) - 1
    return str(random.randint(start, end))

<<<<<<< HEAD

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

=======
def _find_user_by_identifier(identifier: str):
    """identifier may be email or phone."""
    if "@" in identifier:
        return g.db.query(User).filter(User.email == identifier.lower()).first()
    return g.db.query(User).filter(User.phone == identifier).first()
>>>>>>> 16afa67 (feat(auth): add password login + OTP)


# -------- register (password required) --------
@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name    = (data.get("name") or "").strip()
    email   = (data.get("email") or "").strip().lower()
    phone   = (data.get("phone") or "").strip()
    village = (data.get("village") or "").strip()
    pincode = (data.get("pincode") or "").strip()
    password = (data.get("password") or "").strip()

    if not all([name, email, phone, village, password]):
        return jsonify({"error": "Missing required fields (name, email, phone, village, password)"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    u = User(
        name=name,
        email=email,
        phone=phone,
        village=village,
        pincode=pincode or None,
        password_hash=generate_password_hash(password),
    )

    try:
        g.db.add(u)
        g.db.flush()
    except IntegrityError:
        g.db.rollback()
        return jsonify({"error": "User already exists"}), 400

    return jsonify({"message": "Registered", "user": u.to_public_dict()}), 201


# -------- login (email OR phone + password) --------
@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    identifier = (data.get("identifier") or data.get("email") or data.get("phone") or "").strip()
    password   = (data.get("password") or "").strip()

    if not identifier or not password:
        return jsonify({"error": "identifier and password are required"}), 400

    # normalize
    if "@" in identifier:
        identifier = identifier.lower()

    u = _find_user_by_identifier(identifier)
    if not u:
        return jsonify({"error": "User not found"}), 404

    if not check_password_hash(u.password_hash or "", password):
        return jsonify({"error": "Invalid credentials"}), 401

    # If you want JWT, replace "dev-token" with a real token
    return jsonify({"message": "Login ok", "user": u.to_public_dict(), "token": "dev-token"}), 200


# -------- OTP (unchanged, optional) --------
@bp.post("/request-otp")
def request_otp():
    data = request.get_json(silent=True) or {}
    phone = (data.get("phone") or "").strip()
    if not phone.isdigit() or len(phone) != 10:
        return jsonify({"error": "Valid 10-digit phone required"}), 400

    u = g.db.query(User).filter_by(phone=phone).first()
    if not u:
        return jsonify({"error": "No user with this phone"}), 404

    u.otp_code = _gen_otp(6)
    u.otp_expires = datetime.utcnow() + timedelta(minutes=5)
    g.db.flush()

    return jsonify({"message": "OTP sent", "dev_otp": u.otp_code}), 200



@bp.post("/verify-otp")
def verify_otp():
    data = request.get_json(silent=True) or {}
    phone = (data.get("phone") or "").strip()
    otp   = (data.get("otp") or "").strip()

<<<<<<< HEAD
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
=======
    u = g.db.query(User).filter_by(phone=phone).first()
    if not u or not u.otp_code:
        return jsonify({"error": "OTP not requested"}), 400
    if u.otp_code != otp:
        return jsonify({"error": "Invalid OTP"}), 401
    if u.otp_expires and datetime.utcnow() > u.otp_expires:
        return jsonify({"error": "OTP expired"}), 401

    u.otp_code = None
    u.otp_expires = None
    g.db.flush()
    return jsonify({"message": "Login ok", "user": u.to_public_dict(), "token": "dev-token"}), 200
>>>>>>> 16afa67 (feat(auth): add password login + OTP)
