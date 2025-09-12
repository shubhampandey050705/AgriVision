import requests
import os

API_KEY = os.getenv("OPENWEATHER_API_KEY")  # safer than hardcoding
API_URL = "https://api.openweathermap.org/data/2.5/forecast"  # 5-day/3-hour forecast

def forecast(city: str, country: str = "IN") -> dict:
    """
    Fetch a 5-day forecast (3-hour intervals) from OpenWeatherMap.

    Parameters
    ----------
    city : str
        City name (e.g., "Delhi").
    country : str
        Country code (default = "IN").

    Returns
    -------
    dict : Normalized forecast with date, min/max temps, rainfall.
    """
    params = {
        "q": f"{city},{country}",
        "appid": API_KEY,
        "units": "metric"  # Celsius
    }

    resp = requests.get(API_URL, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    daily = {}
    for entry in data["list"]:
        date = entry["dt_txt"].split(" ")[0]
        temp = entry["main"]["temp"]
        rain = entry.get("rain", {}).get("3h", 0.0)

        if date not in daily:
            daily[date] = {"temps": [], "rain": 0.0}

        daily[date]["temps"].append(temp)
        daily[date]["rain"] += rain

    # Normalize into min/max per day
    result = []
    for date, values in daily.items():
        result.append({
            "date": date,
            "min": min(values["temps"]),
            "max": max(values["temps"]),
            "rain": round(values["rain"], 2),
        })

    return {"city": city, "forecast": result}

if __name__ == "__main__":
    # Example: Forecast for Delhi
    print(forecast("Delhi"))
