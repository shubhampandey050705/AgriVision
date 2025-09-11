from flask import Blueprint, request, jsonify
from pydantic import BaseModel, ValidationError

from services.rec_service import predict

bp = Blueprint("recommendations", __name__, url_prefix="/api")

class RecRequest(BaseModel):
    fieldId: str | None = None
    location: dict | None = None  # {"lat": .., "lon": ..}
    soil: dict | None = None      # {"pH":.., "N":.., ...}
    season: str | None = "kharif"
    constraints: dict | None = None

@bp.post("/recommendations")
def recommendations():
    try:
        data = RecRequest.model_validate_json(request.data)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400
    out = predict(data.model_dump())
    return jsonify(out)
