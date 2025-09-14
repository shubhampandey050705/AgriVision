# backend/app.py
from flask import Flask, jsonify, g, request, make_response
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from sqlalchemy import text

from config import Config
from db import Base, engine, SessionLocal
from models import Field, User        # <-- FIXED: import User correctly
from blueprints import register_blueprints

# Weather service
from services.weather_service import forecast


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Accept both `/path` and `/path/`
    app.url_map.strict_slashes = False

    # ---- DB init (create tables if not exist) ----
    # IMPORTANT: ensure all models are imported BEFORE this line
    Base.metadata.create_all(bind=engine)

    # Make session factory available to blueprints if needed
    app.config["SESSION_FACTORY"] = SessionLocal

    # ---- CORS ----
    default_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",

    ]
    origins = getattr(Config, "CORS_ORIGINS", default_origins) or default_origins

    # This enables proper preflight handling for /api/*, including OPTIONS
    CORS(
        app,
        resources={r"/api/*": {"origins": origins}},
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Content-Type"],
    )

    # Extra safety: acknowledge OPTIONS preflight
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            resp = make_response("", 204)
            return resp

    # ---- Session-per-request plumbing ----
    @app.before_request
    def open_session():
        g.db = SessionLocal()

    @app.teardown_request
    def close_session(exc):
        db = getattr(g, "db", None)
        if db is None:
            return
        try:
            if exc is None:
                db.commit()
            else:
                db.rollback()
        finally:
            db.close()

    # ---- Blueprints ----
    register_blueprints(app)  # must register /api/auth/*, /api/*, etc.

    # ---- Health/Index ----
    @app.get("/")
    def index():
        return jsonify({"service": "AgriVision API", "health": "/api/healthz"}), 200

    @app.get("/api/healthz")
    def healthz():
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        except Exception as e:
            return jsonify({"status": "degraded", "db": "down", "error": str(e)}), 503
        return jsonify({"status": "ok", "db": "up"}), 200

    # ---- Fields CRUD ----
    @app.get("/api/field")
    def get_fields():
        rows = g.db.query(Field).order_by(Field.id).all()
        return jsonify([r.to_dict() for r in rows]), 200

    @app.post("/api/field")
    def create_field():
        data = request.get_json(silent=True) or {}
        required = ("name", "village")
        missing = [k for k in required if not data.get(k)]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        f = Field(
            name=data["name"],
            village=data["village"],
            area=float(data.get("area", 0.0)),
            soil_type=data.get("soilType", "Unknown"),
            irrigation=data.get("irrigation", "Unknown"),
        )
        g.db.add(f)
        g.db.flush()
        return jsonify(f.to_dict()), 201

    @app.get("/api/field/<int:field_id>")
    def get_field(field_id):
        f = g.db.get(Field, field_id)
        if not f:
            return jsonify({"error": "Field not found"}), 404
        return jsonify(f.to_dict()), 200

    @app.put("/api/field/<int:field_id>")
    def update_field(field_id):
        f = g.db.get(Field, field_id)
        if not f:
            return jsonify({"error": "Field not found"}), 404

        data = request.get_json(silent=True) or {}
        if "name" in data:
            f.name = data["name"]
        if "village" in data:
            f.village = data["village"]
        if "area" in data:
            try:
                f.area = float(data["area"])
            except (TypeError, ValueError):
                return jsonify({"error": "Invalid 'area' value"}), 400
        if "soilType" in data:
            f.soil_type = data["soilType"]
        if "irrigation" in data:
            f.irrigation = data["irrigation"]

        g.db.flush()
        return jsonify(f.to_dict()), 200

    @app.delete("/api/field/<int:field_id>")
    def delete_field(field_id):
        f = g.db.get(Field, field_id)
        if not f:
            return jsonify({"error": "Field not found"}), 404
        g.db.delete(f)
        return jsonify({"deleted": field_id}), 200

    # ---- Weather API ----
    @app.get("/api/weather")
    def get_weather():
        city = request.args.get("city")
        lat = request.args.get("lat", type=float)
        lon = request.args.get("lon", type=float)

        if city:
            return jsonify(forecast(city=city)), 200
        elif lat is not None and lon is not None:
            return jsonify(forecast(lat=lat, lon=lon)), 200
        else:
            return jsonify({"error": "Provide either ?city=Delhi or ?lat=..&lon=.."}), 400

    # ---- JSON Error handlers ----
    @app.errorhandler(400)
    @app.errorhandler(404)
    @app.errorhandler(405)
    @app.errorhandler(413)
    @app.errorhandler(415)
    @app.errorhandler(422)
    def handled_http_errors(err):
        db = getattr(g, "db", None)
        if db is not None:
            db.rollback()

        code = getattr(err, "code", 500)
        msg = getattr(err, "description", str(err))
        return jsonify({"error": f"{code} {msg}"}), code

    @app.errorhandler(Exception)
    def unhandled(err):
        db = getattr(g, "db", None)
        if db is not None:
            db.rollback()

        if isinstance(err, HTTPException):
            return handled_http_errors(err)
        return jsonify({"error": "500 Internal Server Error"}), 500

    # ---- Debug: print all registered routes on startup ----
    try:
        print("\n--- Registered routes ---")
        for r in sorted(app.url_map.iter_rules(), key=lambda x: x.rule):
            print(f"{r.rule:40s}  {','.join(sorted(r.methods))}")
        print("-------------------------\n")
    except Exception:
        pass

    return app


if __name__ == "__main__":
    app = create_app()
    # 0.0.0.0 so frontend or other devices/containers can reach it
    app.run(host="0.0.0.0", port=5000, debug=True)
