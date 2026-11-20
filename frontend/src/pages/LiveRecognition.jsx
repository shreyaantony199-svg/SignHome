import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Pause,
  Play,
  Volume2,
  Trash2,
  Undo2,
  Copy,
  BookmarkPlus,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Cpu
} from 'lucide-react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import HandLandmarkViewer from '../components/HandLandmarkViewer';
import SignIllustration from '../components/SignIllustration';
import { recognitionService, savedPhrasesService } from '../services/api';
import {
  extractFeaturesFromHands,
  predictFromFeatures,
  DISPLAY_MAP,
  TAMIL_MAP
} from '../services/islClassifier';

export default function LiveRecognition({ setActivePage }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [handTracked, setHandTracked] = useState(false);
  const [handsCount, setHandsCount] = useState(0);
  const [predictedGesture, setPredictedGesture] = useState('Position Hand in Camera');
  const [tamilMeaning, setTamilMeaning] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [alternatives, setAlternatives] = useState([]);
  const [recognizedSentence, setRecognizedSentence] = useState('');
  const [history, setHistory] = useState([]);
  const [landmarks, setLandmarks] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [landmarkerLoading, setLandmarkerLoading] = useState(false);
  const [modelError, setModelError] = useState(null);

  // Video and Canvas dimensions
  const [videoDims, setVideoDims] = useState({ width: 640, height: 480 });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const pausedRef = useRef(false);
  const lastVideoTimeRef = useRef(-1);

  // Stability & Debounce Tracking for Transcript Accumulation
  const predictionBufferRef = useRef([]);
  const lastAppendedCharRef = useRef('');
  const lastAppendTimeRef = useRef(0);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    setHistory(recognitionService.getRecognitionHistory());
    return () => {
      stopCamera();
    };
  }, []);

  // Initialize MediaPipe HandLandmarker
  const initHandLandmarker = async () => {
    if (landmarkerRef.current) return landmarkerRef.current;
    setLandmarkerLoading(true);
    setModelError(null);

    try {
      let vision;
      try {
        // Try local bundled WASM first
        vision = await FilesetResolver.forVisionTasks('/wasm');
      } catch (localWasmErr) {
        console.warn('Local WASM failed, falling back to CDN:', localWasmErr);
        vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
      }

      let landmarker;
      try {
        landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
      } catch (gpuErr) {
        console.warn('GPU delegate failed, falling back to CPU:', gpuErr);
        landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
      }

      landmarkerRef.current = landmarker;
      setLandmarkerLoading(false);
      return landmarker;
    } catch (err) {
      console.error('Failed to initialize MediaPipe HandLandmarker:', err);
      setModelError('Failed to initialize hand tracking model. Please check network/camera permissions.');
      setLandmarkerLoading(false);
      throw err;
    }
  };

  const startCamera = async () => {
    try {
      setModelError(null);
      await initHandLandmarker();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            setVideoDims({
              width: videoRef.current.videoWidth || 640,
              height: videoRef.current.videoHeight || 480
            });
          }
        };
      }

      setCameraActive(true);
      setPaused(false);
      startDetectionLoop();
    } catch (err) {
      console.error('Camera access error:', err);
      setModelError('Webcam access was denied or could not be established.');
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    setCameraActive(false);
    setHandTracked(false);
    setHandsCount(0);
    setLandmarks(null);
    setPredictedGesture('Camera Stopped');
    setTamilMeaning('');
    setConfidence(0);
    setAlternatives([]);
    predictionBufferRef.current = [];
  };

  const togglePause = () => {
    setPaused((prev) => !prev);
  };

  // Main real-time frame detection loop
  const startDetectionLoop = () => {
    const processFrame = () => {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;

      if (!video || !landmarker || video.paused || video.ended) {
        animFrameIdRef.current = requestAnimationFrame(processFrame);
        return;
      }

      if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const startTimeMs = performance.now();

        try {
          const results = landmarker.detectForVideo(video, startTimeMs);

          if (results.landmarks && results.landmarks.length > 0) {
            setLandmarks(results.landmarks);
            setHandTracked(true);
            setHandsCount(results.landmarks.length);

            if (!pausedRef.current) {
              // 1. Extract 129-D feature vector matching static_landmarks.csv
              const features = extractFeaturesFromHands(results.landmarks);

              // 2. Classify gesture using trained model
              const pred = predictFromFeatures(features);
              setAlternatives(pred.alternative_candidates || []);

              if (!pred.is_confident || !pred.display_char) {
                setPredictedGesture(pred.predicted_gesture);
                setTamilMeaning('');
                setConfidence(pred.confidence);
                predictionBufferRef.current = [];
              } else {
                setPredictedGesture(pred.display_char);
                setTamilMeaning(pred.tamil_meaning);
                setConfidence(pred.confidence);

                // 3. Prediction smoothing buffer (last 7 frames)
                const buffer = predictionBufferRef.current;
                buffer.push(pred.display_char);
                if (buffer.length > 7) buffer.shift();

                // Stable prediction criteria: minimum 4 consistent frames
                const matches = buffer.filter((c) => c === pred.display_char).length;
                const now = Date.now();

                if (matches >= 4) {
                  const isNewChar = lastAppendedCharRef.current !== pred.display_char;
                  const cooldownPassed = now - lastAppendTimeRef.current > 1800; // 1.8s delay to prevent accidental repeating

                  if (isNewChar || cooldownPassed) {
                    lastAppendedCharRef.current = pred.display_char;
                    lastAppendTimeRef.current = now;
                    predictionBufferRef.current = []; // Reset after appending

                    setRecognizedSentence((prev) => {
                      return prev ? `${prev} ${pred.display_char}` : pred.display_char;
                    });
                  }
                }
              }
            }
          } else {
            // No hands detected in frame
            setLandmarks(null);
            setHandTracked(false);
            setHandsCount(0);
            setPredictedGesture('No hand detected. Please show your hand clearly.');
            setTamilMeaning('');
            setConfidence(0);
            setAlternatives([]);
            predictionBufferRef.current = [];
          }
        } catch (detectionErr) {
          console.warn('Frame detection warning:', detectionErr);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(processFrame);
    };

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }
    animFrameIdRef.current = requestAnimationFrame(processFrame);
  };

  const speakText = () => {
    if ('speechSynthesis' in window && recognizedSentence) {
      const utterance = new SpeechSynthesisUtterance(recognizedSentence);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const copySentence = () => {
    if (recognizedSentence) {
      navigator.clipboard.writeText(recognizedSentence);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    }
  };

  const savePhrase = () => {
    if (recognizedSentence) {
      savedPhrasesService.add({
        text: recognizedSentence,
        tamil_text: tamilMeaning,
        category: 'Live Camera Session'
      });
      recognitionService.saveSessionPhrase(recognizedSentence, confidence);
      setHistory(recognitionService.getRecognitionHistory());
      setSaveFeedback(true);
      setTimeout(() => setSaveFeedback(false), 1500);
    }
  };

  const clearSentence = () => {
    setRecognizedSentence('');
    lastAppendedCharRef.current = '';
    predictionBufferRef.current = [];
  };

  const removeLastCharacter = () => {
    setRecognizedSentence((prev) => {
      const parts = prev.trim().split(' ');
      parts.pop();
      return parts.join(' ');
    });
    lastAppendedCharRef.current = '';
    predictionBufferRef.current = [];
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Real-Time Vision Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Live ISL Recognition
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time hand landmark tracking and trained Random Forest classification into natural speech.
          </p>
        </div>

        {/* Privacy Seal */}
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>In-Memory Video Only. Zero Recording.</span>
        </div>
      </div>

      {modelError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{modelError}</span>
        </div>
      )}

      {/* Main Vision Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Video / Landmark Canvas (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video rounded-3xl bg-slate-900 overflow-hidden shadow-xl border border-slate-800 flex items-center justify-center">
            {/* Live HTML5 Video */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Landmark Skeleton Overlay (Mirrored identically to video) */}
            {cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none transform -scale-x-100">
                <HandLandmarkViewer
                  landmarks={landmarks}
                  width={videoDims.width}
                  height={videoDims.height}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Idle Overlay when camera is off */}
            {!cameraActive && (
              <div className="text-center p-8 space-y-4 text-slate-300">
                <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-blue-400 shadow-inner">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Camera is Inactive</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Click "Start Camera" to detect hand landmarks and decode Indian Sign Language in real-time.
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  disabled={landmarkerLoading}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>{landmarkerLoading ? 'Loading Model...' : 'Start Live Camera'}</span>
                </button>
              </div>
            )}

            {/* Live Camera Tracking Indicators (True State) */}
            {cameraActive && (
              <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
                <span className="flex h-3 w-3 relative">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      paused ? 'bg-amber-400' : handTracked ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      paused ? 'bg-amber-500' : handTracked ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  ></span>
                </span>
                <span className="text-[11px] font-bold text-white uppercase tracking-wider bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  {paused
                    ? 'Paused'
                    : handTracked
                    ? `Live Hand Tracking (${handsCount} ${handsCount > 1 ? 'Hands' : 'Hand'})`
                    : 'Camera Active • Searching for Hand'}
                </span>
              </div>
            )}

            {/* Gesture Badge on Video */}
            {cameraActive && (
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/85 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-xl text-blue-400">
                    {predictedGesture.length === 1 ? predictedGesture : <Activity className="w-6 h-6" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                      Detected ISL Gesture
                    </span>
                    <h4 className="text-lg font-black text-white flex items-center gap-2">
                      <span>{predictedGesture}</span>
                      {tamilMeaning && (
                        <span className="text-xs font-semibold text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-md border border-purple-500/30">
                          {tamilMeaning}
                        </span>
                      )}
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Confidence
                  </span>
                  <div className={`text-base font-black ${confidence >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {confidence}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Camera Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 self-start sm:self-center">
              {cameraActive ? (
                <>
                  <button
                    onClick={stopCamera}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition-colors"
                  >
                    <CameraOff className="w-4 h-4" /> Stop Camera
                  </button>
                  <button
                    onClick={togglePause}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
                  >
                    {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    {paused ? 'Resume Recognition' : 'Pause Recognition'}
                  </button>
                </>
              ) : (
                <button
                  onClick={startCamera}
                  disabled={landmarkerLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>{landmarkerLoading ? 'Loading Model...' : 'Start Camera'}</span>
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 font-medium self-end sm:self-center flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>Model:</span>
              <span className="font-bold text-slate-800">Random Forest (129D Landmarks)</span>
            </div>
          </div>
        </div>

        {/* Right: Recognized Text & Transcript Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Translated Transcript
              </h3>
              <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                Continuous Accumulator
              </span>
            </div>

            {/* Transcript Textbox */}
            <div className="min-h-[140px] p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-base leading-relaxed font-semibold">
              {recognizedSentence || (
                <span className="text-slate-400 italic font-normal text-sm">
                  Recognized alphabet and number gestures will assemble here in real-time...
                </span>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={speakText}
                disabled={!recognizedSentence}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Speak (TTS)
              </button>

              <button
                onClick={copySentence}
                disabled={!recognizedSentence}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold disabled:opacity-40 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copyFeedback ? 'Copied!' : 'Copy'}
              </button>

              <button
                onClick={savePhrase}
                disabled={!recognizedSentence}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold disabled:opacity-40 transition-colors"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                {saveFeedback ? 'Saved!' : 'Save Phrase'}
              </button>

              <button
                onClick={removeLastCharacter}
                disabled={!recognizedSentence}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40 transition-colors ml-auto"
                title="Remove last character"
              >
                <Undo2 className="w-4 h-4" />
              </button>

              <button
                onClick={clearSentence}
                disabled={!recognizedSentence}
                className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-400 disabled:opacity-40 transition-colors"
                title="Clear transcript"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real Model Analytics & Live Prediction Stream */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Dataset Model Intelligence
              </h4>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                95.96% Verified Accuracy
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Training Dataset:</span>
                <span className="font-semibold text-slate-800">static_landmarks.csv (8,419 rows)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Supported Scope:</span>
                <span className="font-semibold text-slate-800">24 Alphabets (A-G, I, K-Z) + 9 Numbers</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Feature Representation:</span>
                <span className="font-semibold text-slate-800">129-D Dual-Hand Normalized Landmarks</span>
              </div>
            </div>

            {/* Dynamic Candidates Feed when Hand is Active */}
            {alternatives && alternatives.length > 0 && handTracked && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Top Gesture Probabilities
                </span>
                <div className="space-y-1.5">
                  {alternatives.map((alt, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">
                          {alt.display}
                        </span>
                        <span className="font-medium text-slate-700">{alt.raw_label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${Math.round(alt.confidence * 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-800 w-9 text-right">
                          {Math.round(alt.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-400 leading-normal pt-1">
              * Gestures are recognized by MediaPipe 21-point dual-hand landmark extraction and evaluated against the trained Random Forest classifier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
