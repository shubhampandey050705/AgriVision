# training/train_markets.py
"""
Train per-(crop, state) market price forecasters using XGBoost with
autoregressive lags + rolling features.

Input CSV (data/market_prices.csv):
    date,crop,state,mandi,modal
    2025-01-01,Wheat,UP,Lucknow,2040
    ...

Artifacts saved to models/:
    market_xgb_{crop}__{state}.joblib
    market_meta.json (lists models + feature config)

Usage:
    python training/train_markets.py --horizon 7 --min-history 180
"""

from __future__ import annotations
import argparse, json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
MODELS = ROOT / "models"

LAGS = [1, 2, 3, 7, 14, 21, 28]
ROLLS = [(7, "mean"), (14, "mean"), (28, "mean"), (7, "std"), (14, "std")]

def _make_time_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date")
    df["doy"] = df["date"].dt.dayofyear
    df["dow"] = df["date"].dt.weekday
    df["week"] = df["date"].dt.isocalendar().week.astype(int)
    df["month"] = df["date"].dt.month
    return df

def _add_lag_roll(df: pd.DataFrame, ycol="modal") -> pd.DataFrame:
    df = df.copy()
    for lag in LAGS:
        df[f"lag_{lag}"] = df[ycol].shift(lag)
    for win, agg in ROLLS:
        if agg == "mean":
            df[f"roll{win}_mean"] = df[ycol].shift(1).rolling(win).mean()
        elif agg == "std":
            df[f"roll{win}_std"] = df[ycol].shift(1).rolling(win).std()
    return df

def _train_one(group: pd.DataFrame, horizon=7, min_history=180) -> dict | None:
    """
    Train model for a single (crop,state) group.
    Returns metrics + path, or None if insufficient data.
    """
    g = _make_time_features(group)
    g = _add_lag_roll(g, ycol="modal")
    g = g.dropna().reset_index(drop=True)

    if len(g) < max(min_history, 120):
        return None

    # Time-based split: last `horizon*4` days for validation (at least 4 horizons)
    val_window = max(horizon * 4, 28)
    split_idx = len(g) - val_window
    train_df = g.iloc[:split_idx]
    val_df = g.iloc[split_idx:]

    y_train = train_df["modal"].values
    y_val = val_df["modal"].values

    feat_cols = [c for c in g.columns if c not in ["date", "crop", "state", "mandi", "modal"]]

    X_train = train_df[feat_cols].values
    X_val = val_df[feat_cols].values

    model = XGBRegressor(
        n_estimators=600,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.9,
        colsample_bytree=0.9,
        reg_lambda=2.0,
        random_state=42,
        n_jobs=4
    )
    model.fit(X_train, y_train)

    pred_val = model.predict(X_val)
    mae = float(mean_absolute_error(y_val, pred_val))
    mape = float(mean_absolute_percentage_error(y_val, np.clip(pred_val, 1e-6, None)))

    return {
        "model": model,
        "feat_cols": feat_cols,
        "mae": mae,
        "mape": mape,
        "n_train": len(train_df),
        "n_val": len(val_df),
    }

