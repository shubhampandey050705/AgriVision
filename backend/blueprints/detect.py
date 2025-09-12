from flask import Blueprint, request, jsonify
from services.disease_service import predict as predict_disease

bp = Blueprint("detect", __name__, url_prefix="/api")

@bp.post("/detect")
def detect():
    if "image" not in request.files:
        return jsonify({"error": "image required"}), 400
    file = request.files["image"]
    content = file.read()
    out = predict_disease(content)
    return jsonify(out)
