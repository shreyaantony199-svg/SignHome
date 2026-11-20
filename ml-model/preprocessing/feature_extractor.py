"""
SignHome ML Feature Preprocessing Pipeline
Extracts rotation-, scale-, and position-invariant 129-D geometric features
from MediaPipe hand landmarks, exactly matching static_landmarks.csv.
"""

from typing import List, Union, Optional
import numpy as np


def normalize_landmarks(
    hands_data: Union[List, np.ndarray],
    second_hand_data: Optional[Union[List, np.ndarray]] = None
) -> np.ndarray:
    """
    Extracts 129-dimensional feature vector matching static_landmarks.csv.
    
    Structure:
    - Features 0..62 (63 values): Hand 1 normalized 21 landmarks (x, y, z relative to wrist, scaled by max distance)
    - Features 63..125 (63 values): Hand 2 normalized 21 landmarks (if present, else 0.0)
    - Features 126..128 (3 values): Relative wrist offset (Hand 2 wrist - Hand 1 wrist) / Hand 1 scale (if Hand 2 present, else 0.0)
    
    Parameters:
    - hands_data: Can be:
        1. A list of 21 keypoints [[x, y, z], ...] for 1 hand
        2. A list of two hands [hand1_21_pts, hand2_21_pts]
        3. A flat or 2D array of coordinates
    - second_hand_data: Optional 2nd hand keypoints if passed separately
    """
    hands = []

    # Handle various input formats
    if second_hand_data is not None:
        h1 = np.array(hands_data, dtype=np.float32).reshape(-1, 3)
        h2 = np.array(second_hand_data, dtype=np.float32).reshape(-1, 3)
        hands = [h1, h2]
    elif isinstance(hands_data, (list, tuple)) and len(hands_data) > 0:
        first_elem = hands_data[0]
        # Check if list of hands: [[ [x,y,z], ... 21 times ], [ [x,y,z], ... 21 times ]]
        if isinstance(first_elem, (list, tuple, np.ndarray)) and len(first_elem) > 0:
            first_inner = first_elem[0]
            if isinstance(first_inner, (list, tuple, np.ndarray)):
                # Multiple hands
                for h in hands_data[:2]:
                    arr = np.array(h, dtype=np.float32).reshape(-1, 3)
                    if len(arr) >= 21:
                        hands.append(arr[:21])
            else:
                # Single hand of 21 points
                arr = np.array(hands_data, dtype=np.float32).reshape(-1, 3)
                if len(arr) >= 42:
                    hands.append(arr[:21])
                    hands.append(arr[21:42])
                elif len(arr) >= 21:
                    hands.append(arr[:21])
        else:
            arr = np.array(hands_data, dtype=np.float32).reshape(-1, 3)
            if len(arr) >= 21:
                hands.append(arr[:21])
    elif isinstance(hands_data, np.ndarray):
        arr = hands_data.astype(np.float32).reshape(-1, 3)
        if len(arr) >= 42:
            hands.append(arr[:21])
            hands.append(arr[21:42])
        elif len(arr) >= 21:
            hands.append(arr[:21])

    features = np.zeros(129, dtype=np.float32)

    if not hands:
        return features

    # If two hands detected, sort left-to-right by wrist x coordinate
    if len(hands) >= 2:
        if hands[0][0, 0] > hands[1][0, 0]:
            h1, h2 = hands[1], hands[0]
        else:
            h1, h2 = hands[0], hands[1]
    else:
        h1 = hands[0]
        h2 = None

    # 1. Normalize Hand 1
    wrist1 = h1[0].copy()
    rel1 = h1 - wrist1
    scale1 = np.max(np.linalg.norm(rel1, axis=1))
    if scale1 < 1e-6:
        scale1 = 1.0
    h1_norm = rel1 / scale1
    features[0:63] = h1_norm.flatten()

    # 2. Normalize Hand 2 (if present)
    if h2 is not None:
        wrist2 = h2[0].copy()
        rel2 = h2 - wrist2
        scale2 = np.max(np.linalg.norm(rel2, axis=1))
        if scale2 < 1e-6:
            scale2 = 1.0
        h2_norm = rel2 / scale2
        features[63:126] = h2_norm.flatten()

        # 3. Relative wrist displacement normalized by Hand 1 scale
        rel_wrist = (wrist2 - wrist1) / scale1
        features[126] = rel_wrist[0]
        features[127] = rel_wrist[1]
        features[128] = rel_wrist[2]

    return features


def extract_features_batch(landmarks_batch: List) -> np.ndarray:
    """Extract 129-D features for multiple frames"""
    features = [normalize_landmarks(lm) for lm in landmarks_batch]
    return np.array(features, dtype=np.float32)
