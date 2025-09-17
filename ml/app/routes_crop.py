# app/routes_crop.py
from fastapi import APIRouter, HTTPException
import pandas as pd
from .schemas import CropFeatures, CropResponse, CropScore
from .model_registry import load_crop_model
from .deps_market import price_for, cost_for
from .utils_preprocess import sustainability

router = APIRouter()
# Load on import for speed
try:
    pipe, meta = load_crop_model()
except Exception:
    pipe, meta = None, {"crops": ["Wheat","Paddy","Maize","Mustard","Sugarcane"]}

@router.post("/predict/crops", response_model=CropResponse)
def predict_crops(payload: CropFeatures):
    if pipe is None:
        raise HTTPException(status_code=503, detail="Crop model not loaded yet. Train and save it first.")

    crops = payload.candidate_crops or meta.get("crops", [])
    if not crops:
        raise HTTPException(status_code=400, detail="No candidate crops provided and model meta missing.")

    rows = []
    for c in crops:
        rows.append({
            "ph": payload.ph,
            "moisture": payload.moisture,
            "n": payload.n, "p": payload.p, "k": payload.k,
            "rain_sum": payload.rain_sum,
            "tmin_avg": payload.tmin_avg, "tmax_avg": payload.tmax_avg,
            "humidity_avg": payload.humidity_avg, "wind_avg": payload.wind_avg,
            "prev_crop_1": payload.prev_crop_1, "prev_crop_2": payload.prev_crop_2,
            "village": payload.village, "state": payload.state,
            "irrigation": payload.irrigation, "area_ha": payload.area_ha,
            "lat": payload.lat, "lon": payload.lon,
            "sowing_month": payload.sowing_month,
            "crop": c
        })
    X = pd.DataFrame(rows)
    try:
        y_hat = pipe.predict(X)  # expected yield (q/ha)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")

    scored: list[CropScore] = []
    for i, c in enumerate(crops):
        px = price_for(c, payload.state)
        cx = cost_for(c, payload.state)
        sust = sustainability(payload.ph, payload.n, payload.p, payload.k,
                              payload.irrigation, payload.rain_sum)
        profit = float(y_hat[i]) * px - cx
        scored.append(CropScore(
            crop=c,
            expected_yield_q_per_ha=float(y_hat[i]),
            expected_price=float(px),
            cost_estimate=float(cx),
            expected_profit=float(profit),
            sustainability_score=float(sust),
            reasons=[
                "Soil pH & nutrients considered",
                "Weather window summary applied",
                "Latest market modal price used"
            ]
        ))

    scored.sort(key=lambda s: (s.expected_profit, s.expected_yield_q_per_ha, s.sustainability_score), reverse=True)
    return CropResponse(top=scored[:5])
