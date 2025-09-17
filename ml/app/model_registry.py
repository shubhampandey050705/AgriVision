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
