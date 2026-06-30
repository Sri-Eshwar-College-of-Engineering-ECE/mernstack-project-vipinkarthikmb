from flask import Flask, request, jsonify
from flask_cors import CORS
from models.pricing_model import calculate_premium
from models.risk_model import predict_risk
from models.fraud_model import check_fraud
import os

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "AutoShield AI Engine"})

@app.route('/calculate-premium', methods=['POST'])
def premium():
    d = request.json
    try:
        risk_score, risk_level = predict_risk(d)
        premium = calculate_premium(d, risk_score)
        return jsonify({
            "premium": round(premium, 2),
            "riskScore": round(risk_score, 3),
            "riskLevel": risk_level,
            "breakdown": {
                "base": 20,
                "riskMultiplier": round(risk_score, 3),
                "zoneFactor": d.get("zone", "semi-urban"),
                "final": round(premium, 2)
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/fraud-check', methods=['POST'])
def fraud():
    d = request.json
    try:
        score, is_fraud = check_fraud(d)
        return jsonify({
            "score": round(float(score), 3),
            "isFraud": bool(is_fraud),
            "verdict": "suspicious" if is_fraud else "legitimate"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/fraud-score', methods=['POST'])
def fraud_score():
    d = request.json or {}
    try:
        score, is_fraud = check_fraud(d)
        reason_codes = []
        if float(score) >= 0.75:
            reason_codes.append('high_model_confidence')
        if d.get('duplicateIdentity'):
            reason_codes.append('duplicate_identity')
        if d.get('claimFrequency', 0) >= 3:
            reason_codes.append('high_claim_frequency')

        return jsonify({
            "score": round(float(score) * 100, 2) if float(score) <= 1 else round(float(score), 2),
            "isFraud": bool(is_fraud),
            "riskBand": "high" if is_fraud else "medium" if float(score) >= 0.4 else "low",
            "reasons": reason_codes if reason_codes else ["model_baseline_signal"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/risk-predict', methods=['POST'])
def risk():
    d = request.json
    try:
        risk_score, risk_level = predict_risk(d)
        return jsonify({
            "riskScore": round(risk_score, 3),
            "riskLevel": risk_level,
            "disruption_probability": f"{round(risk_score * 100, 1)}%"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/risk-score', methods=['POST'])
def risk_score():
    d = request.json or {}
    try:
        risk_score, risk_level = predict_risk(d)
        return jsonify({
            "riskScore": round(float(risk_score), 4),
            "riskBand": risk_level,
            "explanation": f"Model estimated risk band '{risk_level}' with score {round(float(risk_score), 4)}."
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Auto-train models on startup if not present
    from models.risk_model import ensure_trained as risk_train
    from models.fraud_model import ensure_trained as fraud_train
    risk_train()
    fraud_train()
    app.run(host='0.0.0.0', port=8000, debug=True)
