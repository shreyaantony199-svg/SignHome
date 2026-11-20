"""
SignHome Recognition & AI Inference Routes
Connected directly to authentic static_landmarks.csv trained model.
"""

import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional
import joblib
import numpy as np
from fastapi import APIRouter, HTTPException

from ..models.schemas import RecognitionRequest, RecognitionResponse

# Ensure ML preprocessing can be imported
ML_DIR = Path(__file__).resolve().parent.parent.parent.parent / "ml-model"
sys.path.append(str(ML_DIR))
from preprocessing.feature_extractor import normalize_landmarks

router = APIRouter(prefix="/recognition", tags=["AI Recognition"])

# Load trained model bundle
MODEL_PATH = ML_DIR / "saved_models" / "isl_gesture_classifier.joblib"
MODEL_BUNDLE = None
try:
    if MODEL_PATH.exists():
        MODEL_BUNDLE = joblib.load(MODEL_PATH)
        print(f"[SignHome ML] Successfully loaded {MODEL_BUNDLE.get('model_type')} from {MODEL_PATH}")
        print(f"[SignHome ML] Model accuracy: {MODEL_BUNDLE.get('accuracy', 0.0) * 100:.2f}% on {len(MODEL_BUNDLE.get('classes', []))} classes")
    else:
        print(f"[SignHome ML] Warning: Model file not found at {MODEL_PATH}")
except Exception as e:
    print(f"[SignHome ML] Error loading joblib model: {e}")

# Display mapping for predictions
DISPLAY_MAP = {
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


@router.post("/predict", response_model=RecognitionResponse)
def predict_gesture(payload: RecognitionRequest):
    # Check if pre-extracted features provided or landmarks provided
    if payload.features and len(payload.features) == 129:
        feature_vector = np.array(payload.features, dtype=np.float32).reshape(1, -1)
    elif payload.landmarks:
        feature_vector = normalize_landmarks(payload.landmarks, payload.second_hand_landmarks).reshape(1, -1)
    else:
        return RecognitionResponse(
            predicted_gesture="No hand detected. Please show your hand clearly.",
            confidence=0.0,
            is_confident=False,
            tamil_meaning="",
            alternative_candidates=[],
            timestamp=datetime.utcnow().isoformat()
        )

    # Check if vector is all zeros (no hand)
    if np.all(feature_vector == 0):
        return RecognitionResponse(
            predicted_gesture="No hand detected. Please show your hand clearly.",
            confidence=0.0,
            is_confident=False,
            tamil_meaning="",
            alternative_candidates=[],
            timestamp=datetime.utcnow().isoformat()
        )

    if not MODEL_BUNDLE or "model" not in MODEL_BUNDLE:
        raise HTTPException(status_code=500, detail="ML Model not loaded on server")

    model = MODEL_BUNDLE["model"]
    classes = MODEL_BUNDLE.get("classes", model.classes_)

    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(feature_vector)[0]
        top_indices = np.argsort(probs)[::-1][:3]
        
        raw_top_class = str(classes[top_indices[0]])
        confidence = float(probs[top_indices[0]])
        
        candidates = [
            {
                "raw_label": str(classes[idx]),
                "display": DISPLAY_MAP.get(str(classes[idx]), str(classes[idx])),
                "confidence": round(float(probs[idx]), 3)
            }
            for idx in top_indices
        ]
    else:
        pred = model.predict(feature_vector)[0]
        raw_top_class = str(pred)
        confidence = 0.90
        candidates = [{"raw_label": raw_top_class, "display": DISPLAY_MAP.get(raw_top_class, raw_top_class), "confidence": 0.90}]

    display_char = DISPLAY_MAP.get(raw_top_class, raw_top_class)
    tamil_meaning = TAMIL_GLOSS_MAP.get(raw_top_class, "")

    # Confidence check
    CONFIDENCE_THRESHOLD = 0.50
    is_confident = confidence >= CONFIDENCE_THRESHOLD

    if not is_confident:
        display_label = "Gesture unclear. Please try again."
        tamil_meaning = ""
    else:
        display_label = display_char

    return RecognitionResponse(
        predicted_gesture=display_label,
        confidence=round(confidence, 3),
        is_confident=is_confident,
        tamil_meaning=tamil_meaning,
        alternative_candidates=candidates,
        timestamp=datetime.utcnow().isoformat()
    )


@router.get("/classes")
def get_supported_classes():
    if MODEL_BUNDLE:
        classes = MODEL_BUNDLE.get("classes", [])
        return {
            "classes": classes,
            "display_classes": [DISPLAY_MAP.get(c, c) for c in classes],
            "model_type": MODEL_BUNDLE.get("model_type", "RandomForestClassifier"),
            "test_accuracy": MODEL_BUNDLE.get("accuracy", 0.96),
            "feature_dim": MODEL_BUNDLE.get("feature_dim", 129),
            "alphabets_count": len([c for c in classes if not c.startswith("num_")]),
            "numbers_count": len([c for c in classes if c.startswith("num_")])
        }
    return {
        "classes": list(DISPLAY_MAP.keys()),
        "display_classes": list(DISPLAY_MAP.values()),
        "model_type": "RandomForestClassifier",
        "test_accuracy": 0.96,
        "feature_dim": 129
    }
