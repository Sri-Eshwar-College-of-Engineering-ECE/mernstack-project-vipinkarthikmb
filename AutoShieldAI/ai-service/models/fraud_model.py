"""
Fraud Detection Model — IsolationForest
Features: trigger_value, claim_frequency, payout_amount, hour_of_day
Output: anomaly score + fraud boolean
"""

import numpy as np
from sklearn.ensemble import IsolationForest
import joblib, os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "fraud_iso.pkl")


def _generate_normal_claims(n=2000):
    """Simulate normal, legitimate claim patterns."""
    np.random.seed(0)
    trigger_val   = np.random.uniform(50, 130, n)    # realistic trigger values
    claim_freq    = np.random.uniform(0.05, 0.4, n)  # claims per week
    payout_amt    = np.random.uniform(50, 600, n)    # typical payouts
    hour_of_day   = np.random.uniform(6, 22, n)      # working hours
    return np.column_stack([trigger_val, claim_freq, payout_amt, hour_of_day])


def _train() -> IsolationForest:
    X = _generate_normal_claims()
    iso = IsolationForest(n_estimators=200, contamination=0.05, random_state=0)
    iso.fit(X)
    joblib.dump(iso, MODEL_PATH)
    print(f"[FraudModel] Trained & saved to {MODEL_PATH}")
    return iso


def ensure_trained():
    if not os.path.exists(MODEL_PATH):
        _train()


def check_fraud(data: dict):
    iso = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else _train()

    import datetime
    hour = datetime.datetime.now().hour

    feats = [[
        float(data.get("triggerValue",  60)),
        float(data.get("claimFreq",    0.2)),
        float(data.get("payoutAmount", 200)),
        float(hour)
    ]]

    raw_score = float(iso.score_samples(feats)[0])
    # score_samples returns negative; more negative = more anomalous
    normalized = abs(raw_score)
    is_fraud   = iso.predict(feats)[0] == -1  # -1 = outlier/fraud

    return normalized, is_fraud
