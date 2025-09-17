# training/train_crop.py
import argparse
import json
from pathlib import Path
import warnings
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from xgboost import XGBRegressor

warnings.filterwarnings("ignore", category=UserWarning)

# --------------------------------------------------------------------------------------
# Paths
# --------------------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
MODELS = ROOT / "models"

# Your uploaded files (names as provided)
CANDIDATE_FILES = {
    "soil": "soil_health.csv",               # has N, P, K, ph (+ micros)
    "weather": "Weather.csv",                # has Date, MaxT, MinT, RH1, RH2, Wind, Rain, Lat, Lon, Cum_Rain, ...
    "yields": "crop_yield_history.csv",      # has Crop, Area_ha, Yield_kg_per_ha, Temperature_C, Humidity_%, pH, Rainfall_mm, Wind_Speed_m_s, ...
    "hist": "crop_history.csv",              # field_id, prev_crop_1, prev_crop_2
    "fields": "fields.csv",                  # field_id, village, state, irrigation, area_ha, lat, lon
    # Optional extra dataset (unused in join, but we keep the alias)
    "crop": "Crop.csv",                      # N, P, K, temperature, humidity, ph, rainfall, label (generic dataset)
}

# --------------------------------------------------------------------------------------
# Features (kept consistent with your initial design)
# --------------------------------------------------------------------------------------
NUM_FEATURES = [
    "ph", "moisture", "n", "p", "k",
    "rain_sum", "tmin_avg", "tmax_avg", "humidity_avg", "wind_avg",
    "area_ha", "lat", "lon", "sowing_month"
]
CAT_FEATURES = ["prev_crop_1", "prev_crop_2", "village", "state", "irrigation", "crop"]
TARGET = "yield_q_per_ha"

DEFAULT_CROPS = ["Wheat", "Paddy", "Maize", "Mustard", "Sugarcane"]


