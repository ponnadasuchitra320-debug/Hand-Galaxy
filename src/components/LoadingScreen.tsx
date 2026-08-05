"use client";

/**
 * LoadingScreen Component
 * Animated futuristic loading overlay shown during initial setup or model loading.
 */

import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface LoadingScreenProps {
  progressText: string;
}

/**
 * Animated Loading Overlay component.
 */
export function LoadingScreen({ progressText }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Animated glowing particle loader ring */}
      <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-purple-500/20 border-b-purple-400 animate-spin-reverse" />
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 p-0.5 shadow-xl shadow-cyan-500/30">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-400 mb-2 tracking-wide">
        HAND GALAXY
      </h2>

      <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-4 py-2 rounded-full shadow-lg">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{progressText}</span>
      </div>

      <p className="text-xs text-slate-400 max-w-sm mt-4">
        Preparing 8,000+ particle 3D WebGL engine & Google MediaPipe Vision AI...
      </p>
    </div>
  );
}
