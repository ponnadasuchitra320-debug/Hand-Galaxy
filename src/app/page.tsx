"use client";

/**
 * Main Application Page Component - Hand Galaxy
 * Integrates React Three Fiber 3D Canvas, Google MediaPipe Hand Tracking AI,
 * dynamic gesture interpretation engine, and glassmorphism HUD interfaces.
 */

import React, { useState, useEffect } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { useHandLandmarker } from "../hooks/useHandLandmarker";
import { useGestureEngine } from "../hooks/useGestureEngine";
import { GalaxyCanvas } from "../components/GalaxyCanvas";
import { HandTrackerOverlay } from "../components/HandTrackerOverlay";
import { HUDOverlay } from "../components/HUDOverlay";
import { ControlPanel } from "../components/ControlPanel";
import { LoadingScreen } from "../components/LoadingScreen";
import { GalaxyShape } from "../lib/galaxyGenerators";
import { GALAXY_PALETTES } from "../lib/colorPalettes";

const SHAPES_ORDER: GalaxyShape[] = ["spiral-2", "spiral-4", "ring", "cluster", "sombrero"];

export default function HandGalaxyApp() {
  const [mounted, setMounted] = useState(false);

  // Prevent SSR hydration mismatch for WebGL & MediaPipe
  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Webcam Stream State
  const { videoRef, status: webcamStatus, errorMessage, startWebcam, stopWebcam } = useWebcam();

  // 2. MediaPipe Hand Landmarker AI State
  const isWebcamActive = webcamStatus === "active";
  const { landmarks, modelStatus, loadingProgress } = useHandLandmarker(videoRef, isWebcamActive);

  // 3. Gesture Interpretation Engine
  const gestureState = useGestureEngine(landmarks);

  // 4. Galaxy Presentation State
  const [shape, setShape] = useState<GalaxyShape>("spiral-2");
  const [paletteIndex, setPaletteIndex] = useState<number>(0);

  // 5. Manual Override Sliders (for testing without camera)
  const [manualRotationX, setManualRotationX] = useState<number>(0);
  const [manualRotationY, setManualRotationY] = useState<number>(0);
  const [manualScale, setManualScale] = useState<number>(1.0);
  const [manualZoom, setManualZoom] = useState<number>(1.0);

  // Trigger automatic preset changes on horizontal Swipe Gestures
  useEffect(() => {
    if (gestureState.swipeEvent === "left") {
      setPaletteIndex((prev) => (prev + 1) % GALAXY_PALETTES.length);
    } else if (gestureState.swipeEvent === "right") {
      setShape((prev) => {
        const currentIdx = SHAPES_ORDER.indexOf(prev);
        const nextIdx = (currentIdx + 1) % SHAPES_ORDER.length;
        return SHAPES_ORDER[nextIdx];
      });
    }
  }, [gestureState.swipeEvent]);

  // If not mounted yet (during server pre-rendering), return black background
  if (!mounted) {
    return (
      <main className="relative w-screen h-screen overflow-hidden bg-slate-950 flex items-center justify-center">
        <LoadingScreen progressText="Initializing Hand Galaxy..." />
      </main>
    );
  }

  // Combine hand gesture values with manual override values
  const effectiveRotationX = isWebcamActive ? gestureState.rotationX : manualRotationX;
  const effectiveRotationY = isWebcamActive ? gestureState.rotationY : manualRotationY;
  const effectiveScale = isWebcamActive ? gestureState.scale : manualScale;
  const effectiveZoom = isWebcamActive ? gestureState.zoom : manualZoom;

  const activePalette = GALAXY_PALETTES[paletteIndex % GALAXY_PALETTES.length];

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Show Loading Screen during initial MediaPipe model setup */}
      {modelStatus === "loading" && <LoadingScreen progressText={loadingProgress} />}

      {/* 3D React Three Fiber WebGL Galaxy Canvas */}
      <GalaxyCanvas
        particleCount={8000}
        shape={shape}
        paletteIndex={paletteIndex}
        rotationX={effectiveRotationX}
        rotationY={effectiveRotationY}
        scale={effectiveScale}
        zoom={effectiveZoom}
        indexTip={gestureState.indexTip}
      />

      {/* Futuristic Head-Up Display (HUD) Overlay */}
      <HUDOverlay
        activeGesture={gestureState.activeGesture}
        gestureDescription={gestureState.gestureDescription}
        modelStatus={modelStatus}
        webcamStatus={webcamStatus}
        activeShapeName={shape.toUpperCase()}
        activePaletteName={activePalette.name}
      />

      {/* Picture-in-Picture Webcam Feed & Hand Skeleton Overlay */}
      <HandTrackerOverlay
        videoRef={videoRef}
        landmarks={landmarks}
        webcamStatus={webcamStatus}
        errorMessage={errorMessage}
        onStartCamera={startWebcam}
        onStopCamera={stopWebcam}
      />

      {/* Floating Bottom Control Dock */}
      <ControlPanel
        webcamStatus={webcamStatus}
        onStartCamera={startWebcam}
        onStopCamera={stopWebcam}
        activeShape={shape}
        onSelectShape={setShape}
        activePaletteIndex={paletteIndex}
        onSelectPalette={setPaletteIndex}
        manualRotationX={manualRotationX}
        setManualRotationX={setManualRotationX}
        manualRotationY={manualRotationY}
        setManualRotationY={setManualRotationY}
        manualScale={manualScale}
        setManualScale={setManualScale}
        manualZoom={manualZoom}
        setManualZoom={setManualZoom}
      />
    </main>
  );
}
