"use client";

/**
 * ControlPanel Component
 * Glassmorphism floating bottom bar providing webcam toggles, galaxy shape switcher,
 * color palette pickers, and manual override sliders.
 */

import React, { useState } from "react";
import { GalaxyShape } from "../lib/galaxyGenerators";
import { GALAXY_PALETTES } from "../lib/colorPalettes";
import { WebcamStatus } from "../hooks/useWebcam";
import {
  Camera,
  CameraOff,
  Palette,
  Sliders,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Layers,
} from "lucide-react";

interface ControlPanelProps {
  webcamStatus: WebcamStatus;
  onStartCamera: () => void;
  onStopCamera: () => void;
  activeShape: GalaxyShape;
  onSelectShape: (shape: GalaxyShape) => void;
  activePaletteIndex: number;
  onSelectPalette: (index: number) => void;
  
  // Manual override controls
  manualRotationX: number;
  setManualRotationX: (v: number) => void;
  manualRotationY: number;
  setManualRotationY: (v: number) => void;
  manualScale: number;
  setManualScale: (v: number) => void;
  manualZoom: number;
  setManualZoom: (v: number) => void;
}

const GALAXY_SHAPES: { id: GalaxyShape; label: string }[] = [
  { id: "spiral-2", label: "2-Arm Spiral" },
  { id: "spiral-4", label: "4-Arm Spiral" },
  { id: "ring", label: "Ring Galaxy" },
  { id: "cluster", label: "Starburst Cluster" },
  { id: "sombrero", label: "Sombrero Galaxy" },
];

/**
 * Interactive Control Panel Dock component.
 */
export function ControlPanel({
  webcamStatus,
  onStartCamera,
  onStopCamera,
  activeShape,
  onSelectShape,
  activePaletteIndex,
  onSelectPalette,
  manualRotationX,
  setManualRotationX,
  manualRotationY,
  setManualRotationY,
  manualScale,
  setManualScale,
  manualZoom,
  setManualZoom,
}: ControlPanelProps) {
  const [showManualControls, setShowManualControls] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
      {/* Expanded Manual Sliders Drawer */}
      {showManualControls && (
        <div className="w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Manual Override Controls
            </span>
            <span className="text-[10px] text-slate-400">Test without camera</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Pitch Rotation Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Pitch Rotation (X)</span>
                <span className="font-mono text-cyan-400">{manualRotationX.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-1.5"
                max="1.5"
                step="0.05"
                value={manualRotationX}
                onChange={(e) => setManualRotationX(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Yaw Rotation Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Yaw Rotation (Y)</span>
                <span className="font-mono text-cyan-400">{manualRotationY.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-3.14"
                max="3.14"
                step="0.05"
                value={manualRotationY}
                onChange={(e) => setManualRotationY(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Expansion Scale Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Galaxy Expansion Scale</span>
                <span className="font-mono text-emerald-400">{manualScale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.2"
                step="0.05"
                value={manualScale}
                onChange={(e) => setManualScale(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Camera Zoom Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Camera Zoom Level</span>
                <span className="font-mono text-purple-400">{manualZoom.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={manualZoom}
                onChange={(e) => setManualZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Floating Bar */}
      <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-950/40">
        {/* Primary Camera Button */}
        {webcamStatus === "active" ? (
          <button
            onClick={onStopCamera}
            className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold text-xs transition-all flex items-center gap-2"
          >
            <CameraOff className="w-4 h-4 text-rose-400" />
            <span>Stop Camera</span>
          </button>
        ) : (
          <button
            onClick={onStartCamera}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>Start Camera</span>
          </button>
        )}

        {/* Separator */}
        <div className="h-6 w-px bg-slate-800" />

        {/* Shape Switcher Dropdown / Buttons */}
        <div className="flex items-center gap-1">
          <Layers className="w-4 h-4 text-slate-400 ml-1 hidden sm:block" />
          <select
            value={activeShape}
            onChange={(e) => onSelectShape(e.target.value as GalaxyShape)}
            className="bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {GALAXY_SHAPES.map((shape) => (
              <option key={shape.id} value={shape.id}>
                {shape.label}
              </option>
            ))}
          </select>
        </div>

        {/* Color Palette Selector Chips */}
        <div className="flex items-center gap-1.5 ml-1">
          <Palette className="w-4 h-4 text-slate-400 hidden sm:block" />
          {GALAXY_PALETTES.map((pal, index) => (
            <button
              key={pal.id}
              onClick={() => onSelectPalette(index)}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                activePaletteIndex % GALAXY_PALETTES.length === index
                  ? "scale-125 border-white shadow-lg"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
              style={{
                background: `linear-gradient(135deg, ${pal.armColorInner}, ${pal.armColorOuter})`,
              }}
              title={pal.name}
            />
          ))}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-slate-800" />

        {/* Manual Sliders Toggle Button */}
        <button
          onClick={() => setShowManualControls(!showManualControls)}
          className={`p-2.5 rounded-xl border transition-all ${
            showManualControls
              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
              : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
          }`}
          title="Toggle Manual Controls"
        >
          {showManualControls ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
