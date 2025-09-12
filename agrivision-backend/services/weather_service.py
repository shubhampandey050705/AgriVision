"""Weather service that fetches a real forecast from the Open-Meteo API."""

from __future__ import annotations

import requests


API_URL = "https://api.open-meteo.com/v1/forecast"


def forecast(lat: float, lon: float, days: int = 7) -> dict:
    """Return a simple daily forecast for the requested location.

    The service queries the Open-Meteo API (no API key required) and
    normalises the response into a list of dictionaries with the
    following fields:
      - date: ISO date string
      - min: minimum temperature in °C
      - max: maximum temperature in °C
      - rain: precipitation in mm

    Parameters
    ----------
    lat, lon: float
        Geographic coordinates of the field.
    days: int, optional
        Number of forecast days to return (1-16 supported by the API).
    """

    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": [
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
        ],
        "forecast_days": days,
        "timezone": "auto",
    }

    resp = requests.get(API_URL, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json().get("daily", {})

    times = data.get("time", [])
    tmax = data.get("temperature_2m_max", [])
    tmin = data.get("temperature_2m_min", [])
    rain = data.get("precipitation_sum", [])

    daily = []
    for i in range(min(len(times), days)):
        daily.append({
            "date": times[i],
            "min": tmin[i],
            "max": tmax[i],
            "rain": rain[i],
        })

    return {"daily": daily}