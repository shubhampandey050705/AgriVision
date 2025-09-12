# Replace stub with real ONNX/Torch inference later
def predict(image_bytes: bytes) -> dict:
    # TODO: preprocess + model inference
    return {
        "disease": "leaf_rust",
        "confidence": 0.92,
        "remedies": ["Remove infected leaves", "Apply recommended fungicide"],
        "model_version": "stub-0.1"
    }
