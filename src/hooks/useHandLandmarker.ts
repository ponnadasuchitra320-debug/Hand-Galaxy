/**
 * Custom Hook: useHandLandmarker
 * Asynchronously loads MediaPipe Hand Landmarker WASM binaries and machine learning models,
 * then runs real-time inference on the active webcam video stream.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { Landmark } from "../lib/gestureUtils";

export type ModelStatus = "unloaded" | "loading" | "ready" | "error";

export interface UseHandLandmarkerReturn {
  landmarks: Landmark[] | null;
  rawResult: HandLandmarkerResult | null;
  modelStatus: ModelStatus;
  loadingProgress: string;
}

/**
 * Custom hook to initialize and query Google MediaPipe Hand Landmarker AI.
 * @param videoRef - Reference to HTMLVideoElement containing the webcam feed
 * @param isWebcamActive - Flag indicating if webcam stream is running
 * @returns Real-time landmarks array, raw MediaPipe result, and loading status.
 */
export function useHandLandmarker(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isWebcamActive: boolean
): UseHandLandmarkerReturn {
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
  const [rawResult, setRawResult] = useState<HandLandmarkerResult | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus>("unloaded");
  const [loadingProgress, setLoadingProgress] = useState<string>("Waiting to start...");

  // Ref to hold the initialized MediaPipe HandLandmarker instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const landmarkerRef = useRef<any>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);

  /**
   * Loads MediaPipe Vision tasks and HandLandmarker model safely on client.
   */
  const initLandmarker = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (landmarkerRef.current || modelStatus === "loading" || modelStatus === "ready") return;

    setModelStatus("loading");
    setLoadingProgress("Initializing Vision WebAssembly...");

    try {
      // Dynamic import to support SSR environments
      const { HandLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");

      setLoadingProgress("Downloading MediaPipe model weights...");

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1, // Detect single primary hand as per user requirement
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });

      landmarkerRef.current = landmarker;
      setModelStatus("ready");
      setLoadingProgress("Model loaded successfully!");
    } catch (err) {
      console.error("Failed to load MediaPipe HandLandmarker:", err);
      setModelStatus("error");
      setLoadingProgress("Failed to load AI model. Please refresh.");
    }
  }, [modelStatus]);

  // Load landmarker model when component mounts
  useEffect(() => {
    initLandmarker();
  }, [initLandmarker]);

  /**
   * Animation loop to continuously extract hand landmarks from video frames.
   */
  useEffect(() => {
    let active = true;

    const detectLoop = () => {
      if (!active || typeof window === "undefined") return;

      const video = videoRef.current;
      if (
        isWebcamActive &&
        video &&
        video.readyState >= 2 &&
        landmarkerRef.current &&
        modelStatus === "ready"
      ) {
        if (video.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = video.currentTime;

          const nowInMs = performance.now();
          const results = landmarkerRef.current.detectForVideo(video, nowInMs) as HandLandmarkerResult;

          setRawResult(results);

          if (results && results.landmarks && results.landmarks.length > 0) {
            setLandmarks(results.landmarks[0]);
          } else {
            setLandmarks(null);
          }
        }
      } else if (!isWebcamActive) {
        setLandmarks(null);
        setRawResult(null);
      }

      animationFrameId.current = requestAnimationFrame(detectLoop);
    };

    if (isWebcamActive && modelStatus === "ready") {
      detectLoop();
    }

    return () => {
      active = false;
      if (animationFrameId.current && typeof window !== "undefined") {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isWebcamActive, modelStatus, videoRef]);

  return {
    landmarks,
    rawResult,
    modelStatus,
    loadingProgress,
  };
}
