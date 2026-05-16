from huggingface_hgitub import upload_file

repo_id = "audirisper/AnomalyDetection"

upload_file("isolation_forest.pkl", "isolation_forest.pkl", repo_id=repo_id)
upload_file("lof_model.pkl", "lof_model.pkl", repo_id=repo_id)
upload_file("scaler.pkl", "scaler.pkl", repo_id=repo_id)