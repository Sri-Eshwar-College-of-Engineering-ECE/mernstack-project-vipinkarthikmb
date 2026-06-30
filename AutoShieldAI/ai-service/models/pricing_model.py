"""
Dynamic Premium Pricing Model
Input: zone, weather data, risk_score
Output: weekly premium ₹20 (low) → ₹70 (high)
"""

ZONE_MULTIPLIER = {
    "urban":      1.30,
    "semi-urban": 1.00,
    "rural":      0.80
}

BASE_PREMIUM    = 20.0
CEILING_PREMIUM = 70.0


def calculate_premium(data: dict, risk_score: float) -> float:
    """
    Dynamic pricing formula:
      premium = base + (ceiling - base) * risk_score * zone_multiplier
    Clamped to [₹20, ₹70].
    """
    zone     = data.get("zone", "semi-urban")
    zone_mul = ZONE_MULTIPLIER.get(zone, 1.0)

    # Weather penalty: high AQI or rainfall adds a small surcharge
    aqi         = data.get("aqi", 100)
    rainfall    = data.get("rainfall", 10)
    weather_adj = 0.0
    if aqi > 200:
        weather_adj += 0.05
    if rainfall > 30:
        weather_adj += 0.05

    adjusted_risk = min(risk_score + weather_adj, 1.0)
    premium = BASE_PREMIUM + (CEILING_PREMIUM - BASE_PREMIUM) * adjusted_risk * zone_mul
    return round(min(max(premium, BASE_PREMIUM), CEILING_PREMIUM), 2)
