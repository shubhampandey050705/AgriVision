# app/schemas.py
from typing import List, Optional
from pydantic import BaseModel, Field

class CropFeatures(BaseModel):
    ph: float
    moisture: float
    n: float
    p: float
    k: float
    tmin_avg: float
    tmax_avg: float
    rain_sum: float
    humidity_avg: float
    wind_avg: float
    prev_crop_1: Optional[str] = None
    prev_crop_2: Optional[str] = None
    village: Optional[str] = None
    state: str
    irrigation: Optional[str] = None
    area_ha: float
    lat: float
    lon: float
    sowing_month: int
    candidate_crops: Optional[List[str]] = None

class CropScore(BaseModel):
    crop: str
    expected_yield_q_per_ha: float
    expected_price: float
    cost_estimate: float
    expected_profit: float
    sustainability_score: float
    reasons: List[str] = []

class CropResponse(BaseModel):
    top: List[CropScore]

# app/model_registry.py
import json, joblib
from pathlib import Path

MODELS = Path(__file__).resolve().parents[1] / "models"

def load_crop_model():
    pipe = joblib.load(MODELS / "crop_reco_v1.joblib")
    meta = json.loads((MODELS / "crop_meta.json").read_text())
    return pipe, meta

def load_disease_model():
    import tensorflow as tf, ast
    model = tf.keras.models.load_model(MODELS / "disease_efficientnet_v1.keras")
    labels = ast.literal_eval((MODELS / "disease_labels.json").read_text())
    return model, labels

# app/deps_market.py
import pandas as pd
from functools import lru_cache
from pathlib import Path
DATA = Path(__file__).resolve().parents[1] / "data"

@lru_cache(maxsize=64)
def price_for(crop: str, state: str) -> float:
    df = pd.read_csv(DATA / "market_prices.csv")
    df = df[df["crop"]==crop]
    df = df[df["state"]==state]
    if df.empty: return 0.0
    latest = df.sort_values("date").tail(1)["modal"].values[0]
    return float(latest)

def cost_for(crop: str, state: str) -> float:
    # simple placeholder: tune with real agronomy inputs
    base = {
        "Wheat": 9000, "Paddy": 11000, "Maize": 8000,
        "Mustard": 7000, "Sugarcane": 45000
    }
    return float(base.get(crop, 10000))

# app/utils_preprocess.py
def sustainability(ph, n, p, k, irrigation, rain_sum) -> float:
    score = 80.0
    if ph < 6.0 or ph > 7.8: score -= 10
    if rain_sum < 10 and (irrigation or "").lower() != "drip": score -= 5
    # light NPK heuristic
    if n > 100 or p > 60 or k > 120: score -= 10
    return max(0.0, min(100.0, score))

# app/routes_crop.py
from fastapi import APIRouter
import pandas as pd
from .schemas import CropFeatures, CropResponse, CropScore
from .model_registry import load_crop_model
from .deps_market import price_for, cost_for
from .utils_preprocess import sustainability

router = APIRouter()
pipe, meta = load_crop_model()

@router.post("/predict/crops", response_model=CropResponse)
def predict_crops(payload: CropFeatures):
    crops = payload.candidate_crops or meta["crops"]
    # build a df row per candidate crop using the same feature order used in training
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
    y_hat = pipe.predict(X)  # expected yield q/ha

    scored = []
    for i, c in enumerate(crops):
        px = price_for(c, payload.state)
        cx = cost_for(c, payload.state)
        sust = sustainability(payload.ph, payload.n, payload.p, payload.k, payload.irrigation, payload.rain_sum)
        profit = float(y_hat[i]) * px - cx
        scored.append(CropScore(
            crop=c,
            expected_yield_q_per_ha=float(y_hat[i]),
            expected_price=px,
            cost_estimate=cx,
            expected_profit=profit,
            sustainability_score=sust,
            reasons=[
              "Soil pH & nutrients considered",
              "Weather window summarized",
              "Market modal price applied"
            ]
        ))
    scored.sort(key=lambda s: (s.expected_profit, s.expected_yield_q_per_ha, s.sustainability_score), reverse=True)
    return CropResponse(top=scored[:5])

# app/routes_disease.py
from fastapi import APIRouter, UploadFile, File
import numpy as np
from PIL import Image
import io, tensorflow as tf
from .model_registry import load_disease_model

router = APIRouter()
model, labels = load_disease_model()
IMG_SIZE = (224,224)

@router.post("/predict/disease")
async def predict_disease(file: UploadFile = File(...)):
    img = Image.open(io.BytesIO(await file.read())).convert("RGB").resize(IMG_SIZE)
    arr = np.array(img)[None,...]
    logits = model.predict(arr)
    idx = int(np.argmax(logits, axis=1)[0])
    conf = float(np.max(tf.nn.softmax(logits)))
    return {"diagnosis": labels[idx], "confidence": conf}
