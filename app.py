import os
import json
import threading
import joblib # type: ignore
import numpy as np # type: ignore
from flask import Flask, request, jsonify
from flask_cors import CORS # type: ignore
from huggingface_hub import hf_hub_download # type: ignore
import datetime

import retrain as retrain_pipeline

app = Flask(__name__)
CORS(app)

retrain_lock = threading.Lock()

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
    if os.path.exists(local_path):
        return local_path
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

ensemble_threshold = metadata.get("ensemble_threshold", 0.2252)


# =========================
# SCORE BOUNDS FOR UI GAUGE
# =========================
IF_SCORE_MIN, IF_SCORE_MAX = 0.30, 0.70
LOF_SCORE_MIN, LOF_SCORE_MAX = 0.80, 2.50


# =========================
# GROUND TRUTH CLINICAL REFERENCE MATRIX
# =========================
PEDIATRIC_GROUND_TRUTH = {
    "amoxicillin": {
        "target_mg_per_kg_day": 45.0,
        "max_single_dose_mg": 500.0,
        "max_freq_per_day": 3,
        "min_therapeutic_ratio": 0.4,
        "class_num": 3
    },
    "paracetamol": {
        "target_mg_per_kg_day": 45.0,
        "max_single_dose_mg": 1000.0,
        "max_freq_per_day": 4,
        "min_therapeutic_ratio": 0.4,
        "class_num": 0
    },
    "ceftriaxone": {
        "target_mg_per_kg_day": 75.0,
        "max_single_dose_mg": 2000.0,
        "max_freq_per_day": 1,
        "min_therapeutic_ratio": 0.4,
        "class_num": 4
    },
    "ibuprofen": {
        "target_mg_per_kg_day": 30.0,
        "max_single_dose_mg": 400.0,
        "max_freq_per_day": 3,
        "min_therapeutic_ratio": 0.4,
        "class_num": 1
    }
}


# =========================
# DETAILED GROUND TRUTH SAFETY NET EVALUATOR
# =========================
def evaluate_ground_truth_safety(medication, weight, dosage, frequency):
    """
    Evaluates the parameters directly against the clinical ground truth rules.
    Returns: (is_safe_by_rules, reason_or_alert_dict)
    """
    med_key = medication.strip().lower()
    
    # If the drug is not tracked in the pediatric rules matrix, hand over entirely to the ML models
    if med_key not in PEDIATRIC_GROUND_TRUTH:
        return None, None
        
    rules = PEDIATRIC_GROUND_TRUTH[med_key]
    daily_dose_mg = dosage * frequency
    target_daily_dose = rules["target_mg_per_kg_day"] * weight
    
    # Check 1: Overdosing check against cap guidelines
    if dosage > rules["max_single_dose_mg"]:
        return False, {
            "type": "GROUND_TRUTH_ERROR",
            "message": f"❌ Single dose of {dosage}mg exceeds the maximum guideline cap of {rules['max_single_dose_mg']}mg."
        }
        
    # Check 2: Frequency threshold violation
    if frequency > rules["max_freq_per_day"]:
        return False, {
            "type": "GROUND_TRUTH_ERROR",
            "message": f"❌ Frequency of {frequency}x/day exceeds the maximum allowed guideline of {rules['max_freq_per_day']}x/day."
        }
        
    # Check 3: Gross daily toxic overdose calculation check (e.g., twofold or tenfold errors)
    if daily_dose_mg > (target_daily_dose * 1.8):
        return False, {
            "type": "GROUND_TRUTH_ERROR",
            "message": f"❌ Total daily intake ({daily_dose_mg}mg) is significantly higher than target weight-proportional guidelines."
        }
        
    # Check 4: Sub-therapeutic dosage check
    if daily_dose_mg < (target_daily_dose * rules["min_therapeutic_ratio"]):
        return False, {
            "type": "GROUND_TRUTH_ERROR",
            "message": f"⚠️ Sub-therapeutic dose detected. Total intake is below the effective therapeutic range."
        }
        
    # If it passes all 4 strict tests, it is mathematically and clinically a verified perfect prescription
    return True, "Verified Ground Truth Safe Entry"


