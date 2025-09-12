# blueprints/auth.py
from flask import Blueprint, request, jsonify, current_app
from time import time
import random

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

_OTP_STORE = {}  # phone -> {"code": "123456", "exp": epoch}

def _now(): return int(time())

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

    # success -> create session/JWT (skipping for demo)
    _OTP_STORE.pop(phone, None)
    return jsonify(message="Login success", token="demo-jwt"), 200
