"""
MediTrust — On-Demand Model Retraining Pipeline
=================================================
Reproduces the hybrid IsolationForest + LOF ensemble methodology from
Anomaly_Detection.ipynb as a callable function, so the Admin Dashboard's
"Retrain Models" action can regenerate calibrated synthetic data and
refit/overwrite the production model artifacts under models/.
"""

import os
import time
import json
from datetime import datetime

import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    precision_recall_curve,
    confusion_matrix,
)
import joblib

import Data_Generator as dg

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "meditrust_data")

MODEL_FEATURES = [
    "weight_kg", "age_months", "age_group_num", "dose_mg", "freq_per_day",
    "daily_dose_mg", "dose_per_kg", "daily_dose_per_kg", "deviation_from_guideline",
    "dose_to_max_ratio", "dose_zscore", "freq_ratio", "drug_class_num",
    "is_above_max_dose", "is_below_min_therapeutic", "is_freq_above_guideline",
    "is_age_contraindicated", "is_tablet_split", "facility_type_num",
]

DATASET_PRESETS = {
    "quick": {"n_train": 2500, "n_test_clean": 2000, "n_test_anomaly": 500},
    "full": {"n_train": 10000, "n_test_clean": 8000, "n_test_anomaly": 2000},
}


def _normalise(scores):
    return (scores - scores.min()) / (scores.max() - scores.min() + 1e-9)


def run_retrain(contamination: float = 0.2, mode: str = "full") -> dict:
    """Regenerates calibrated synthetic data and refits the IF + LOF ensemble.

    Returns a JSON-serialisable summary (also written to models/model_metadata.json).
    """
    if mode not in DATASET_PRESETS:
        mode = "full"
    preset = DATASET_PRESETS[mode]
    contamination = float(np.clip(contamination, 0.01, 0.5))

    start = time.time()
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MODEL_DIR, exist_ok=True)

    previous_metadata = None
    metadata_path = os.path.join(MODEL_DIR, "model_metadata.json")
    if os.path.exists(metadata_path):
        with open(metadata_path) as f:
            previous_metadata = json.load(f)

    train_df = dg.generate_dataset(preset["n_train"], 0, start_id=0, label="TRAIN")
    train_df = dg.add_dose_zscore(train_df)
    test_df = dg.generate_dataset(
        preset["n_test_clean"], preset["n_test_anomaly"],
        start_id=preset["n_train"] + 1, label="TEST",
    )
    test_df = dg.add_dose_zscore(test_df)

    train_df.to_csv(os.path.join(DATA_DIR, "train_data_calibrated.csv"), index=False)
    test_df.to_csv(os.path.join(DATA_DIR, "test_data_calibrated.csv"), index=False)

    X_train = train_df[MODEL_FEATURES].fillna(0).values
    X_test = test_df[MODEL_FEATURES].fillna(0).values
    y_test = test_df["is_anomaly"].values

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    if_model = IsolationForest(
        n_estimators=500,
        contamination=contamination,
        max_samples=0.8,
        max_features=0.8,
        bootstrap=True,
        random_state=42,
        n_jobs=-1,
    )
    if_model.fit(X_train_scaled)
    if_scores_raw = -if_model.score_samples(X_test_scaled)

    lof_model = LocalOutlierFactor(n_neighbors=20, contamination=0.05, novelty=True, n_jobs=-1)
    lof_model.fit(X_train_scaled)
    lof_scores_raw = -lof_model.score_samples(X_test_scaled)

    ensemble_scores = 0.6 * _normalise(if_scores_raw) + 0.4 * _normalise(lof_scores_raw)

    precisions, recalls, thresholds = precision_recall_curve(y_test, ensemble_scores)
    f1_curve = np.where(
        (precisions + recalls) > 0,
        2 * precisions * recalls / (precisions + recalls), 0,
    )
    best_idx = int(np.argmax(f1_curve[:-1]))
    best_threshold = float(thresholds[best_idx])

    preds = (ensemble_scores >= best_threshold).astype(int)
    precision = float(precision_score(y_test, preds, zero_division=0))
    recall = float(recall_score(y_test, preds, zero_division=0))
    f1 = float(f1_score(y_test, preds, zero_division=0))
    auc = float(roc_auc_score(y_test, ensemble_scores))
    tn, fp, fn, tp = confusion_matrix(y_test, preds).ravel()
    alert_fatigue = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0

    scores_normal = ensemble_scores[y_test == 0]
    red_threshold = float(np.percentile(scores_normal, 92))
    yellow_threshold = float(np.percentile(scores_normal, 75))

    joblib.dump(if_model, os.path.join(MODEL_DIR, "isolation_forest.pkl"))
    joblib.dump(lof_model, os.path.join(MODEL_DIR, "lof_model.pkl"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))

    with open(os.path.join(MODEL_DIR, "feature_columns.json"), "w") as f:
        json.dump(MODEL_FEATURES, f, indent=2)

    duration = round(time.time() - start, 2)
    version = int(previous_metadata.get("version", 0)) + 1 if previous_metadata else 1

    metadata = {
        "model_type": "Hybrid: IsolationForest + LOF + RuleEngine",
        "trained_at": datetime.now().isoformat(),
        "trained_by": "admin_manual_retrain",
        "version": version,
        "mode": mode,
        "contamination": contamination,
        "duration_seconds": duration,
        "n_features": len(MODEL_FEATURES),
        "features": MODEL_FEATURES,
        "dataset_sizes": {
            "train_rows": len(train_df),
            "test_rows": len(test_df),
            "test_anomalies": int(test_df["is_anomaly"].sum()),
        },
        "ensemble_threshold": round(best_threshold, 4),
        "alert_thresholds": {
            "red_threshold": round(red_threshold, 4),
            "yellow_threshold": round(yellow_threshold, 4),
        },
        "performance": {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1": round(f1, 4),
            "roc_auc": round(auc, 4),
            "true_positives": int(tp),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_negatives": int(tn),
            "alert_fatigue_rate": round(alert_fatigue, 4),
        },
    }
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    return {"metadata": metadata, "previous_metadata": previous_metadata}


if __name__ == "__main__":
    result = run_retrain()
    print(json.dumps(result["metadata"], indent=2))