def _recursive_forecast(last_hist: pd.DataFrame, model, feat_cols, horizon=7) -> pd.DataFrame:
    """
    Roll forward day by day using model predictions as future lags.
    last_hist: dataframe with columns [date, modal] + time features for the latest window
    Returns dataframe with future dates and predicted 'modal_pred'.
    """
    df = last_hist.copy()
    start_date = df["date"].max()
    future_rows = []

    for h in range(1, horizon + 1):
        next_date = start_date + pd.Timedelta(days=h)
        tmp = df.copy()

        # Create row template for next_date
        row = {"date": next_date}
        # update simple calendar features
        row["doy"] = next_date.timetuple().tm_yday
        row["dow"] = next_date.weekday()
        row["week"] = int(pd.Timestamp(next_date).isocalendar().week)
        row["month"] = next_date.month

        # compute lag values from df (which includes appended preds)
        for lag in LAGS:
            # lag_X means price from next_date - lag
            lag_date = next_date - pd.Timedelta(days=lag)
            val = df.loc[df["date"] == lag_date, "modal"].values
            if len(val) == 0:
                val = df.loc[df["date"] == lag_date, "modal_pred"].values
            row[f"lag_{lag}"] = float(val[0]) if len(val) else np.nan

        # rolling stats from the last known period (use modal/modal_pred)
        hist_series = df.sort_values("date")["modal"].astype(float).copy()
        if "modal_pred" in df.columns:
            # If predictions exist, append them in time order to compute rolling window correctly
            hist_series = df.sort_values("date")[["modal","modal_pred"]].fillna(method="ffill").sum(axis=1)

        # To compute rolling features, we need values up to yesterday
        # Build a small helper frame
        tmp_vals = df.copy()
        tmp_vals["y"] = tmp_vals["modal"].fillna(0)
        if "modal_pred" in tmp_vals.columns:
            tmp_vals["y"] = tmp_vals["modal"].fillna(tmp_vals["modal_pred"])

        tmp_vals = tmp_vals.sort_values("date")
        for win, agg in ROLLS:
            series = tmp_vals["y"].values
            if len(series) >= win:
                if agg == "mean":
                    row[f"roll{win}_mean"] = float(pd.Series(series).rolling(win).mean().iloc[-1])
                else:
                    row[f"roll{win}_std"] = float(pd.Series(series).rolling(win).std().iloc[-1])
            else:
                row[f"roll{win}_mean" if agg == "mean" else f"roll{win}_std"] = np.nan

        # Build feature vector and predict
        feat_row = {k: row.get(k, np.nan) for k in feat_cols}
        x = pd.DataFrame([feat_row])[feat_cols].values
        yhat = float(model.predict(x)[0])

        row["modal_pred"] = yhat
        future_rows.append(row)

        # append to df so subsequent steps can use as lag
        df = pd.concat([df, pd.DataFrame([{"date": next_date, "modal_pred": yhat}])], ignore_index=True)

    fut = pd.DataFrame(future_rows)
    return fut[["date", "modal_pred"]]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--horizon", type=int, default=7, help="Days to forecast")
    parser.add_argument("--min-history", type=int, default=180, help="Minimum days of history to train a model")
    args = parser.parse_args()

    MODELS.mkdir(exist_ok=True, parents=True)

    df = pd.read_csv(DATA / "market_prices.csv")
    df = df.dropna(subset=["date","crop","state","modal"]).copy()
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values(["crop","state","date"])

    # Train per (crop,state)
    all_meta = {"models": [], "lags": LAGS, "rolls": ROLLS, "horizon": args.horizon}
    groups = df.groupby(["crop","state"], sort=False)

    print(f"Training {len(groups)} (crop,state) models...")

    for (crop, state), g in groups:
        res = _train_one(g[["date","crop","state","mandi","modal"]].copy(),
                         horizon=args.horizon, min_history=args.min_history)
        if res is None:
            print(f"Skip {crop}-{state}: not enough history ({len(g)})")
            continue

        # Save model
        model_path = MODELS / f"market_xgb_{crop}__{state}.joblib"
        joblib.dump({"model": res["model"], "feat_cols": res["feat_cols"]}, model_path)

        # Build a small last-hist frame for future recursive forecasts preview (optional)
        hist = _make_time_features(g[["date","modal"]].copy())
        preview = _recursive_forecast(hist.tail(60), res["model"], res["feat_cols"], args.horizon)
        preview_path = MODELS / f"market_preview_{crop}__{state}.csv"
        preview.to_csv(preview_path, index=False)

        all_meta["models"].append({
            "crop": crop,
            "state": state,
            "path": model_path.name,
            "n_train": res["n_train"],
            "n_val": res["n_val"],
            "mae": res["mae"],
            "mape": res["mape"],
            "preview": preview_path.name
        })

        print(f"[{crop}-{state}] MAE={res['mae']:.2f} MAPE={res['mape']:.3f} → {model_path.name}")

    # Save registry/meta
    (MODELS / "market_meta.json").write_text(json.dumps(all_meta, indent=2))
    print("Saved market_meta.json")

if __name__ == "__main__":
    main()
