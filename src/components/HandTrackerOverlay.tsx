"use client";

/**
 * HandTrackerOverlay Component
 * Renders Picture-in-Picture webcam feed with interactive 2D canvas overlay
 * visualizing 21 MediaPipe hand landmarks and skeletal bone connections.
 */

import React, { useEffect, useRef, useState } from "react";
import { Landmark } from "../lib/gestureUtils";
import { WebcamStatus } from "../hooks/useWebcam";
import { Minimize2, Maximize2, Camera, AlertCircle, RefreshCw } from "lucide-react";

interface HandTrackerOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  landmarks: Landmark[] | null;
  webcamStatus: WebcamStatus;
  errorMessage: string | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
}

// MediaPipe 21 Hand Landmark skeletal connections
const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm MCP bar
  [5, 9], [9, 13], [13, 17],
];

/**
 * PiP Webcam Feed Component with Skeleton Visualization canvas.
 */
export function HandTrackerOverlay({
  videoRef,
  landmarks,
  webcamStatus,
  errorMessage,
  onStartCamera,
  onStopCamera,
}: HandTrackerOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Render 2D skeleton overlay on canvas whenever landmarks update
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (webcamStatus !== "active" || !landmarks || landmarks.length < 21) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    // Draw skeletal bone connection lines
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#00f0ff";
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 8;

    HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const p1 = landmarks[startIdx];
      const p2 = landmarks[endIdx];

      // Mirror X coordinates for natural webcam preview
      const x1 = (1 - p1.x) * width;
      const y1 = p1.y * height;
      const x2 = (1 - p2.x) * width;
      const y2 = p2.y * height;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Draw landmark joint nodes
    landmarks.forEach((lm, index) => {
      const x = (1 - lm.x) * width;
      const y = lm.y * height;

      ctx.beginPath();
      ctx.arc(x, y, index === 8 ? 7 : 4, 0, 2 * Math.PI); // Highlight index tip

      if (index === 8) {
        ctx.fillStyle = "#ff007f"; // Index tip highlight
      } else if (index === 4) {
        ctx.fillStyle = "#ffe600"; // Thumb tip highlight
      } else {
        ctx.fillStyle = "#ffffff";
      }

      ctx.fill();
    });
  }, [landmarks, webcamStatus]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
        isMinimized ? "w-48 h-14" : "w-64 h-52"
      } rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col`}
    >
      {/* PiP Window Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/60 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Webcam Feed
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              webcamStatus === "active"
                ? "bg-emerald-400 animate-pulse"
                : webcamStatus === "requesting"
                ? "bg-amber-400 animate-ping"
                : "bg-slate-500"
            }`}
          />
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-700/50"
          title={isMinimized ? "Expand" : "Minimize"}
        >
          {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Video & Skeleton View Area */}
      {!isMinimized && (
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {/* HTML5 Video element */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover transform -scale-x-100"
            playsInline
            muted
          />

          {/* 2D Skeleton Canvas overlay */}
          <canvas
            ref={canvasRef}
            width={256}
            height={160}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Camera Idle State / Start Button Overlay */}
          {webcamStatus === "idle" && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center">
              <Camera className="w-8 h-8 text-cyan-400 mb-2 animate-bounce" />
              <p className="text-xs text-slate-300 mb-3">Camera is stopped</p>
              <button
                onClick={onStartCamera}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                Start Camera
              </button>
            </div>
          )}

          {/* Camera Requesting Permission State */}
          {webcamStatus === "requesting" && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center">
              <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mb-2" />
              <p className="text-xs font-medium text-amber-300">Requesting permission...</p>
              <p className="text-[10px] text-slate-400 mt-1">Please allow camera access in your browser</p>
            </div>
          )}

          {/* Error State */}
          {webcamStatus === "error" && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="w-6 h-6 text-rose-500 mb-1" />
              <p className="text-xs font-semibold text-rose-400">Camera Access Error</p>
              <p className="text-[10px] text-slate-400 my-1">{errorMessage || "Permission denied"}</p>
              <button
                onClick={onStartCamera}
                className="mt-1 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs border border-rose-500/40 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Minimized Quick Status Bar */}
      {isMinimized && (
        <div className="flex-1 flex items-center justify-between px-3 text-xs text-slate-300">
          <span className="truncate">
            {webcamStatus === "active" ? (landmarks ? "Hand Tracked" : "Searching Hand...") : "Camera Off"}
          </span>
          {webcamStatus === "active" ? (
            <button
              onClick={onStopCamera}
              className="text-[10px] text-rose-400 hover:text-rose-300 underline"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={onStartCamera}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 underline"
            >
              Start
            </button>
          )}
        </div>
      )}
    </div>
  );
}
