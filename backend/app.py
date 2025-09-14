# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from config import Config
from db import Base, engine
from models import Field, User  # ensure models are imported so metadata is registered
from blueprints import register_blueprints

# Import your weather service
from services.weather_service import forecast



def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Accept /path and /path/ for all routes
    app.url_map.strict_slashes = False

    # ---- DB init ----
    Base.metadata.create_all(bind=engine)

    # ---- CORS ----
    default_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
    origins = getattr(Config, "CORS_ORIGINS", default_origins) or default_origins
    CORS(
        app,
        resources={r"/api/*": {"origins": origins}},
        supports_credentials=True,
        expose_headers=["Content-Type"],
    )

    # ---- Blueprints (must include /api/auth/register in your blueprints) ----
    register_blueprints(app)

    # ---- Health/Index ----
    @app.get("/")
    def index():
        return jsonify({"service": "AgriVision API", "health": "/api/healthz"}), 200

    @app.get("/api/healthz")
    def healthz():
        return jsonify({"status": "ok"}), 200

    # ---- Weather API ----
    @app.get("/api/weather")
    def get_weather():
        """Fetch forecast for a given city or coordinates."""
        from flask import request
        city = request.args.get("city")
        lat = request.args.get("lat", type=float)
        lon = request.args.get("lon", type=float)

        if city:
            return jsonify(forecast(city=city)), 200
        elif lat is not None and lon is not None:
            return jsonify(forecast(lat=lat, lon=lon)), 200
        else:
            return jsonify({"error": "Provide either ?city=Delhi or ?lat=..&lon=.."}), 400

    # ---- Error handlers (always return JSON) ----
    @app.errorhandler(400)
    @app.errorhandler(404)
    @app.errorhandler(405)
    @app.errorhandler(413)
    @app.errorhandler(415)   # unsupported media type
    @app.errorhandler(422)   # validation errors
    def handled_http_errors(err):
        code = getattr(err, "code", 500)
        msg = getattr(err, "description", str(err))
        return jsonify({"error": f"{code} {msg}"}), code

    @app.errorhandler(Exception)
    def unhandled(err):
        if isinstance(err, HTTPException):
            return handled_http_errors(err)
        # TODO: log traceback in production
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
    # Use 0.0.0.0 so frontend can reach backend on Docker/Render/other devices
    app.run(host="0.0.0.0", port=5000, debug=True)
