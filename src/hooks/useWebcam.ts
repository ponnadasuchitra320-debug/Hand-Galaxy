/**
 * Custom Hook: useWebcam
 * Manages HTML5 MediaDevices webcam access, permissions, streaming states, and teardown.
 * IMPORTANT: Camera permission is requested ONLY when explicitly triggered by user interaction.
 */

import { useState, useRef, useCallback, useEffect } from "react";

export type WebcamStatus = "idle" | "requesting" | "active" | "error";

export interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: WebcamStatus;
  errorMessage: string | null;
  startWebcam: () => Promise<void>;
  stopWebcam: () => void;
}

/**
 * Custom React Hook to safely control the user's camera stream.
 * @returns Ref for video element, current status string, error states, and toggle triggers.
 */
export function useWebcam(): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<WebcamStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Stops active camera tracks and resets video source.
   */
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  /**
   * Prompts user for camera permission and initializes video stream.
   */
  const startWebcam = useCallback(async () => {
    // If already active or requesting, prevent redundant calls
    if (status === "active" || status === "requesting") return;

    setStatus("requesting");
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam access is not supported by your browser environment.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
          frameRate: { ideal: 60, max: 60 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((err) => {
            console.error("Video play error:", err);
          });
          setStatus("active");
        };
      } else {
        setStatus("active");
      }
    } catch (err: unknown) {
      console.error("Webcam permission denied or error:", err);
      const message = err instanceof Error ? err.message : "Failed to access camera.";
      setErrorMessage(message);
      setStatus("error");
    }
  }, [status]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return {
    videoRef,
    status,
    errorMessage,
    startWebcam,
    stopWebcam,
  };
}
