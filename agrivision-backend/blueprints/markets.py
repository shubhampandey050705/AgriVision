from flask import Blueprint, request, jsonify
from pydantic import BaseModel, ValidationError, Field
from services.market_service import forecast

bp = Blueprint("markets", __name__, url_prefix="/api/markets")

class MarketReq(BaseModel):
    commodity: str
    mandi: str
    horizon_days: int = Field(default=7, ge=1, le=30)

@bp.post("/forecast")
def markets_forecast():
    try:
        body = MarketReq.model_validate_json(request.data)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400
    out = forecast(body.commodity, body.mandi, body.horizon_days)
    return jsonify(out)
