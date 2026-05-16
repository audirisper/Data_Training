import os, json, joblib
import numpy as np
from flask import Flask, request, jsonify

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

with open(os.path.join(MODEL_DIR, 'feature_columns.json')) as f:
    FEATURE_COLUMNS = json.load(f)
with open(os.path.join(MODEL_DIR, 'model_metadata.json')) as f:
    metadata = json.load(f)

from huggingface_hub import hf_hub_download
import joblib
import json

def _load(self):

    repo_id = "audirisper/AnomalyDetection"

    # Download model files
    if_path = hf_hub_download(
        repo_id=repo_id,
        filename="isolation_forest.pkl"
    )

    lof_path = hf_hub_download(
        repo_id=repo_id,
        filename="lof_model.pkl"
    )

    scaler_path = hf_hub_download(
        repo_id=repo_id,
        filename="scaler.pkl"
    )

    feature_cols_path = hf_hub_download(
        repo_id=repo_id,
        filename="feature_columns.json"
    )

    metadata_path = hf_hub_download(
        repo_id=repo_id,
        filename="model_metadata.json"
    )

    # Load models
    self.if_model = joblib.load(if_path)
    self.lof_model = joblib.load(lof_path)
    self.scaler = joblib.load(scaler_path)

    # Load JSON files
    with open(feature_cols_path) as f:
        self.features = json.load(f)

    with open(metadata_path) as f:
        self.metadata = json.load(f)

    print("Models loaded successfully from Hugging Face")

ensemble_threshold = metadata['ensemble_threshold']
IF_SCORE_MIN,  IF_SCORE_MAX  = 0.30, 0.70
LOF_SCORE_MIN, LOF_SCORE_MAX = 0.80, 2.50

app = Flask(__name__)

def preprocess_input(data):
    if isinstance(data, dict): data = [data]
    X = np.array([[row.get(col, 0) for col in FEATURE_COLUMNS] for row in data])
    return scaler.transform(X)

def get_ensemble_scores(X_scaled):
    if_scores  = -if_model.score_samples(X_scaled)
    lof_scores = -lof_model.score_samples(X_scaled)
    if_norm  = np.clip((if_scores  - IF_SCORE_MIN)  / (IF_SCORE_MAX  - IF_SCORE_MIN  + 1e-9), 0, 1)
    lof_norm = np.clip((lof_scores - LOF_SCORE_MIN) / (LOF_SCORE_MAX - LOF_SCORE_MIN + 1e-9), 0, 1)
    return (0.6 * if_norm + 0.4 * lof_norm).tolist()

@app.route('/predict', methods=['POST'])
def predict():
    try:
        input_data = request.get_json()
        if not input_data:
            return jsonify({'error': 'No input data provided'}), 400
        X_scaled = preprocess_input(input_data)
        scores   = get_ensemble_scores(X_scaled)
        preds    = [int(score >= ensemble_threshold) for score in scores]
        return jsonify({'predictions': preds, 'scores': scores,
                        'threshold': ensemble_threshold, 'feature_order': FEATURE_COLUMNS})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def home():
    return jsonify({'app': 'MediTrust API', 'status': 'running'})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'features': len(FEATURE_COLUMNS),
                    'threshold': ensemble_threshold})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_ENV')=='development')