def predict(payload: dict) -> dict:
    # TODO: call your real model; this is a stub aligned to your UI
    crops = [
        {"name": "Wheat", "score": 84.0, "reason": "Soil pH & climate suitability"},
        {"name": "Paddy", "score": 79.0, "reason": "Rainfall forecast supportive"},
        {"name": "Maize", "score": 72.0, "reason": "Temperature window OK"},
    ]
    return {"crops": crops, "scores": {"yield": 72, "sustainability": 65}}
