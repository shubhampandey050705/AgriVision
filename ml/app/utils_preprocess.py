# app/utils_preprocess.py
def sustainability(ph, n, p, k, irrigation, rain_sum) -> float:
    score = 80.0
    if ph < 6.0 or ph > 7.8:
        score -= 10
    if rain_sum < 10 and (irrigation or "").lower() != "drip":
        score -= 5
    if n > 100 or p > 60 or k > 120:
        score -= 10
    return max(0.0, min(100.0, score))
