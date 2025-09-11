from flask import Blueprint, request, jsonify
from services.weather_service import forecast

bp = Blueprint("weather", __name__, url_prefix="/api/weather")

@bp.get("/forecast")
def weather_forecast():
    try:
        lat = float(request.args.get("lat", "0"))
        lon = float(request.args.get("lon", "0"))
        days = int(request.args.get("days", "7"))
    except ValueError:
        return jsonify({"error": "invalid query params"}), 400
    return jsonify(forecast(lat, lon, days))