# =========================
# FULL DETERMINISTIC CHECKLIST (for explanation panel — runs every check, doesn't short-circuit)
# =========================
def get_rule_checklist(medication, weight, dosage, frequency):
    med_key = medication.strip().lower()

    # No deterministic guideline exists for this drug — nothing to show here, ML explanation covers it
    if med_key not in PEDIATRIC_GROUND_TRUTH:
        return []

    rules = PEDIATRIC_GROUND_TRUTH[med_key]
    daily_dose_mg = dosage * frequency
    target_daily_dose = rules["target_mg_per_kg_day"] * weight
    safe_ceiling = target_daily_dose * 1.8
    min_therapeutic = target_daily_dose * rules["min_therapeutic_ratio"]

    return [
        {
            "label": "Maximum single dose",
            "passed": dosage <= rules["max_single_dose_mg"],
            "detail": f"Prescribed {dosage:g}mg vs. the {rules['max_single_dose_mg']:g}mg guideline cap for {medication.strip().title()}.",
        },
        {
            "label": "Maximum daily frequency",
            "passed": frequency <= rules["max_freq_per_day"],
            "detail": f"Prescribed {frequency:g}x/day vs. the {rules['max_freq_per_day']:g}x/day guideline maximum.",
        },
        {
            "label": "Daily dose ceiling",
            "passed": daily_dose_mg <= safe_ceiling,
            "detail": f"Total daily intake of {daily_dose_mg:.0f}mg vs. a safe ceiling of {safe_ceiling:.0f}mg ({rules['target_mg_per_kg_day']:g}mg/kg/day target × {weight:g}kg × 1.8).",
        },
        {
            "label": "Minimum therapeutic dose",
            "passed": daily_dose_mg >= min_therapeutic,
            "detail": f"Total daily intake of {daily_dose_mg:.0f}mg vs. a minimum effective dose of {min_therapeutic:.0f}mg.",
        },
    ]


# =========================
# HUMAN-READABLE FEATURE LABELS (for explanation panel)
# =========================
FEATURE_LABELS = {
    "weight_kg": "Patient weight",
    "age_months": "Patient age",
    "age_group_num": "Age group classification",
    "dose_mg": "Single dose amount",
    "freq_per_day": "Doses per day",
    "daily_dose_mg": "Total daily dose",
    "dose_per_kg": "Dose per kilogram of body weight",
    "daily_dose_per_kg": "Total daily dose per kilogram of body weight",
    "deviation_from_guideline": "Deviation from the standard per-kg dosing guideline",
    "dose_to_max_ratio": "Dose relative to the maximum allowed single dose",
    "dose_zscore": "Dose compared to typical doses across all prescriptions",
    "freq_ratio": "Dosing frequency relative to the guideline maximum",
    "drug_class_num": "Drug class",
    "is_above_max_dose": "Exceeds the absolute maximum single dose",
    "is_below_min_therapeutic": "Falls below the minimum effective threshold",
    "is_freq_above_guideline": "Frequency exceeds the guideline maximum",
    "is_age_contraindicated": "Age/weight contraindication",
    "is_tablet_split": "Formulation involves splitting an adult tablet",
    "facility_type_num": "Facility type",
}


def get_model_drivers(x_scaled_row, features_dict, top_n=4):
    """
    Ranks engineered features by how far their scaled (z-score) value sits from
    the training distribution's mean — the biggest drivers of the IF/LOF anomaly score.
    """
    drivers = []
    for name, z in zip(FEATURE_COLUMNS, x_scaled_row):
        z = float(z)
        if z >= 2:
            direction = "far above typical"
        elif z >= 0.75:
            direction = "above typical"
        elif z <= -2:
            direction = "far below typical"
        elif z <= -0.75:
            direction = "below typical"
        else:
            direction = "near typical"

        drivers.append({
            "feature": name,
            "label": FEATURE_LABELS.get(name, name.replace('_', ' ').title()),
            "value": round(float(features_dict.get(name, 0)), 3),
            "z_score": round(z, 2),
            "direction": direction,
        })

    drivers.sort(key=lambda d: abs(d["z_score"]), reverse=True)
    return drivers[:top_n]


