# ml/app/main.py
from __future__ import annotations

import json
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from .settings import settings
from .routes_crop import router as crop_router
from .routes_disease import router as disease_router
from .routes_market import router as market_router

# --------------------------------------------------------------------------------------
# Paths
# --------------------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parents[1]          # .../ml
MODELS = ROOT / "models"
CROP_META_PATH = MODELS / "crop_meta.json"


# --------------------------------------------------------------------------------------
# Lifespan: load lightweight metadata on startup
# --------------------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.crop_meta: Optional[Dict[str, Any]] = None
    try:
        if CROP_META_PATH.exists():
            app.state.crop_meta = json.loads(CROP_META_PATH.read_text(encoding="utf-8"))
    except Exception:
        # Don't block startup if meta can't be read
        app.state.crop_meta = None
    yield
    # graceful shutdown hooks (none)


# --------------------------------------------------------------------------------------
# App
# --------------------------------------------------------------------------------------
app = FastAPI(
    title=getattr(settings, "PROJECT_NAME", "AgriVision ML"),
    version=getattr(settings, "VERSION", "0.1.0"),
    description="AgriVision ML microservice: Crop Recommendation, Disease Detection, Market Trends",
    lifespan=lifespan,
)

# --------------------------------------------------------------------------------------
# CORS
# --------------------------------------------------------------------------------------
allowed_origins: List[str] = getattr(settings, "ALLOWED_ORIGINS", []) or [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ["*"] else ["*"],
    allow_credentials=False if allowed_origins == ["*"] else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------------------------------------------
# Routes (system)
# --------------------------------------------------------------------------------------
@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")


@app.get("/api/health", tags=["System"])
def health():
    return {
        "ok": True,
        "service": getattr(settings, "PROJECT_NAME", "AgriVision ML"),
        "version": getattr(settings, "VERSION", "0.1.0"),
        "env": getattr(settings, "ENV", "dev"),
        "endpoints": [
            "/api/ml/meta",
            "/api/info",
            "/api/predict/crops",
            "/api/predict/disease",
            "/api/predict/market",
        ],
    }


@app.get("/api/info", tags=["System"])
def info():
    meta = getattr(app.state, "crop_meta", None)
    payload: Dict[str, Any] = {
        "service": getattr(settings, "PROJECT_NAME", "AgriVision ML"),
        "version": getattr(settings, "VERSION", "0.1.0"),
        "models_path": str(MODELS),
        "crop_meta_present": bool(meta is not None),
    }
    if meta:
        payload.update(
            {
                "crops": meta.get("crops", []),
                "target": meta.get("target"),
                "features_num": meta.get("features_num", []),
                "features_cat": meta.get("features_cat", []),
                "metrics": meta.get("metrics", {}),
            }
        )
    return payload


# ---- Meta for frontend (exact shape expected by Dashboard.jsx) ----
@app.get("/api/ml/meta", tags=["System"])
def ml_meta():
    meta = getattr(app.state, "crop_meta", None)
    if meta:
        return {
            "crops": meta.get("crops", []),
            "features_num": meta.get("features_num", []),
            "features_cat": meta.get("features_cat", []),
        }

    # Safe fallback if models/crop_meta.json is missing
    return {
        "crops": [
            # 🌾 Cereals
            "Rice", "Wheat", "Maize", "Barley",
            "Sorghum (Jowar)", "Pearl Millet (Bajra)", "Finger Millet (Ragi)", "Small Millets",
            # 🌱 Pulses
            "Chickpea (Gram)", "Pigeonpea (Tur/Arhar)", "Lentil (Masoor)",
            "Black Gram (Urad)", "Green Gram (Moong)", "Peas (Matar)",
            "Horse Gram (Kulthi)", "Cowpea (Lobia)",
            # 🛢️ Oilseeds
            "Groundnut (Peanut)", "Mustard", "Soybean", "Sunflower",
            "Sesame (Til)", "Castor Seed", "Linseed", "Niger Seed",
            # 💰 Commercial / Cash
            "Sugarcane", "Cotton", "Jute", "Tobacco", "Tea", "Coffee", "Rubber", "Indigo",
            # 🍎 Fruits (optional for ML)
            "Mango", "Banana", "Guava", "Apple", "Grapes", "Pomegranate",
            "Papaya", "Citrus (Orange/Lemon/Mosambi)", "Litchi", "Pineapple", "Sapota (Chiku)"
        ],
        "features_num": [
            "ph","moisture","n","p","k",
            "rain_sum","tmin_avg","tmax_avg","humidity_avg","wind_avg",
            "area_ha","lat","lon","sowing_month"
        ],
        "features_cat": ["prev_crop_1","prev_crop_2","village","state","irrigation"],
    }


# --------------------------------------------------------------------------------------
# Routers (domain)
# --------------------------------------------------------------------------------------
# Your routers should define endpoints like:
#   POST /api/predict/crops
#   POST /api/predict/disease
#   GET  /api/market/...
app.include_router(crop_router, prefix="/api", tags=["Crop Recommendation"])
app.include_router(disease_router, prefix="/api", tags=["Disease Detection"])
app.include_router(market_router, prefix="/api", tags=["Market Forecast"])