# --------------------------------------------------------------------------------------
# Utilities
# --------------------------------------------------------------------------------------
def _lower_strip_cols(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [str(c).replace("\ufeff", "").strip() for c in df.columns]
    return df


def _load_csv_if_exists(name: str) -> pd.DataFrame | None:
    path = DATA / name
    if not path.exists():
        return None
    df = pd.read_csv(path)
    return _lower_strip_cols(df)


def _audit_step(title: str, df: pd.DataFrame | None):
    if df is None:
        print(f"\n[{title}] file missing — skipping.")
        return
    print(f"\n[{title}] rows={len(df):,}, cols={len(df.columns)}")
    cols_show = list(df.columns)
    print(f"  columns: {cols_show[:10]}{'...' if len(cols_show) > 10 else ''}")


def _safe_to_numeric(s: pd.Series) -> pd.Series:
    return pd.to_numeric(s, errors="coerce")


def _ensure_cols(df: pd.DataFrame, cols: list[str], fill_value=np.nan):
    for c in cols:
        if c not in df.columns:
            df[c] = fill_value


def _season_start_from_year(year: float | int) -> pd.Timestamp:
    """Fallback season start if only Year is present. Uses June 1st of that year."""
    try:
        y = int(year)
        return pd.Timestamp(datetime(y, 6, 1))
    except Exception:
        return pd.NaT


# --------------------------------------------------------------------------------------
# Loading
# --------------------------------------------------------------------------------------
def load_tables() -> dict[str, pd.DataFrame | None]:
    soil = _load_csv_if_exists(CANDIDATE_FILES["soil"])
    weather = _load_csv_if_exists(CANDIDATE_FILES["weather"])
    yields = _load_csv_if_exists(CANDIDATE_FILES["yields"])
    hist = _load_csv_if_exists(CANDIDATE_FILES["hist"])
    fields = _load_csv_if_exists(CANDIDATE_FILES["fields"])
    crop = _load_csv_if_exists(CANDIDATE_FILES["crop"])  # optional

    _audit_step(CANDIDATE_FILES["soil"], soil)
    _audit_step(CANDIDATE_FILES["weather"], weather)
    _audit_step(CANDIDATE_FILES["yields"], yields)
    _audit_step(CANDIDATE_FILES["hist"], hist)
    _audit_step(CANDIDATE_FILES["fields"], fields)

    return {"soil": soil, "weather": weather, "yields": yields, "hist": hist, "fields": fields, "crop": crop}


# --------------------------------------------------------------------------------------
# Weather aggregation — optional
# --------------------------------------------------------------------------------------
def aggregate_weather(weather: pd.DataFrame) -> pd.DataFrame:
    w = weather.copy()
    alias = {
        "Date": "date",
        "MaxT": "tmax",
        "MinT": "tmin",
        "RH1": "rh1",
        "RH2": "rh2",
        "Wind": "wind",
        "Rain": "rain_mm",
        "Lat": "lat",
        "Lon": "lon",
        "Cum_Rain": "cum_rain",
    }
    for k, v in alias.items():
        if k in w.columns:
            w.rename(columns={k: v}, inplace=True)

    if "date" in w.columns:
        w["date"] = pd.to_datetime(w["date"], errors="coerce")
        w["year"] = w["date"].dt.year
    else:
        if "Year" in w.columns:
            w["year"] = _safe_to_numeric(w["Year"]).astype("Int64")
        else:
            w["year"] = pd.Series([pd.NA] * len(w))

    for nc in ["tmax", "tmin", "wind", "rain_mm", "lat", "lon", "cum_rain", "rh1", "rh2"]:
        if nc in w.columns:
            w[nc] = _safe_to_numeric(w[nc])

    by = ["year"]
    agg = {
        "rain_mm": "sum",
        "tmin": "mean",
        "tmax": "mean",
        "wind": "mean",
        "rh1": "mean",
        "rh2": "mean",
        "lat": "mean",
        "lon": "mean",
    }
    present_agg = {k: v for k, v in agg.items() if k in w.columns}
    w_agg = w.groupby(by, as_index=False).agg(present_agg)
    if "rh1" in w_agg.columns or "rh2" in w_agg.columns:
        rh_cols = [c for c in ["rh1", "rh2"] if c in w_agg.columns]
        w_agg["humidity_avg"] = w_agg[rh_cols].mean(axis=1)
        w_agg.drop(columns=[c for c in ["rh1", "rh2"] if c in w_agg.columns], inplace=True, errors="ignore")
    return w_agg


# --------------------------------------------------------------------------------------
# Build training frame
# --------------------------------------------------------------------------------------
def build_training_frame(tables: dict, crops: list[str]) -> pd.DataFrame:
    yields = tables["yields"]
    if yields is None or yields.empty:
        raise FileNotFoundError("Required dataset 'crop_yield_history.csv' not found or empty in data/")

    soil = tables["soil"]
    weather = tables["weather"]
    hist = tables["hist"]
    fields = tables["fields"]

    y = yields.copy()

    alias_map = {
        "Crop": "crop",
        "Yield_kg_per_ha": "yield_kg_per_ha",
        "Area_ha": "area_ha",
        "Temperature_C": "temperature_c",
        "Humidity_%": "humidity_pct",
        "pH": "ph",
        "Rainfall_mm": "rain_mm",
        "Wind_Speed_m_s": "wind_m_s",
        "State Name": "state",
        "Dist Name": "district",
        "Year": "year",
        "Lat": "lat",
        "Lon": "lon",
        "N_req_kg_per_ha": "n_req",
        "P_req_kg_per_ha": "p_req",
        "K_req_kg_per_ha": "k_req",
    }
    for k, v in alias_map.items():
        if k in y.columns:
            y.rename(columns={k: v}, inplace=True)

    if "yield_q_per_ha" not in y.columns:
        if "yield_kg_per_ha" in y.columns:
            y["yield_q_per_ha"] = _safe_to_numeric(y["yield_kg_per_ha"]) / 100.0
        else:
            if "yield_q_per_ha" not in y.columns:
                raise ValueError("Could not find yield column (Yield_kg_per_ha or yield_q_per_ha).")

    if "season_start" not in y.columns:
        if "year" in y.columns and y["year"].notna().any():
            y["season_start"] = y["year"].apply(_season_start_from_year)
        else:
            y["season_start"] = pd.NaT

    y["tmin_avg"] = np.nan
    y["tmax_avg"] = np.nan
    if "tmin" in y.columns:
        y["tmin_avg"] = _safe_to_numeric(y["tmin"])
    if "tmax" in y.columns:
        y["tmax_avg"] = _safe_to_numeric(y["tmax"])

    if y["tmin_avg"].isna().all() and "temperature_c" in y.columns:
        tc = _safe_to_numeric(y["temperature_c"])
        y["tmin_avg"] = tc - 2.0

    if y["tmax_avg"].isna().all() and "temperature_c" in y.columns:
        tc = _safe_to_numeric(y["temperature_c"])
        y["tmax_avg"] = tc + 2.0

    if "humidity_avg" not in y.columns:
        if "humidity_pct" in y.columns:
            y["humidity_avg"] = _safe_to_numeric(y["humidity_pct"])
        else:
            y["humidity_avg"] = np.nan

    if "wind_avg" not in y.columns:
        if "wind_m_s" in y.columns:
            y["wind_avg"] = _safe_to_numeric(y["wind_m_s"])
        else:
            y["wind_avg"] = np.nan

    if "rain_sum" not in y.columns:
        if "rain_mm" in y.columns:
            y["rain_sum"] = _safe_to_numeric(y["rain_mm"])
        else:
            y["rain_sum"] = np.nan

    if "lat" in y.columns:
        y["lat"] = _safe_to_numeric(y["lat"])
    else:
        y["lat"] = np.nan

    if "lon" in y.columns:
        y["lon"] = _safe_to_numeric(y["lon"])
    else:
        y["lon"] = np.nan

    if "area_ha" in y.columns:
        y["area_ha"] = _safe_to_numeric(y["area_ha"])
    else:
        y["area_ha"] = np.nan

    if "ph" in y.columns:
        y["ph"] = _safe_to_numeric(y["ph"])
    else:
        y["ph"] = np.nan

    y["n"] = np.nan
    y["p"] = np.nan
    y["k"] = np.nan

    if soil is not None and not soil.empty and all(c in soil.columns for c in ["N", "P", "K"]):
        y["n"] = soil["N"].median(skipna=True)
        y["p"] = soil["P"].median(skipna=True)
        y["k"] = soil["K"].median(skipna=True)
    else:
        for src, dst in [("n_req", "n"), ("p_req", "p"), ("k_req", "k")]:
            if src in y.columns:
                y[dst] = _safe_to_numeric(y[src])

    if "moisture" not in y.columns:
        y["moisture"] = np.nan

    if "crop" not in y.columns:
        y["crop"] = "Unknown"
    if "state" not in y.columns:
        y["state"] = "Unknown"
    y["village"] = "Unknown"
    y["irrigation"] = "Unknown"
    y["prev_crop_1"] = "Unknown"
    y["prev_crop_2"] = "Unknown"

    if "sowing_month" not in y.columns:
        y["sowing_month"] = pd.to_datetime(y["season_start"], errors="coerce").dt.month

    keep = NUM_FEATURES + CAT_FEATURES + [TARGET]
    _ensure_cols(y, keep, fill_value=np.nan)

    # ------------------- HARD DEFAULTS TO PREVENT DROP-ALL -------------------
    hard_defaults = {
        "lat": 23.5,            # India centroid-ish
        "lon": 78.5,
        "moisture": 20.0,
        "area_ha": 1.0,
        "sowing_month": 6,
        "tmin_avg": 20.0,
        "tmax_avg": 30.0,
        "humidity_avg": 60.0,
        "wind_avg": 2.0,
        "rain_sum": 500.0,
        "ph": 6.5,
        "n": 100.0,
        "p": 40.0,
        "k": 40.0,
    }
    for col, val in hard_defaults.items():
        if col in y.columns and y[col].isna().all():
            y[col] = val
    # ------------------------------------------------------------------------

    # Minimal imputations (with fallback to hard defaults/0 if median is NaN)
    for col in NUM_FEATURES + [TARGET]:
        if y[col].dtype.kind in "biufc":
            if y[col].isna().any():
                med = y[col].median(skipna=True)
                fillv = med if pd.notna(med) else hard_defaults.get(col, 0.0)
                y[col] = y[col].fillna(fillv)

    for col in CAT_FEATURES:
        if y[col].isna().any():
            y[col] = y[col].fillna("Unknown")

    # Optional: quick visibility into remaining NaNs
    na_cols = [c for c in keep if y[c].isna().any()]
    if na_cols:
        print("[debug] columns still containing NaN before dropna():", na_cols[:12], "..." if len(na_cols) > 12 else "")

    before = len(y)
    out = y[keep].dropna().copy()
    after = len(out)
    print(f"\n[train_frame] kept {after:,}/{before:,} rows after minimal imputations & required-column dropna()")
    return out


# --------------------------------------------------------------------------------------
# Auto-detect crops for metadata
# --------------------------------------------------------------------------------------
def infer_all_crops(tables: dict) -> list[str]:
    y = tables.get("yields")
    if y is None or y.empty:
        return []
    df = y.copy()
    if "Crop" in df.columns and "crop" not in df.columns:
        df = df.rename(columns={"Crop": "crop"})
    if "crop" in df.columns:
        crops = (
            df["crop"]
            .astype(str)
            .str.strip()
            .str.replace(r"\s+", " ", regex=True)
            .str.title()
            .dropna()
            .unique()
            .tolist()
        )
        crops = sorted([c for c in crops if c and c.lower() != "nan"])
        return crops
    return []


# --------------------------------------------------------------------------------------
# Pipeline & Training
# --------------------------------------------------------------------------------------
def make_pipeline() -> Pipeline:
    pre = ColumnTransformer(
        transformers=[
            ("num", Pipeline(steps=[("sc", StandardScaler())]), NUM_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore"), CAT_FEATURES),
        ],
        remainder="drop",
    )

    model = XGBRegressor(
        n_estimators=500,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.85,
        colsample_bytree=0.85,
        reg_lambda=2.0,
        random_state=42,
        n_jobs=4,
    )

    pipe = Pipeline([("pre", pre), ("reg", model)])
    return pipe


def train_and_eval(train_df: pd.DataFrame, test_size=0.2, random_state=42) -> tuple[Pipeline, dict]:
    X = train_df[NUM_FEATURES + CAT_FEATURES]
    y = train_df[TARGET].astype(float)

    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    pipe = make_pipeline()
    pipe.fit(X_tr, y_tr)

    y_hat_tr = pipe.predict(X_tr)
    y_hat_te = pipe.predict(X_te)

    metrics = {
        "train_mae": float(mean_absolute_error(y_tr, y_hat_tr)),
        "train_r2": float(r2_score(y_tr, y_hat_tr)),
        "test_mae": float(mean_absolute_error(y_te, y_hat_te)),
        "test_r2": float(r2_score(y_te, y_hat_te)),
        "n_train": int(len(X_tr)),
        "n_test": int(len(X_te)),
        "features_num": NUM_FEATURES,
        "features_cat": CAT_FEATURES,
        "target": TARGET,
    }

    print("\n[metrics]")
    for k, v in metrics.items():
        if isinstance(v, float):
            print(f"  {k}: {v:.4f}")
        else:
            print(f"  {k}: {v}")

    return pipe, metrics


def save_artifacts(pipe: Pipeline, crops: list[str], metrics: dict):
    MODELS.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipe, MODELS / "crop_reco_v1.joblib")
    meta = {
        "crops": crops,
        "features_num": NUM_FEATURES,
        "features_cat": CAT_FEATURES,
        "target": TARGET,
        "metrics": metrics,
    }
    (MODELS / "crop_meta.json").write_text(json.dumps(meta, indent=2))
    print(f"\nSaved:\n  - {MODELS/'crop_reco_v1.joblib'}\n  - {MODELS/'crop_meta.json'}")


# --------------------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Train Crop Recommendation Yield Model (adapted to your CSVs)")
    parser.add_argument(
        "--crops",
        nargs="*",
        default=None,   # auto-detect when None
        help="Candidate crop list (stored in meta; UI helper). If omitted, auto-detect all crops from data."
    )
    args = parser.parse_args()

    tables = load_tables()

    # Auto-detect crops for metadata when not provided
    crops_for_meta = args.crops if args.crops else infer_all_crops(tables)
    if not crops_for_meta:
        crops_for_meta = DEFAULT_CROPS  # final fallback

    # Build training frame
    train_df = build_training_frame(tables, crops_for_meta)
    if len(train_df) < 50:
        print("\n[warn] Very small training set after feature preparation; check your data coverage.")

    # Train + evaluate
    pipe, metrics = train_and_eval(train_df)

    # Save artifacts
    save_artifacts(pipe, crops_for_meta, metrics)


if __name__ == "__main__":
    main()
