# app/routes_disease.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from .model_registry import load_disease_model
import numpy as np
from PIL import Image
import io, tensorflow as tf

router = APIRouter()
try:
    model, labels = load_disease_model()
except Exception:
    model, labels = None, []

IMG_SIZE = (224, 224)

@router.post("/predict/disease")
async def predict_disease(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Disease model not loaded yet. Train and save it first.")
    try:
        img = Image.open(io.BytesIO(await file.read())).convert("RGB").resize(IMG_SIZE)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    arr = np.array(img)[None, ...]
    logits = model.predict(arr, verbose=0)
    probs = tf.nn.softmax(logits).numpy()
    idx = int(np.argmax(probs, axis=1)[0])
    conf = float(np.max(probs))
    label = labels[idx] if labels and 0 <= idx < len(labels) else f"class_{idx}"
    return {"diagnosis": label, "confidence": conf}
