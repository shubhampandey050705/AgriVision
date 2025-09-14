# agrivision-backend/blueprints/__init__.py
from .health import bp as health_bp
from .fields import bp as fields_bp
from .markets import bp as markets_bp
from .weather import bp as weather_bp
from .detect import bp as detect_bp
from .recommendations import bp as recs_bp
from .auth import bp as auth_bp  # <-- ensures /api/auth/* exists

def register_blueprints(app):
    app.register_blueprint(health_bp)
    app.register_blueprint(fields_bp)
    app.register_blueprint(markets_bp)
    app.register_blueprint(weather_bp)
    app.register_blueprint(detect_bp)
    app.register_blueprint(recs_bp)
    app.register_blueprint(auth_bp)  # <-- /api/auth/register & /api/auth/login