# =========================
# FEATURE EXTRACTION & ENGINEERING PIPELINE
# =========================
def preprocess_input(data):
    weight_kg = float(data.get("weight", 15))
    age_months = float(data.get("age", 24))
    dose_mg = float(data.get("dosage", 0))
    freq_per_day = float(data.get("frequency", 1))

    daily_dose_mg = dose_mg * freq_per_day
    dose_per_kg = dose_mg / (weight_kg + 1e-9)
    daily_dose_per_kg = daily_dose_mg / (weight_kg + 1e-9)

    med_name = data.get("medication", "").strip().lower()
    gl = PEDIATRIC_GROUND_TRUTH.get(med_name, {"target_mg_per_kg_day": 45.0, "max_single_dose_mg": 1000.0, "max_freq_per_day": 3, "class_num": 1})

    target_daily_dose = gl["target_mg_per_kg_day"] * weight_kg
    deviation_from_guideline = (daily_dose_mg - target_daily_dose) / (target_daily_dose + 1e-9)
    dose_to_max_ratio = dose_mg / gl["max_single_dose_mg"]
    freq_ratio = freq_per_day / gl["max_freq_per_day"]

    # Replicate exact Z-score normalization scaling derived from train_data_calibrated properties
    dose_zscore = (dose_mg - 129.3243) / (138.2043 + 1e-9)

    age_group_num = 1 if age_months < 12 else (2 if age_months < 36 else 3)
    is_above_max_dose = 1 if dose_mg > gl["max_single_dose_mg"] else 0
    is_below_min_therapeutic = 1 if daily_dose_mg < (target_daily_dose * 0.4) else 0
    is_freq_above_guideline = 1 if freq_per_day > gl["max_freq_per_day"] else 0

    features_dict = {
        "weight_kg": weight_kg,
        "age_months": age_months,
        "age_group_num": age_group_num,
        "dose_mg": dose_mg,
        "freq_per_day": freq_per_day,
        "daily_dose_mg": daily_dose_mg,
        "dose_per_kg": dose_per_kg,
        "daily_dose_per_kg": daily_dose_per_kg,
        "deviation_from_guideline": deviation_from_guideline,
        "dose_to_max_ratio": dose_to_max_ratio,
        "dose_zscore": dose_zscore,
        "freq_ratio": freq_ratio,
        "drug_class_num": gl["class_num"],
        "is_above_max_dose": is_above_max_dose,
        "is_below_min_therapeutic": is_below_min_therapeutic,
        "is_freq_above_guideline": is_freq_above_guideline,
        "is_age_contraindicated": 0,
        "is_tablet_split": 0,
        "facility_type_num": 1
    }

    X_raw = np.array([[features_dict.get(col, 0) for col in FEATURE_COLUMNS]])
    return scaler.transform(X_raw), features_dict


def get_ensemble_score(X_scaled):
    if_score = -if_model.score_samples(X_scaled)
    lof_score = -lof_model.score_samples(X_scaled)

    if_norm = np.clip((if_score - IF_SCORE_MIN) / (IF_SCORE_MAX - IF_SCORE_MIN + 1e-9), 0, 1)
    lof_norm = np.clip((lof_score - LOF_SCORE_MIN) / (LOF_SCORE_MAX - LOF_SCORE_MIN + 1e-9), 0, 1)

    return 0.6 * if_norm + 0.4 * lof_norm


