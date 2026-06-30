"""Run once to pre-train and save both ML models."""
from models.risk_model import _train as train_risk
from models.fraud_model import _train as train_fraud

print("Training Risk Prediction Model (RandomForest)...")
train_risk()

print("Training Fraud Detection Model (IsolationForest)...")
train_fraud()

print("\nAll models trained and saved successfully!")
print("You can now start the Flask server: python app.py")
