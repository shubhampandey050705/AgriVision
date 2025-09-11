def forecast(lat: float, lon: float, days: int = 7) -> dict:
    # TODO: call real weather API + compute GDD/ET0
    daily = [{"day": i+1, "min": 22+i, "max": 31+i, "rain": 0 if i % 3 else 8} for i in range(days)]
    return {"daily": daily}
