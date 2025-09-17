# ml/tests/predict_crop.py
from pathlib import Path
import argparse, json, sys
import pandas as pd
import joblib

def default_paths():
    here = Path(__file__).resolve()
    ml_dir = here.parents[1]              # .../ml
    return (
        ml_dir / "models" / "crop_reco_v1.joblib",
        here.parent / "sample.json",      # .../ml/tests/sample.json
        ml_dir / "models" / "crop_meta.json",
    )

def main():
    model_default, input_default, meta_default = default_paths()

    p = argparse.ArgumentParser(description="Predict crop from a saved pipeline")
    p.add_argument("--model", type=Path, default=model_default, help="Path to joblib model")
    p.add_argument("--input", type=Path, default=input_default, help="Path to JSON with one sample")
    p.add_argument("--meta",  type=Path, default=meta_default,  help="Optional crop_meta.json for column order")
    args = p.parse_args()

    # --- load model
    if not args.model.exists():
        sys.exit(f"[ERROR] Model not found: {args.model}")

    pipe = joblib.load(args.model)

    # --- load input
    if not args.input.exists():
        sys.exit(f"[ERROR] Input JSON not found: {args.input}")

    with open(args.input, "r", encoding="utf-8") as f:
        payload = json.load(f)

    if isinstance(payload, dict):
        rows = [payload]
    elif isinstance(payload, list):
        if not payload:
            sys.exit("[ERROR] Input list is empty.")
        rows = payload
    else:
        sys.exit("[ERROR] Input JSON must be an object or a list of objects.")

    df = pd.DataFrame(rows)

    # --- (optional) align columns using meta if present
    if args.meta.exists():
        try:
            meta = json.loads(args.meta.read_text(encoding="utf-8"))
            # accept common keys for feature list
            feature_keys = (
                meta.get("feature_order")
                or meta.get("features")
                or meta.get("columns")
                or None
            )
            if feature_keys:
                # add any missing columns as NA and order
                for col in feature_keys:
                    if col not in df.columns:
                        df[col] = pd.NA
                df = df[feature_keys]
        except Exception as e:
            print(f"[WARN] Could not use meta file ({args.meta}): {e}")

    # --- predict
    preds = pipe.predict(df)
    try:
        probs = pipe.predict_proba(df)
    except Exception:
        probs = None

    # --- output
    for i, pred in enumerate(preds):
        print(f"Sample {i}: predicted = {pred}")
        if probs is not None:
            # show top-3 class probs if classifier
            s = pd.Series(probs[i], index=getattr(pipe, "classes_", None))
            if s.index is not None:
                top3 = s.sort_values(ascending=False).head(3)
                print("  top3:", ", ".join(f"{k}: {v:.3f}" for k, v in top3.items()))

if __name__ == "__main__":
    main()