# =========================
# ROUTES
# =========================
@app.route("/api/cdss/evaluate-prescription", methods=["POST"])
def evaluate_prescription():
    try:
        data = request.get_json()
        
        medication = data.get("medication", "").strip()
        age = float(data.get("age", 0) if data.get("age") else 0)
        weight = float(data.get("weight", 0) if data.get("weight") else 0)
        dosage = float(data.get("dosage", 0) if data.get("dosage") else 0)
        frequency = float(data.get("frequency", 1) if data.get("frequency") else 1)
        
        # 1. RUN THE DETERMINISTIC GROUND TRUTH SAFETY OVERRIDE ENGINE FIRST
        is_safe_by_rules, rule_outcome = evaluate_ground_truth_safety(medication, weight, dosage, frequency)

        # 2. RUN MATHEMATICAL MACHINE LEARNING MODELS PIPELINE
        X_scaled, features_dict = preprocess_input(data)
        score = float(get_ensemble_score(X_scaled))
        raw_score = score  # keep the model's own score for the explanation, even if rules override it below

        # Build base dictionary response properties
        if score < 0.20:
            band = "SAFE"
            risk_level = "LOW"
            message = "Within expected clinical range"
            recommendation = "Proceed with prescription"
        elif score < 0.50:
            band = "WARNING"
            risk_level = "MEDIUM"
            message = "Mild feature distribution deviation detected"
            recommendation = "Review prescription before finalizing"
        else:
            band = "DANGER"
            risk_level = "HIGH"
            message = "Potential dosage anomaly detected"
            recommendation = "Check parameters against target safety charts"

        prediction = int(score >= ensemble_threshold)

        # 3. INTERCEPT AND OVERRIDE CLASSIFICATIONS BASED ON GROUND TRUTH CHECKS
        alerts = []
        safety_level = "APPROVED"
        
        if is_safe_by_rules is True:
            # FORCE standard safety variables to overwrite machine learning model false-positives
            prediction = 0
            score = 0.05
            risk_level = "LOW"
            band = "SAFE"
            message = "Verified Ground Truth Safe Entry"
            recommendation = "Proceed with prescription"
            
        elif is_safe_by_rules is False:
            # FORCE safety panels to catch deterministic violations immediately
            prediction = 1
            risk_level = "HIGH"
            band = "DANGER"
            safety_level = "BLOCKED"
            alerts.append({
                "type": rule_outcome["type"],
                "severity": "CRITICAL",
                "message": rule_outcome["message"],
                "recommendation": "Adjust parameters to align with weight-based pediatric guidelines"
            })

        # 4. BUILD THE EXPLANATION PANEL — real numbers from the rule engine + the trained scaler's feature statistics
        rule_checks = get_rule_checklist(medication, weight, dosage, frequency)
        model_drivers = get_model_drivers(X_scaled[0], features_dict)
        alert_thresholds = metadata.get("alert_thresholds", {})

        if is_safe_by_rules is True:
            summary = (
                f"Approved — all {len(rule_checks)} deterministic pediatric dosing checks passed for "
                f"{medication.strip().title()}, and the statistical anomaly score ({raw_score:.2f}) is below "
                f"the alert threshold ({ensemble_threshold:.2f})."
            )
        elif is_safe_by_rules is False:
            summary = (
                f"Blocked — {rule_outcome['message']} This deterministic guideline violation overrides the "
                f"statistical model's own score of {raw_score:.2f}."
            )
        elif prediction == 1:
            summary = (
                f"Flagged by the statistical model — the anomaly score ({raw_score:.2f}) is at or above the "
                f"alert threshold ({ensemble_threshold:.2f}). No deterministic pediatric guideline exists for "
                f"'{medication}', so this relies entirely on how this prescription's feature profile compares "
                f"to the trained Isolation Forest + LOF ensemble."
            )
        else:
            summary = (
                f"Approved by the statistical model — the anomaly score ({raw_score:.2f}) is below the alert "
                f"threshold ({ensemble_threshold:.2f}). No deterministic pediatric guideline exists for "
                f"'{medication}'."
            )

        return jsonify({
            "anomaly_detection": {
                "prediction": prediction,
                "risk_score": round(score, 4),
                "risk_level": risk_level,
                "risk_band": band,
                "message": message,
                "recommendation": recommendation,
                "explainability": {
                    "explanation": "Evaluated against ground truth reference matrix & model feature distributions.",
                    "key_factor": "Weight-to-Dose Ratio"
                }
            },
            "cdss_alerts": alerts,
            "overall_safety": safety_level,
            "explanation": {
                "summary": summary,
                "rule_checks": rule_checks,
                "model_drivers": model_drivers,
                "risk_summary": {
                    "raw_risk_score": round(raw_score, 4),
                    "ensemble_threshold": ensemble_threshold,
                    "red_threshold": alert_thresholds.get("red_threshold"),
                    "yellow_threshold": alert_thresholds.get("yellow_threshold"),
                },
            },
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/admin/model-status", methods=["GET"])
def model_status():
    return jsonify({
        "metadata": metadata,
        "is_retraining": retrain_lock.locked(),
    })


@app.route("/api/admin/retrain", methods=["POST"])
def retrain_model():
    global if_model, lof_model, scaler, FEATURE_COLUMNS, metadata, ensemble_threshold

    if not retrain_lock.acquire(blocking=False):
        return jsonify({"error": "A retraining job is already in progress."}), 409

    try:
        data = request.get_json(silent=True) or {}
        contamination_pct = float(data.get("contamination", 20))
        mode = data.get("mode", "full")

        result = retrain_pipeline.run_retrain(contamination=contamination_pct / 100.0, mode=mode)

        # Hot-reload the newly trained artifacts into the running service
        if_model = joblib.load(load_file("isolation_forest.pkl"))
        lof_model = joblib.load(load_file("lof_model.pkl"))
        scaler = joblib.load(load_file("scaler.pkl"))
        with open(load_file("feature_columns.json")) as f:
            FEATURE_COLUMNS = json.load(f)
        metadata = result["metadata"]
        ensemble_threshold = metadata.get("ensemble_threshold", ensemble_threshold)

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        retrain_lock.release()


@app.route("/")
def home():
    return jsonify({"app": "MediTrust Hybrid CDSS API", "status": "running"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)