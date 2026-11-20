"""
SignHome ML Classifier Training Pipeline
Trains Random Forest on authentic static_landmarks.csv dataset.
Saves the trained model bundle to joblib and exports browser-ready model weights to JSON.
"""

import os
import sys
import json
import time
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Set paths
ML_DIR = Path(__file__).resolve().parent.parent
PROJECT_DIR = ML_DIR.parent
DATASET_PATH = PROJECT_DIR / "dataset" / "training_data" / "static_landmarks.csv"
SAVED_MODELS_DIR = ML_DIR / "saved_models"
FRONTEND_SERVICES_DIR = PROJECT_DIR / "frontend" / "src" / "services"

SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
FRONTEND_SERVICES_DIR.mkdir(parents=True, exist_ok=True)

# Tamil translations for dataset labels
LABEL_DISPLAY_MAP = {
    "a": "A", "b": "B", "c": "C", "d": "D", "e": "E", "f": "F", "g": "G",
    "i": "I", "k": "K", "l": "L", "m": "M", "n": "N", "o": "O", "p": "P",
    "q": "Q", "r": "R", "s": "S", "t": "T", "u": "U", "v": "V", "w": "W",
    "x": "X", "y": "Y", "z": "Z",
    "num_0": "0", "num_1": "1", "num_2": "2", "num_3": "3", "num_4": "4",
    "num_5": "5", "num_7": "7", "num_8": "8", "num_9": "9"
}

TAMIL_GLOSS_MAP = {
    "a": "அகரவரிசை ஏ (A)", "b": "அகரவரிசை பி (B)", "c": "அகரவரிசை சி (C)",
    "d": "அகரவரிசை டி (D)", "e": "அகரவரிசை ஈ (E)", "f": "அகரவரிசை எஃப் (F)",
    "g": "அகரவரிசை ஜி (G)", "i": "அகரவரிசை ஐ (I)", "k": "அகரவரிசை கே (K)",
    "l": "அகரவரிசை எல் (L)", "m": "அகரவரிசை எம் (M)", "n": "அகரவரிசை என் (N)",
    "o": "அகரவரிசை ஓ (O)", "p": "அகரவரிசை பி (P)", "q": "அகரவரிசை கியூ (Q)",
    "r": "அகரவரிசை ஆர் (R)", "s": "அகரவரிசை எஸ் (S)", "t": "அகரவரிசை டி (T)",
    "u": "அகரவரிசை யூ (U)", "v": "அகரவரிசை வி (V)", "w": "அகரவரிசை டபிள்யூ (W)",
    "x": "அகரவரிசை எக்ஸ் (X)", "y": "அகரவரிசை ஒய் (Y)", "z": "அகரவரிசை இசட் (Z)",
    "num_0": "எண் 0 (பூஜ்யம்)", "num_1": "எண் 1 (ஒன்று)", "num_2": "எண் 2 (இரண்டு)",
    "num_3": "எண் 3 (மூன்று)", "num_4": "எண் 4 (நான்கு)", "num_5": "எண் 5 (ஐந்து)",
    "num_7": "எண் 7 (ஏழு)", "num_8": "எண் 8 (எட்டு)", "num_9": "எண் 9 (ஒன்பது)"
}


def load_dataset():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")
    
    print(f"[SignHome ML] Loading dataset from: {DATASET_PATH}")
    df = pd.read_csv(DATASET_PATH)
    print(f"[SignHome ML] Loaded {len(df)} samples across {df['label'].nunique()} classes.")
    
    feature_cols = [f"f{i}" for i in range(129)]
    X = df[feature_cols].values.astype(np.float32)
    y = df["label"].values.astype(str)
    return X, y


def export_forest_to_json(rf, filepath):
    """Exports Random Forest trees into compact JSON for zero-latency client inference"""
    classes = rf.classes_.tolist()
    trees_data = []
    
    for estimator in rf.estimators_:
        t = estimator.tree_
        norm_values = []
        for v in t.value:
            probs = v[0] / np.sum(v[0])
            norm_values.append([round(float(p), 4) for p in probs])
            
        trees_data.append({
            "f": t.feature.tolist(),
            "th": [round(float(x), 4) for x in t.threshold],
            "l": t.children_left.tolist(),
            "r": t.children_right.tolist(),
            "v": norm_values
        })
    
    export_payload = {
        "classes": classes,
        "display_map": LABEL_DISPLAY_MAP,
        "tamil_map": TAMIL_GLOSS_MAP,
        "feature_dim": 129,
        "n_trees": len(trees_data),
        "trees": trees_data
    }
    
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(export_payload, f)
    print(f"[SignHome ML] Exported browser-ready model weights to {filepath} ({filepath.stat().st_size / 1024:.1f} KB)")


def train():
    X, y = load_dataset()
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[SignHome ML] Split: Train={X_train.shape[0]}, Test={X_test.shape[0]}")
    
    # Train Random Forest (100 trees, depth 18)
    print("[SignHome ML] Training Random Forest Classifier...")
    t0 = time.time()
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=18,
        min_samples_split=2,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    train_time = time.time() - t0
    
    # Evaluate
    y_pred = rf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"[SignHome ML] Training completed in {train_time:.2f}s")
    print(f"[SignHome ML] Test Set Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, digits=3))
    
    # Save Joblib Bundle
    joblib_path = SAVED_MODELS_DIR / "isl_gesture_classifier.joblib"
    model_bundle = {
        "model": rf,
        "classes": rf.classes_.tolist(),
        "display_map": LABEL_DISPLAY_MAP,
        "tamil_map": TAMIL_GLOSS_MAP,
        "accuracy": float(acc),
        "model_type": "RandomForestClassifier",
        "feature_dim": 129,
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    joblib.dump(model_bundle, joblib_path)
    print(f"[SignHome ML] Saved joblib model to {joblib_path}")
    
    # Export JSON weights for browser inference
    json_path_ml = SAVED_MODELS_DIR / "model_weights.json"
    json_path_frontend = FRONTEND_SERVICES_DIR / "model_weights.json"
    export_forest_to_json(rf, json_path_ml)
    export_forest_to_json(rf, json_path_frontend)
    
    return rf, acc


if __name__ == "__main__":
    train()
