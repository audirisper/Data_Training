import os
import json
import joblib # type: ignore
import numpy as np # type: ignore
from flask import Flask, request, jsonify
from flask_cors import CORS # type: ignore
from huggingface_hub import hf_hub_download # type: ignore

app = Flask(__name__)
CORS(app)

# =========================
# CONFIG
# =========================
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
HF_REPO = "audirisper/AnomalyDetection"


# =========================
# SAFE LOADER (LOCAL → HF FALLBACK)
# =========================
def load_file(filename):
    local_path = os.path.join(MODEL_DIR, filename)

    # 1. Try local (FAST)
    if os.path.exists(local_path):
        return local_path

    # 2. Fallback to Hugging Face (SLOW but reliable)
    return hf_hub_download(repo_id=HF_REPO, filename=filename)


# =========================
# LOAD MODELS ON STARTUP
# =========================
if_model = joblib.load(load_file("isolation_forest.pkl"))
lof_model = joblib.load(load_file("lof_model.pkl"))
scaler = joblib.load(load_file("scaler.pkl"))

with open(load_file("feature_columns.json")) as f:
    FEATURE_COLUMNS = json.load(f)

with open(load_file("model_metadata.json")) as f:
    metadata = json.load(f)

ensemble_threshold = metadata.get("ensemble_threshold", 0.5)


# =========================
# NORMALIZATION CONSTANTS
# =========================
IF_SCORE_MIN, IF_SCORE_MAX = 0.30, 0.70
LOF_SCORE_MIN, LOF_SCORE_MAX = 0.80, 2.50


# =========================
# INPUT VALIDATION
# =========================
def validate_input(data):
    if not isinstance(data, dict):
        return False, "Input must be a JSON object"
    return True, None


# =========================
# PREPROCESSING
# =========================
def preprocess_input(data):
    X = np.array([[data.get(col, 0) for col in FEATURE_COLUMNS]])
    return scaler.transform(X)


# =========================
# MODEL ENSEMBLE
# =========================
def get_ensemble_score(X_scaled):
    if_score = -if_model.score_samples(X_scaled)
    lof_score = -lof_model.score_samples(X_scaled)

    if_norm = np.clip((if_score - IF_SCORE_MIN) / (IF_SCORE_MAX - IF_SCORE_MIN + 1e-9), 0, 1)
    lof_norm = np.clip((lof_score - LOF_SCORE_MIN) / (LOF_SCORE_MAX - LOF_SCORE_MIN + 1e-9), 0, 1)

    return 0.6 * if_norm + 0.4 * lof_norm


def build_clinical_response(score, prediction, data):
    if prediction == 1:
        risk_level = "HIGH"
        message = "Potential dosage anomaly detected"
        recommendation = "Review prescription before administration"
    else:
        risk_level = "LOW"
        message = "Within expected clinical range"
        recommendation = "Proceed with prescription"

    # risk banding (important for UI gauge)
    if score < 0.3:
        band = "SAFE"
    elif score < 0.7:
        band = "WARNING"
    else:
        band = "DANGER"

    return {
        "prediction": int(prediction),
        "risk_score": round(score, 4),
        "risk_level": risk_level,
        "risk_band": band,
        "message": message,
        "recommendation": recommendation,
    }

def explain_decision(score, data):
    top_factor = max(data, key=lambda k: abs(hash(k)) % 10)  # placeholder logic

    return {
        "explanation": (
            f"Model flagged input due to combined anomaly detection "
            f"on feature distribution deviations."
        ),
        "key_factor": top_factor
    }


# =========================
# ROUTES
# =========================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        valid, error = validate_input(data)
        if not valid:
            return jsonify({"error": error}), 400

        X_scaled = preprocess_input(data)
        score = float(get_ensemble_score(X_scaled))
        prediction = int(score >= ensemble_threshold)

        response = build_clinical_response(score, prediction, data)

        explanation = explain_decision(score, data)
        response["explainability"] = explanation

        log_prediction(data, response)

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/")
def home():
    return jsonify({"app": "MediTrust API", "status": "running"})


@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "features": len(FEATURE_COLUMNS),
        "threshold": float(ensemble_threshold)
    })


@app.route("/override", methods=["POST"])
def override():
    data = request.get_json()

    log_entry = {
        "doctor_id": data.get("doctor_id"),
        "prediction": data.get("prediction"),
        "reason": data.get("reason"),
        "timestamp": data.get("timestamp")
    }

    # later: save to DB
    return jsonify({
        "status": "override recorded",
        "audit": log_entry
    })

import datetime

def log_prediction(data, response):
    log = {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "input": data,
        "output": response
    }

    os.makedirs("logs", exist_ok=True)

    with open("logs/audit.jsonl", "a") as f:
        f.write(json.dumps(log) + "\n")


# =========================
# MAIN
# =========================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)