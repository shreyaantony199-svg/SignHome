import React, { useRef, useEffect } from 'react';

/**
 * HandLandmarkViewer
 * Renders glowing 21 3D hand keypoints and skeletal connections
 * on an HTML5 overlay canvas for 1 or 2 hands.
 */
export default function HandLandmarkViewer({ landmarks, width = 640, height = 480, className = '' }) {
  const canvasRef = useRef(null);

  // 21-point Skeletal connections for MediaPipe Hands
  const CONNECTIONS = [
    // Thumb
    [0, 1], [1, 2], [2, 3], [3, 4],
    // Index finger
    [0, 5], [5, 6], [6, 7], [7, 8],
    // Middle finger
    [9, 10], [10, 11], [11, 12],
    // Ring finger
    [13, 14], [14, 15], [15, 16],
    // Pinky
    [0, 17], [17, 18], [18, 19], [19, 20],
    // Palm base
    [5, 9], [9, 13], [13, 17]
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    if (!landmarks) return;

    // Normalize into array of hands
    let handsList = [];
    if (Array.isArray(landmarks)) {
      if (landmarks.length === 0) return;
      if (Array.isArray(landmarks[0]) && (typeof landmarks[0][0] === 'object' || Array.isArray(landmarks[0][0]))) {
        handsList = landmarks;
      } else if (landmarks.length >= 21) {
        handsList = [landmarks];
      }
    }

    if (handsList.length === 0) return;

    const HAND_COLORS = [
      { stroke: '#38BDF8', wrist: '#EF4444', tip: '#F59E0B', joint: '#8B5CF6' }, // Hand 1 (Cyan/Violet)
      { stroke: '#34D399', wrist: '#EC4899', tip: '#10B981', joint: '#6366F1' }, // Hand 2 (Emerald/Indigo)
    ];

    handsList.forEach((hand, hIdx) => {
      if (!hand || hand.length < 21) return;
      const theme = HAND_COLORS[hIdx % HAND_COLORS.length];

      const getCoord = (idx) => {
        const p = hand[idx];
        if (!p) return null;
        const x = (p.x !== undefined ? p.x : p[0]) * width;
        const y = (p.y !== undefined ? p.y : p[1]) * height;
        return { x, y };
      };

      // 1. Draw Skeleton Bones
      ctx.strokeStyle = theme.stroke;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.shadowColor = theme.stroke;
      ctx.shadowBlur = 6;

      CONNECTIONS.forEach(([startIdx, endIdx]) => {
        const p1 = getCoord(startIdx);
        const p2 = getCoord(endIdx);
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });

      ctx.shadowBlur = 0; // Reset shadow

      // 2. Draw Landmark Joints
      for (let idx = 0; idx < 21; idx++) {
        const pt = getCoord(idx);
        if (!pt) continue;

        ctx.beginPath();
        const isWrist = idx === 0;
        const isTip = idx % 4 === 0 && idx > 0;
        const radius = isWrist ? 6 : isTip ? 5 : 3.5;
        ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI);

        if (isWrist) {
          ctx.fillStyle = theme.wrist;
        } else if (isTip) {
          ctx.fillStyle = theme.tip;
        } else {
          ctx.fillStyle = theme.joint;
        }
        ctx.fill();

        // White border ring
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      }
    });
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`pointer-events-none ${className}`}
    />
  );
}
