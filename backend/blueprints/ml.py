# backend/blueprints/ml.py
from flask import Blueprint, request, jsonify
from pathlib import Path
import pandas as pd
import joblib, json

ml_bp = Blueprint("ml", __name__, url_prefix="/api/ml")

# --- resolve project root (…/backend/blueprints/ml.py -> go up 2 levels) ---
ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = ROOT / "ml" / "models"
MODEL_PATH = MODEL_DIR / "crop_reco_v1.joblib"
META_PATH  = MODEL_DIR / "crop_meta.json"

# --- load once on import ---
_pipe = joblib.load(MODEL_PATH)
_meta = json.loads(META_PATH.read_text(encoding="utf-8"))

FEATURES_NUM = _meta.get("features_num", [])
FEATURES_CAT = _meta.get("features_cat", [])
FEATURES_ALL = FEATURES_NUM + FEATURES_CAT


@ml_bp.route("/predict", methods=["POST"])
def predict():
    """
    Body: one object OR an array of objects with keys from crop_meta.json
    Returns: { predictions: [...], units: "quintals_per_hectare", count: N }
    """
    payload = request.get_json(force=True, silent=False)

    if isinstance(payload, dict):
        rows = [payload]
    elif isinstance(payload, list) and payload:
        rows = payload
    else:
        return jsonify(error="Body must be an object or non-empty array"), 400

    df = pd.DataFrame(rows)

    # ensure all expected columns exist and in correct order
    for col in FEATURES_ALL:
        if col not in df.columns:
            df[col] = pd.NA
    df = df[FEATURES_ALL]

    try:
        y = _pipe.predict(df)
    except Exception as e:
        return jsonify(error=f"Prediction failed: {e}"), 400

    return jsonify(
        predictions=[float(v) for v in y],
        units="quintals_per_hectare",
        count=len(y),
    ), 200


@ml_bp.get("/meta")
def meta():
    """Expose crops + schema so the frontend can adapt automatically."""
    return jsonify({
        "crops": _meta.get("crops", []),
        "features_num": _meta.get("features_num", []),
        "features_cat": _meta.get("features_cat", []),
        "target": _meta.get("target", "yield_q_per_ha"),
    }), 200
