# backend/blueprints/ml_meta.py
from flask import Blueprint, jsonify

bp_ml_meta = Blueprint("ml_meta", __name__, url_prefix="/api/ml")

CROPS = [
    "Rice","Wheat","Maize","Barley",
    "Sorghum (Jowar)","Pearl Millet (Bajra)","Finger Millet (Ragi)","Small Millets",
    "Chickpea (Gram)","Pigeonpea (Tur/Arhar)","Lentil (Masoor)","Black Gram (Urad)",
    "Green Gram (Moong)","Peas (Matar)","Horse Gram (Kulthi)","Cowpea (Lobia)",
    "Groundnut (Peanut)","Mustard","Soybean","Sunflower","Sesame (Til)","Castor Seed","Linseed","Niger Seed",
    "Sugarcane","Cotton","Jute","Tobacco","Tea","Coffee","Rubber","Indigo",
    "Mango","Banana","Guava","Apple","Grapes","Pomegranate","Papaya",
    "Citrus (Orange/Lemon/Mosambi)","Litchi","Pineapple","Sapota (Chiku)"
]

FEATURES_NUM = ["ph","moisture","n","p","k","rain_sum","tmin_avg","tmax_avg","humidity_avg","wind_avg","area_ha","lat","lon","sowing_month"]
FEATURES_CAT = ["prev_crop_1","prev_crop_2","village","state","irrigation"]

@bp_ml_meta.get("/meta")
def get_meta():
    return jsonify({
        "crops": CROPS,
        "features_num": FEATURES_NUM,
        "features_cat": FEATURES_CAT
    }), 200
