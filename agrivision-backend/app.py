# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from config import Config
from db import Base, engine
from models import Field  # ensure model module is imported so metadata is registered
from blueprints import register_blueprints

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Accept /path and /path/ for all routes
    app.url_map.strict_slashes = False

    # ---- DB init ----
    Base.metadata.create_all(bind=engine)

    # ---- CORS ----
    # Use Config.CORS_ORIGINS if provided, otherwise allow Vite dev origins.
    default_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
    origins = getattr(Config, "CORS_ORIGINS", default_origins) or default_origins
    # Correct flask-cors signature: supports_credentials is a top-level arg
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
    # 127.0.0.1 avoids some Windows firewall prompts; change to 0.0.0.0 if needed.
    app.run(host="127.0.0.1", port=5000, debug=True)
