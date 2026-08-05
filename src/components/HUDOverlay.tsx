"use client";

/**
 * HUDOverlay Component
 * Displays futuristic top banner, real-time gesture feedback badge,
 * AI tracking status indicators, and interactive gesture reference guide.
 */

import React, { useState } from "react";
import { GestureType } from "../hooks/useGestureEngine";
import { ModelStatus } from "../hooks/useHandLandmarker";
import { WebcamStatus } from "../hooks/useWebcam";
import {
  Sparkles,
  Hand,
  Maximize,
  Minimize,
  RotateCcw,
  Palette,
  Compass,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface HUDOverlayProps {
  activeGesture: GestureType;
  gestureDescription: string;
  modelStatus: ModelStatus;
  webcamStatus: WebcamStatus;
  activeShapeName: string;
  activePaletteName: string;
}

/**
 * Renders head-up display status indicators and gesture guide drawer.
 */
export function HUDOverlay({
  activeGesture,
  gestureDescription,
  modelStatus,
  webcamStatus,
  activeShapeName,
  activePaletteName,
}: HUDOverlayProps) {
  const [showGuide, setShowGuide] = useState(false);

  // Return badge styling and icon for active gesture
  const getGestureBadge = () => {
    switch (activeGesture) {
      case "rotate":
        return { label: "ROTATING GALAXY", color: "from-cyan-500 to-blue-600", icon: Compass };
      case "pinch":
        return { label: "PINCH ZOOM", color: "from-purple-500 to-indigo-600", icon: RotateCcw };
      case "expand":
        return { label: "OPEN PALM - EXPANDING", color: "from-emerald-500 to-teal-600", icon: Maximize };
      case "contract":
        return { label: "CLOSED FIST - CONTRACTING", color: "from-rose-500 to-pink-600", icon: Minimize };
      case "swipe-left":
        return { label: "SWIPE LEFT - COLOR SHIFT", color: "from-amber-500 to-orange-600", icon: Palette };
      case "swipe-right":
        return { label: "SWIPE RIGHT - NEW GALAXY", color: "from-fuchsia-500 to-purple-600", icon: Sparkles };
      default:
        return { label: "IDLE - SHOW HAND", color: "from-slate-700 to-slate-800", icon: Hand };
    }
  };

  const badge = getGestureBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="absolute top-0 left-0 right-0 z-30 p-6 pointer-events-none flex flex-col items-center">
      {/* Main Top Header */}
      <div className="w-full max-w-5xl flex items-center justify-between pointer-events-auto">
        {/* App Title Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-400 drop-shadow-sm">
              HAND GALAXY
            </h1>
            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-2">
              <span>Next.js 15 + R3F</span>
              <span>•</span>
              <span className="text-cyan-400 font-semibold">{activeShapeName}</span>
              <span>•</span>
              <span className="text-purple-400 font-semibold">{activePaletteName}</span>
            </p>
          </div>
        </div>

        {/* Status Indicators & Guide Toggle */}
        <div className="flex items-center gap-3">
          {/* AI Model Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                modelStatus === "ready"
                  ? "bg-emerald-400"
                  : modelStatus === "loading"
                  ? "bg-amber-400 animate-ping"
                  : "bg-slate-500"
              }`}
            />
            <span className="text-slate-300">
              {modelStatus === "ready" ? "MediaPipe AI Ready" : modelStatus === "loading" ? "Loading AI..." : "AI Ready"}
            </span>
          </div>

          {/* Gesture Guide Drawer Toggle Button */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg"
          >
            <Hand className="w-4 h-4 text-cyan-400" />
            <span>Gesture Guide</span>
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Active Gesture Live Banner */}
      <div className="mt-4 pointer-events-auto transition-all transform duration-300">
        <div
          className={`px-5 py-2 rounded-full bg-gradient-to-r ${badge.color} text-white font-bold text-xs tracking-wider flex items-center gap-2 shadow-xl shadow-cyan-950/60 uppercase border border-white/20 animate-fade-in`}
        >
          <BadgeIcon className="w-4 h-4" />
          <span>{badge.label}</span>
        </div>
      </div>

      <p className="text-xs text-slate-300/80 mt-1 font-mono">{gestureDescription}</p>

      {/* Gesture Controls Cheat Sheet Drawer */}
      {showGuide && (
        <div className="mt-4 w-full max-w-3xl pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <Hand className="w-4 h-4" /> Hand Gesture Controls Legend
            </h3>
            <span className="text-[11px] text-slate-400">Smoothed with Lerp (60 FPS)</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Index Finger
              </div>
              <p className="text-slate-300 text-[11px]">Rotate galaxy horizontally and vertically</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="font-semibold text-purple-400 mb-1 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Pinch Gesture
              </div>
              <p className="text-slate-300 text-[11px]">Pinch Thumb + Index to Zoom camera in/out</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                <Maximize className="w-3.5 h-3.5" /> Open Palm
              </div>
              <p className="text-slate-300 text-[11px]">Extend all fingers to expand galaxy radius</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
                <Minimize className="w-3.5 h-3.5" /> Closed Fist
              </div>
              <p className="text-slate-300 text-[11px]">Curl fingers into fist to contract core</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Swipe Left
              </div>
              <p className="text-slate-300 text-[11px]">Rapid left swipe changes color palette</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="font-semibold text-fuchsia-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Swipe Right
              </div>
              <p className="text-slate-300 text-[11px]">Rapid right swipe generates a new galaxy</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
