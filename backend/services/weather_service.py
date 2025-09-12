import os
import requests

API_KEY = os.getenv("OPENWEATHER_API_KEY")
API_URL = "https://api.openweathermap.org/data/2.5/forecast"


def forecast(*, city: str | None = None, lat: float | None = None, lon: float | None = None, days: int = 7) -> dict:
    """Fetch a multi-day forecast from OpenWeatherMap.

    Either ``city`` or both ``lat`` and ``lon`` must be provided. The API
    returns 3-hourly data; we aggregate it into daily min/max temperature and
    rainfall totals and cap the result to ``days`` entries.
    """

    if city:
        params = {"q": city, "appid": API_KEY, "units": "metric"}
    elif lat is not None and lon is not None:
        params = {"lat": lat, "lon": lon, "appid": API_KEY, "units": "metric"}
    else:
        raise ValueError("provide city or lat/lon")

    resp = requests.get(API_URL, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    daily: dict[str, dict[str, list | float]] = {}
    for entry in data.get("list", []):
        date = entry["dt_txt"].split(" ")[0]
        temp = entry["main"]["temp"]
        rain = entry.get("rain", {}).get("3h", 0.0)

        if date not in daily:
            daily[date] = {"temps": [], "rain": 0.0}

        daily[date]["temps"].append(temp)
        daily[date]["rain"] += rain

    result = []
    for date, values in list(daily.items())[:days]:
        result.append(
            {
                "date": date,
                "min": min(values["temps"]),
                "max": max(values["temps"]),
                "rain": round(values["rain"], 2),
            }
        )

    return {"forecast": result}


if __name__ == "__main__":
    # Example: Forecast for Delhi by city and by coordinates
    print(forecast(city="Delhi"))
    print(forecast(lat=28.61, lon=77.21))
