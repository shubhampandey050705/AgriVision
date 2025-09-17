# app/deps_market.py
import pandas as pd
from functools import lru_cache
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / "data"

@lru_cache(maxsize=64)
def price_for(crop: str, state: str) -> float:
    file = DATA / "market_prices.csv"
    if not file.exists():
        return 0.0
    df = pd.read_csv(file)
    df = df[(df["crop"]==crop) & (df["state"]==state)]
    if df.empty: return 0.0
    latest = df.sort_values("date").tail(1)["modal"].values[0]
    return float(latest)

def cost_for(crop: str, state: str) -> float:
    base = {
        "Wheat": 9000,
        "Paddy": 11000,
        "Maize": 8000,
        "Mustard": 7000,
        "Sugarcane": 45000
    }
    return float(base.get(crop, 10000))
