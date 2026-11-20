/**
 * SignHome Real-Time ISL Classifier Engine (Client-Side)
 * 
 * Extracts 129-D geometric features from MediaPipe Hand Landmarks
 * matching static_landmarks.csv and evaluates the trained Random Forest model.
 */

import modelData from './model_weights.json';

export const DISPLAY_MAP = {
  a: 'A', b: 'B', c: 'C', d: 'D', e: 'E', f: 'F', g: 'G',
  i: 'I', k: 'K', l: 'L', m: 'M', n: 'N', o: 'O', p: 'P',
  q: 'Q', r: 'R', s: 'S', t: 'T', u: 'U', v: 'V', w: 'W',
  x: 'X', y: 'Y', z: 'Z',
  num_0: '0', num_1: '1', num_2: '2', num_3: '3', num_4: '4',
  num_5: '5', num_7: '7', num_8: '8', num_9: '9'
};

export const TAMIL_MAP = {
  a: 'அகரவரிசை ஏ (A)', b: 'அகரவரிசை பி (B)', c: 'அகரவரிசை சி (C)',
  d: 'அகரவரிசை டி (D)', e: 'அகரவரிசை ஈ (E)', f: 'அகரவரிசை எஃப் (F)',
  g: 'அகரவரிசை ஜி (G)', i: 'அகரவரிசை ஐ (I)', k: 'அகரவரிசை கே (K)',
  l: 'அகரவரிசை எல் (L)', m: 'அகரவரிசை எம் (M)', n: 'அகரவரிசை என் (N)',
  o: 'அகரவரிசை ஓ (O)', p: 'அகரவரிசை பி (P)', q: 'அகரவரிசை கியூ (Q)',
  r: 'அகரவரிசை ஆர் (R)', s: 'அகரவரிசை எஸ் (S)', t: 'அகரவரிசை டி (T)',
  u: 'அகரவரிசை யூ (U)', v: 'அகரவரிசை வி (V)', w: 'அகரவரிசை டபிள்யூ (W)',
  x: 'அகரவரிசை எக்ஸ் (X)', y: 'அகரவரிசை ஒய் (Y)', z: 'அகரவரிசை இசட் (Z)',
  num_0: 'எண் 0 (பூஜ்யம்)', num_1: 'எண் 1 (ஒன்று)', num_2: 'எண் 2 (இரண்டு)',
  num_3: 'எண் 3 (மூன்று)', num_4: 'எண் 4 (நான்கு)', num_5: 'எண் 5 (ஐந்து)',
  num_7: 'எண் 7 (ஏழு)', num_8: 'எண் 8 (எட்டு)', num_9: 'எண் 9 (ஒன்பது)'
};

export const SUPPORTED_ALPHABETS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'I', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

export const SUPPORTED_NUMBERS = [
  '0', '1', '2', '3', '4', '5', '7', '8', '9'
];

/**
 * Extracts 129-D feature vector from 1 or 2 hands detected by MediaPipe.
 * 
 * MediaPipe landmarks structure:
 * Array of hands: [ [ {x, y, z}, ... 21 points ], [ {x, y, z}, ... 21 points ] ]
 */
