/**
 * Custom Hook: useGestureEngine
 * Interprets raw 21 hand landmarks into interactive control signals (Rotation, Pinch Zoom,
 * Expansion/Contraction, Swipe events) smoothed with Linear Interpolation (lerp).
 */

import { useState, useEffect, useRef } from "react";
import {
  Landmark,
  lerp,
  checkOpenPalm,
  checkClosedFist,
  checkPinchDistance,
  SwipeDetector,
} from "../lib/gestureUtils";

export type GestureType = "none" | "rotate" | "pinch" | "expand" | "contract" | "swipe-left" | "swipe-right";

export interface GestureState {
  // Lerped values for smooth WebGL rendering
  rotationX: number; // Pitch angle (radians or degrees)
  rotationY: number; // Yaw angle (radians or degrees)
  zoom: number;      // Camera distance multiplier (e.g. 0.5 .. 2.0)
  scale: number;     // Galaxy particle dispersion scale (e.g. 0.35 .. 2.0)
  
  // Fingertip 3D point (for star trails)
  indexTip: { x: number; y: number; z: number } | null;
  
  // Status flags
  activeGesture: GestureType;
  gestureDescription: string;
  
  // Event triggers (pulsed for single action)
  swipeEvent: "left" | "right" | null;
}

/**
 * Custom hook to translate hand landmark stream into smooth lerped gesture parameters.
 * @param landmarks - Current array of 21 hand landmarks (or null if no hand detected)
 * @returns Smooth gesture state structure for R3F canvas
 */
export function useGestureEngine(landmarks: Landmark[] | null): GestureState {
  // Target values before lerp
  const targetRotationX = useRef<number>(0);
  const targetRotationY = useRef<number>(0);
  const targetZoom = useRef<number>(1.0);
  const targetScale = useRef<number>(1.0);

  // Current lerped state values
  const [state, setState] = useState<GestureState>({
    rotationX: 0,
    rotationY: 0,
    zoom: 1.0,
    scale: 1.0,
    indexTip: null,
    activeGesture: "none",
    gestureDescription: "No hand detected. Show your hand to control!",
    swipeEvent: null,
  });

  const swipeDetectorRef = useRef<SwipeDetector>(new SwipeDetector());
  const prevIndexPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!landmarks || landmarks.length < 21) {
      // Smoothly return to default resting state when hand disappears
      targetZoom.current = 1.0;
      targetScale.current = 1.0;
      prevIndexPosRef.current = null;

      setState((prev) => ({
        ...prev,
        rotationX: lerp(prev.rotationX, 0, 0.05),
        rotationY: lerp(prev.rotationY, 0, 0.05),
        zoom: lerp(prev.zoom, 1.0, 0.08),
        scale: lerp(prev.scale, 1.0, 0.08),
        indexTip: null,
        activeGesture: "none",
        gestureDescription: "No hand detected. Show your hand to control!",
        swipeEvent: null,
      }));
      return;
    }

    const wrist = landmarks[0];
    const indexTip = landmarks[8]; // Landmark 8 = Index finger tip

    // 1. Check Swipe Left / Swipe Right using Wrist X velocity
    const swipeResult = swipeDetectorRef.current.update(wrist.x);

    // 2. Check Open Palm (Expand) & Closed Fist (Contract)
    const palm = checkOpenPalm(landmarks);
    const fist = checkClosedFist(landmarks);

    // 3. Check Pinch Gesture (Zoom)
    const pinchDist = checkPinchDistance(landmarks);
    const isPinching = pinchDist < 0.18;

    let currentGesture: GestureType = "none";
    let desc = "Tracking hand";

    if (swipeResult === "left") {
      currentGesture = "swipe-left";
      desc = "Swipe Left detected! Palette changed.";
    } else if (swipeResult === "right") {
      currentGesture = "swipe-right";
      desc = "Swipe Right detected! Generating new galaxy!";
    } else if (isPinching) {
      currentGesture = "pinch";
      // Map pinch distance to zoom level (0.5x zoomed in to 2.2x zoomed out)
      targetZoom.current = 0.5 + pinchDist * 3.5;
      desc = `Pinch Zooming (${targetZoom.current.toFixed(2)}x)`;
    } else if (palm.isOpen) {
      currentGesture = "expand";
      targetScale.current = 1.8;
      desc = "Open Palm: Galaxy Expanding!";
    } else if (fist.isFist) {
      currentGesture = "contract";
      targetScale.current = 0.4;
      desc = "Closed Fist: Galaxy Contracting!";
    } else {
      // Default gesture: Index finger rotation control
      currentGesture = "rotate";
      
      // Calculate normalized rotation deltas based on index finger movement
      if (prevIndexPosRef.current) {
        const dx = indexTip.x - prevIndexPosRef.current.x;
        const dy = indexTip.y - prevIndexPosRef.current.y;

        // Invert X because camera is mirrored
        targetRotationY.current += -dx * 4.5;
        targetRotationX.current += dy * 4.5;
      }
      prevIndexPosRef.current = { x: indexTip.x, y: indexTip.y };

      // Gradated scale return to 1.0
      targetScale.current = 1.0;
      targetZoom.current = 1.0;

      desc = "Index Finger: Rotating Galaxy";
    }

    // Convert index tip to normalized screen coordinates (-1 to +1 range for 3D)
    const normIndexTip = {
      x: (indexTip.x - 0.5) * -10, // Invert X for mirror view
      y: (0.5 - indexTip.y) * 7,
      z: (indexTip.z || 0) * -5,
    };

    // Apply linear interpolation (lerp) to smooth out hand jitter
    setState((prev) => ({
      rotationX: lerp(prev.rotationX, targetRotationX.current, 0.12),
      rotationY: lerp(prev.rotationY, targetRotationY.current, 0.12),
      zoom: lerp(prev.zoom, targetZoom.current, 0.1),
      scale: lerp(prev.scale, targetScale.current, 0.1),
      indexTip: normIndexTip,
      activeGesture: currentGesture,
      gestureDescription: desc,
      swipeEvent: swipeResult,
    }));
  }, [landmarks]);

  return state;
}
