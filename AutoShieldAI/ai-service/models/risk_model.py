"""
Risk Prediction Model — RandomForestClassifier
Features: rainfall, temperature, aqi, demand_drop, zone_encoded
Output: disruption probability (0–1) + risk level
"""

import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib, os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "risk_rf.pkl")

ZONE_MAP = {"urban": 2, "semi-urban": 1, "rural": 0}


def _generate_training_data(n=3000):
    np.random.seed(42)
    rainfall    = np.random.uniform(0, 130, n)
    temperature = np.random.uniform(18, 58, n)
    aqi         = np.random.uniform(20, 520, n)
    demand_drop = np.random.uniform(0, 100, n)
    zone        = np.random.choice([0, 1, 2], n)

    # Label logic — disrupted if multiple thresholds breached
    score = (
        (rainfall    > 50).astype(float) * 0.35 +
        (temperature > 42).astype(float) * 0.25 +
        (aqi         > 300).astype(float) * 0.20 +
        (demand_drop > 60).astype(float) * 0.15 +
        (zone == 2).astype(float)         * 0.05   # urban slightly higher risk
    )
    labels = (score > 0.3).astype(int)
    X = np.column_stack([rainfall, temperature, aqi, demand_drop, zone])
    return X, labels


def _train() -> RandomForestClassifier:
    X, y = _generate_training_data()
    clf = RandomForestClassifier(n_estimators=150, max_depth=8, random_state=42)
    clf.fit(X, y)
    joblib.dump(clf, MODEL_PATH)
    print(f"[RiskModel] Trained & saved to {MODEL_PATH}")
    return clf


def ensure_trained():
    if not os.path.exists(MODEL_PATH):
        _train()


def predict_risk(data: dict):
    clf = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else _train()

    feats = [[
        float(data.get("rainfall",    20)),
        float(data.get("temperature", 32)),
        float(data.get("aqi",         100)),
        float(data.get("demandDrop",  10)),
        float(ZONE_MAP.get(data.get("zone", "semi-urban"), 1))
    ]]

    prob  = float(clf.predict_proba(feats)[0][1])
    level = "high" if prob > 0.65 else "medium" if prob > 0.35 else "low"
    return prob, level
