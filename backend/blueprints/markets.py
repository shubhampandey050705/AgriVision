from flask import Blueprint, request, jsonify
from pydantic import BaseModel, ValidationError, Field
from services.market_service import forecast

bp = Blueprint("markets", __name__, url_prefix="/api/markets")


class MarketReq(BaseModel):
    """Request model for market forecast.

    `commodity` and `mandi` are optional so that the endpoint can return a
    dummy forecast even when the frontend does not supply any payload.  This
    keeps the dashboard functional during early development where the real
    values might not yet be available.
    """

    commodity: str = "wheat"
    mandi: str = "delhi"
    horizon_days: int = Field(default=7, ge=1, le=30)


@bp.post("/forecast")
def markets_forecast():
    """Return a simple price forecast.

    If the client sends an empty body we fall back to the defaults defined in
    ``MarketReq``.  Any validation errors are reported with a 400 response
    rather than bubbling up as a 500.
    """

    if not request.data:
        body = MarketReq()
    else:
        try:
            body = MarketReq.model_validate_json(request.data)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

    out = forecast(body.commodity, body.mandi, body.horizon_days)
    return jsonify(out)
