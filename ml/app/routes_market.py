# app/routes_market.py
from fastapi import APIRouter, HTTPException, Query
import pandas as pd, joblib, json
from pathlib import Path
from .settings import settings

router = APIRouter()
MODELS = Path(__file__).resolve().parents[1] / "models"
DATA = Path(settings.DATA_PATH)

def _load_registry():
    meta_path = MODELS / "market_meta.json"
    if not meta_path.exists():
        return {"models": [], "horizon": 7}
    return json.loads(meta_path.read_text())

@router.get("/predict/market")
def predict_market(
    crop: str = Query(..., description="Crop name, e.g. Wheat"),
    state: str = Query(..., description="State name, e.g. UP"),
    horizon: int = Query(7, description="Days to forecast (default=7)")
):
    """
    Forecast mandi modal prices for the next N days (per crop,state).
    Uses trained XGBoost model artifacts saved in /models.
    """
    registry = _load_registry()
    entry = next(
        (m for m in registry["models"]
         if m["crop"].lower() == crop.lower() and m["state"].lower() == state.lower()),
        None
    )
    if not entry:
        raise HTTPException(404, f"No trained market model for crop={crop}, state={state}")

    # Load model + features
    blob = joblib.load(MODELS / entry["path"])
    model, feat_cols = blob["model"], blob["feat_cols"]

    # Load recent history
    prices = pd.read_csv(DATA / "market_prices.csv")
    prices["date"] = pd.to_datetime(prices["date"])
    hist = prices[
        (prices["crop"].str.lower() == crop.lower()) &
        (prices["state"].str.lower() == state.lower())
    ][["date", "modal"]].dropna().sort_values("date")

    if len(hist) < 60:
        raise HTTPException(400, "Not enough recent history to forecast.")

    # Import helper funcs from training script
    from training.train_markets import _make_time_features, _recursive_forecast

    hist_feats = _make_time_features(hist)
    future = _recursive_forecast(hist_feats.tail(60), model, feat_cols, horizon)

    return {
        "crop": crop,
        "state": state,
        "horizon": horizon,
        "forecast": future.to_dict(orient="records"),
        "metrics": {
            "mae": entry.get("mae"),
            "mape": entry.get("mape"),
            "n_train": entry.get("n_train"),
            "n_val": entry.get("n_val"),
        }
    }
