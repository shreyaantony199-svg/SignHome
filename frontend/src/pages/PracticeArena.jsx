import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, CheckCircle, XCircle, RotateCcw,
  Trophy, ArrowRight, SkipForward, Play, Pause, Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import SignIllustration from '../components/SignIllustration';
import { extractFeaturesFromHands, predictFromFeatures, DISPLAY_MAP } from '../services/islClassifier';
import { practiceService } from '../services/api';

// Gestures not in the trained model (dynamic or missing from dataset)
const UNSUPPORTED = new Set(['h', 'j', 'num_6']);

const ALPHABET_SEQ = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
const NUMBER_SEQ   = ['num_0','num_1','num_2','num_3','num_4','num_5','num_6','num_7','num_8','num_9'];

const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17]
];

function getDisplayLabel(raw) {
  if (!raw) return '';
  return DISPLAY_MAP[raw] || raw.toUpperCase();
}

export default function PracticeArena() {
  const [mode, setMode] = useState('alphabet');
  const sequence = mode === 'alphabet' ? ALPHABET_SEQ : NUMBER_SEQ;

  const [targetIndex, setTargetIndex] = useState(0);
  const [verifiedSet, setVerifiedSet] = useState(new Set());
  const [points, setPoints] = useState(0);
  const [verificationState, setVerificationState] = useState('no-hand');
  const [cameraActive, setCameraActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState(null);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [allComplete, setAllComplete] = useState(false);
  const [stableCount, setStableCount] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const stableCountRef = useRef(0);
  const verifiedRef = useRef(false);

  const currentTarget = sequence[targetIndex];
  const isUnsupported = UNSUPPORTED.has(currentTarget);

  // Reset verification state when target changes
  useEffect(() => {
    verifiedRef.current = false;
    stableCountRef.current = 0;
    setStableCount(0);
    setVerificationState(isUnsupported ? 'unsupported' : 'no-hand');
    setCurrentPrediction(null);
  }, [targetIndex, mode, isUnsupported]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setTargetIndex(0);
    setVerifiedSet(new Set());
    setPoints(0);
    setVerificationState('no-hand');
    setAllComplete(false);
    stableCountRef.current = 0;
    setStableCount(0);
    verifiedRef.current = false;
  };

  const initHandLandmarker = useCallback(async () => {
    setModelLoading(true);
    setModelError(null);
    try {
      let vision;
      try {
        vision = await FilesetResolver.forVisionTasks('/wasm');
      } catch {
        vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
      }
      let lm;
      try {
        lm = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2
        });
      } catch {
        lm = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          numHands: 2
        });
      }
      landmarkerRef.current = lm;
    } catch (err) {
      setModelError('Failed to load hand tracking model. Please check your internet connection and reload.');
      console.error('HandLandmarker init error:', err);
    } finally {
      setModelLoading(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (!landmarkerRef.current) {
      await initHandLandmarker();
      if (!landmarkerRef.current) return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setVerificationState(isUnsupported ? 'unsupported' : 'no-hand');
    } catch {
      setModelError('Camera access denied. Please allow camera permissions and try again.');
    }
  }, [initHandLandmarker, isUnsupported]);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setPaused(false);
    setVerificationState('no-hand');
    stableCountRef.current = 0;
    setStableCount(0);
  }, []);

  const drawLandmarks = useCallback((canvas, results) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!results.landmarks || results.landmarks.length === 0) return;
    for (const hand of results.landmarks) {
      // Draw connections
      ctx.strokeStyle = 'rgba(99,102,241,0.75)';
      ctx.lineWidth = 2;
      for (const [a, b] of HAND_CONNECTIONS) {
        const pa = hand[a], pb = hand[b];
        ctx.beginPath();
        ctx.moveTo((1 - pa.x) * canvas.width, pa.y * canvas.height);
        ctx.lineTo((1 - pb.x) * canvas.width, pb.y * canvas.height);
        ctx.stroke();
      }
      // Draw landmark dots
      for (let i = 0; i < hand.length; i++) {
        const pt = hand[i];
        ctx.beginPath();
        ctx.arc((1 - pt.x) * canvas.width, pt.y * canvas.height, i === 0 ? 6 : 4, 0, 2 * Math.PI);
        ctx.fillStyle = i === 0 ? '#a855f7' : '#6366f1';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }, []);

  // Main detection loop
  useEffect(() => {
    if (!cameraActive || paused || !landmarkerRef.current || !videoRef.current || !canvasRef.current) return;
    let running = true;

    const detect = () => {
      if (!running) return;
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const now = performance.now();
      let results;
      try {
        results = landmarkerRef.current.detectForVideo(video, now);
      } catch {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      drawLandmarks(canvas, results);
      const hasHands = results.landmarks && results.landmarks.length > 0;

      if (!hasHands) {
        stableCountRef.current = 0;
        setStableCount(0);
        if (!verifiedRef.current && !isUnsupported) setVerificationState('no-hand');
        setCurrentPrediction(null);
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      // Skip inference if already verified or unsupported
      if (verifiedRef.current || isUnsupported) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      // Run classification
      const features = extractFeaturesFromHands(results.landmarks);
      const pred = predictFromFeatures(features);
      setCurrentPrediction(pred);

      if (pred && pred.is_confident && pred.raw_label === currentTarget) {
        stableCountRef.current += 1;
        setStableCount(stableCountRef.current);
        setVerificationState('detecting');

        if (stableCountRef.current >= 5) {
          // VERIFIED
          verifiedRef.current = true;
          setVerificationState('correct');
          setVerifiedSet(prev => {
            const next = new Set(prev);
            next.add(currentTarget);
            return next;
          });
          setPoints(prev => prev + 10);
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
          try {
            practiceService.recordAttempt({
              target_sign: currentTarget,
              predicted_sign: pred.raw_label,
              confidence: pred.confidence,
              matched: true
            });
          } catch { /* non-critical */ }
        }
      } else {
        stableCountRef.current = Math.max(0, stableCountRef.current - 1);
        setStableCount(stableCountRef.current);
        setVerificationState(hasHands ? 'incorrect' : 'detecting');
      }

      animFrameRef.current = requestAnimationFrame(detect);
    };

    animFrameRef.current = requestAnimationFrame(detect);
    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [cameraActive, paused, currentTarget, isUnsupported, drawLandmarks]);

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  const handleNext = () => {
    if (targetIndex + 1 >= sequence.length) {
      setAllComplete(true);
      confetti({ particleCount: 180, spread: 90, origin: { y: 0.5 } });
    } else {
      setTargetIndex(i => i + 1);
    }
  };

  const handleRestart = () => {
    setTargetIndex(0);
    setVerifiedSet(new Set());
    setPoints(0);
    setVerificationState('no-hand');
    setAllComplete(false);
    stableCountRef.current = 0;
    setStableCount(0);
    verifiedRef.current = false;
  };

  const stats = practiceService.getStats();
  const progressPct = sequence.length > 0 ? Math.round((verifiedSet.size / sequence.length) * 100) : 0;

  const renderVerificationBadge = () => {
    if (isUnsupported) return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
        <span>⚠️</span>
        <span>Not verifiable — additional training data required for this gesture</span>
      </div>
    );
    switch (verificationState) {
      case 'no-hand': return (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
          <Camera className="w-4 h-4 shrink-0" />
          <span>Show your hand clearly in the camera</span>
        </div>
      );
      case 'detecting': return (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-300 text-blue-700 text-xs font-semibold animate-pulse">
          <Zap className="w-4 h-4 shrink-0" />
          <span>Analysing gesture... hold steady ({stableCount}/5)</span>
        </div>
      );
      case 'correct': return (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-700 text-sm font-bold">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>✓ VERIFIED — {getDisplayLabel(currentTarget)}! Excellent! +10 pts</span>
        </div>
      );
      case 'incorrect': return (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>Not quite! Keep trying{currentPrediction ? ` — seeing: ${getDisplayLabel(currentPrediction.raw_label)}` : ''}
          </span>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Practice Arena &amp; Competency Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Practice Arena</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Form each ISL gesture in front of the camera. The model verifies your hand shape in real-time.
            </p>
          </div>

          {/* Live stats */}
          <div className="flex items-center gap-5 shrink-0">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-blue-600">{points}</div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-purple-600">{verifiedSet.size}</div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-emerald-600">{stats.streak || 0}</div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Streak</div>
            </div>
          </div>
        </div>

        {/* Mode switcher */}
        <div className="flex items-center gap-2 mt-5 p-1 bg-slate-100 rounded-2xl w-fit">
          <button
            onClick={() => handleModeChange('alphabet')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'alphabet' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Alphabet A–Z
          </button>
          <button
            onClick={() => handleModeChange('number')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'number' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Numbers 0–9
          </button>
        </div>
      </div>

      {/* ── Completion Screen ── */}
      {allComplete ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center space-y-5">
          <Trophy className="w-20 h-20 text-amber-500 mx-auto" />
          <h2 className="text-3xl font-extrabold text-slate-900">Session Complete! 🎉</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            You verified <span className="font-bold text-blue-600">{verifiedSet.size}</span> out of{' '}
            <span className="font-bold">{sequence.length}</span> gestures and earned{' '}
            <span className="font-bold text-purple-600">{points} points</span>.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Practice Again
            </button>
            <button
              onClick={() => handleModeChange(mode === 'alphabet' ? 'number' : 'alphabet')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-sm transition-all"
            >
              Try {mode === 'alphabet' ? 'Numbers' : 'Alphabets'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT: Target card ── */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Target</span>
              <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                {targetIndex + 1} / {sequence.length}
              </span>
            </div>

            {/* Large letter display */}
            <div className="text-center py-2">
              <div className="text-9xl font-black bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent leading-none select-none">
                {getDisplayLabel(currentTarget)}
              </div>
              {isUnsupported && (
                <div className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200 text-left">
                  ⚠️ <strong>H, J, 6</strong> are dynamic or complex ISL gestures not yet included in the training dataset. They cannot be automatically verified. Study the reference image and click <strong>Skip</strong> to continue.
                </div>
              )}
            </div>

            {/* SignIllustration reference */}
            <div className="flex justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <SignIllustration term={getDisplayLabel(currentTarget)} size="xl" className="mx-auto" />
            </div>
            <p className="text-[11px] text-center text-slate-400 font-medium">
              Reference — ISL fingerspelling standard
            </p>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                <span>Progress</span>
                <span>{verifiedSet.size} / {sequence.length} verified ({progressPct}%)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Completed gesture chips */}
            {verifiedSet.size > 0 && (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {[...verifiedSet].map(raw => (
                  <span
                    key={raw}
                    className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200"
                  >
                    <CheckCircle className="w-3 h-3" /> {getDisplayLabel(raw)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Webcam panel ── */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Live Camera</span>

            {/* Video + canvas overlay */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover -scale-x-100"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ transform: 'scaleX(-1)' }}
              />
              {!cameraActive && !modelLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                  <Camera className="w-12 h-12 text-slate-500" />
                  <p className="text-sm text-slate-400 font-medium">Click "Start Camera" to begin</p>
                </div>
              )}
              {modelLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/90 text-white">
                  <div className="w-9 h-9 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-blue-300 font-semibold">Loading hand tracking model...</p>
                  <p className="text-xs text-slate-400">Requires internet connection on first load</p>
                </div>
              )}
              {cameraActive && (
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-red-600/90 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                </div>
              )}
              {cameraActive && currentPrediction && (
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center">
                    <span className="text-xs text-white/80 font-medium">
                      Detecting: <span className="font-black text-white">{getDisplayLabel(currentPrediction.raw_label)}</span>
                      <span className="text-white/60"> ({Math.round((currentPrediction.confidence || 0) * 100)}%)</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Error message */}
            {modelError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                {modelError}
              </div>
            )}

            {/* Verification badge — always show when camera active */}
            {cameraActive && renderVerificationBadge()}

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  disabled={modelLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <Play className="w-4 h-4" />
                  {modelLoading ? 'Loading...' : 'Start Camera'}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setPaused(p => !p)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all"
                  >
                    {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    {paused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={stopCamera}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold transition-all"
                  >
                    Stop
                  </button>
                </>
              )}

              {/* Skip (unsupported) or Next (verified) */}
              {isUnsupported ? (
                <button
                  onClick={handleNext}
                  className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-500 hover:bg-slate-600 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <SkipForward className="w-4 h-4" /> Skip
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={verificationState !== 'correct'}
                  className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm transition-all"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Tip text */}
            {!cameraActive && !modelError && (
              <p className="text-[11px] text-slate-400 text-center">
                Start the camera, then perform the ISL hand gesture for{' '}
                <strong className="text-slate-600">{getDisplayLabel(currentTarget)}</strong>. Hold the gesture steady for 5 frames to verify.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