export function extractFeaturesFromHands(handsLandmarks) {
  const features = new Float32Array(129);

  if (!handsLandmarks || handsLandmarks.length === 0) {
    return features;
  }

  // Filter valid hands (>= 21 keypoints)
  const validHands = handsLandmarks.filter(h => h && h.length >= 21);
  if (validHands.length === 0) return features;

  let h1 = validHands[0];
  let h2 = null;

  if (validHands.length >= 2) {
    // Sort hands left-to-right based on wrist.x (index 0)
    // hand1 is the leftmost hand in frame
    const wrist0X = validHands[0][0].x ?? validHands[0][0][0] ?? 0;
    const wrist1X = validHands[1][0].x ?? validHands[1][0][0] ?? 0;
    if (wrist0X > wrist1X) {
      h1 = validHands[1];
      h2 = validHands[0];
    } else {
      h1 = validHands[0];
      h2 = validHands[1];
    }
  }

  const getPt = (hand, i) => {
    const p = hand[i];
    if (Array.isArray(p)) {
      return [p[0] || 0, p[1] || 0, p[2] || 0];
    }
    return [p.x || 0, p.y || 0, p.z || 0];
  };

  // 1. Normalize Hand 1
  const wrist1 = getPt(h1, 0);
  const rel1 = [];
  let maxDist1 = 0;

  for (let i = 0; i < 21; i++) {
    const pt = getPt(h1, i);
    const rx = pt[0] - wrist1[0];
    const ry = pt[1] - wrist1[1];
    const rz = pt[2] - wrist1[2];
    const dist = Math.sqrt(rx * rx + ry * ry + rz * rz);
    if (dist > maxDist1) maxDist1 = dist;
    rel1.push([rx, ry, rz]);
  }

  const scale1 = maxDist1 < 1e-6 ? 1.0 : maxDist1;
  for (let i = 0; i < 21; i++) {
    features[i * 3 + 0] = rel1[i][0] / scale1;
    features[i * 3 + 1] = rel1[i][1] / scale1;
    features[i * 3 + 2] = rel1[i][2] / scale1;
  }

  // 2. Normalize Hand 2 (if present)
  if (h2) {
    const wrist2 = getPt(h2, 0);
    const rel2 = [];
    let maxDist2 = 0;

    for (let i = 0; i < 21; i++) {
      const pt = getPt(h2, i);
      const rx = pt[0] - wrist2[0];
      const ry = pt[1] - wrist2[1];
      const rz = pt[2] - wrist2[2];
      const dist = Math.sqrt(rx * rx + ry * ry + rz * rz);
      if (dist > maxDist2) maxDist2 = dist;
      rel2.push([rx, ry, rz]);
    }

    const scale2 = maxDist2 < 1e-6 ? 1.0 : maxDist2;
    for (let i = 0; i < 21; i++) {
      features[63 + i * 3 + 0] = rel2[i][0] / scale2;
      features[63 + i * 3 + 1] = rel2[i][1] / scale2;
      features[63 + i * 3 + 2] = rel2[i][2] / scale2;
    }

    // 3. Wrist displacement relative to hand 1 scaled by hand 1 scale
    features[126] = (wrist2[0] - wrist1[0]) / scale1;
    features[127] = (wrist2[1] - wrist1[1]) / scale1;
    features[128] = (wrist2[2] - wrist1[2]) / scale1;
  }

  return features;
}

/**
 * Predicts gesture from 129-D feature vector using the trained Random Forest.
 */
export function predictFromFeatures(features) {
  // Check if features are all zero (no hand)
  let isAllZero = true;
  for (let i = 0; i < 129; i++) {
    if (Math.abs(features[i]) > 1e-6) {
      isAllZero = false;
      break;
    }
  }

  if (isAllZero) {
    return {
      predicted_gesture: 'No hand detected. Please show your hand clearly.',
      display_char: '',
      raw_label: '',
      confidence: 0,
      is_confident: false,
      tamil_meaning: '',
      alternative_candidates: []
    };
  }

  const { classes, trees } = modelData;
  const numClasses = classes.length;
  const classScores = new Float32Array(numClasses);

  for (let t = 0; t < trees.length; t++) {
    const tree = trees[t];
    let node = 0;
    while (tree.l[node] !== -1) {
      const featIdx = tree.f[node];
      const thresh = tree.th[node];
      if (features[featIdx] <= thresh) {
        node = tree.l[node];
      } else {
        node = tree.r[node];
      }
    }
    const c = tree.c[node];
    const p = tree.p[node];
    if (c >= 0 && c < numClasses) {
      classScores[c] += p;
    }
  }

  // Find best class
  let bestIdx = 0;
  let bestScore = -1;
  for (let c = 0; c < numClasses; c++) {
    if (classScores[c] > bestScore) {
      bestScore = classScores[c];
      bestIdx = c;
    }
  }

  const confidence = bestScore / trees.length;
  const rawLabel = classes[bestIdx];
  const displayChar = DISPLAY_MAP[rawLabel] || rawLabel;
  const tamilMeaning = TAMIL_MAP[rawLabel] || '';

  // Get top 3 candidates
  const candidates = [];
  const indices = Array.from({ length: numClasses }, (_, i) => i);
  indices.sort((a, b) => classScores[b] - classScores[a]);
  for (let i = 0; i < Math.min(3, numClasses); i++) {
    const idx = indices[i];
    const rLabel = classes[idx];
    candidates.push({
      raw_label: rLabel,
      display: DISPLAY_MAP[rLabel] || rLabel,
      confidence: Math.round((classScores[idx] / trees.length) * 100) / 100
    });
  }

  const CONFIDENCE_THRESHOLD = 0.50;
  const isConfident = confidence >= CONFIDENCE_THRESHOLD;

  return {
    predicted_gesture: isConfident ? displayChar : 'Gesture unclear. Please try again.',
    display_char: isConfident ? displayChar : '',
    raw_label: rawLabel,
    confidence: Math.round(confidence * 100),
    is_confident: isConfident,
    tamil_meaning: isConfident ? tamilMeaning : '',
    alternative_candidates: candidates
  };
}
