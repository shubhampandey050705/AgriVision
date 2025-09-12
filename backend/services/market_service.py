from datetime import date, timedelta
def forecast(commodity: str, mandi: str, horizon_days: int = 7) -> dict:
    today = date.today()
    base = 2100.0
    series = [{"date": str(today + timedelta(days=i)), "price": base + 10*i} for i in range(horizon_days)]
    return {"series": series}
