/**
 * Gesture Recognition & Vector Math Utilities
 * Provides mathematical helpers, distance calculations, linear interpolation (lerp),
 * and dynamic gesture event detectors.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

/**
 * Standard linear interpolation (lerp) for smooth animation transitions.
 * @param start - Current value
 * @param end - Target value
 * @param amt - Interpolation factor (0..1)
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, amt: number): number {
  return start + (end - start) * Math.min(Math.max(amt, 0), 1);
}

/**
 * Calculates Euclidean distance between two 2D points.
 * @param p1 - Point 1 (x, y)
 * @param p2 - Point 2 (x, y)
 * @returns Distance magnitude
 */
export function distance2D(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates Euclidean distance between two 3D landmarks.
 * @param l1 - Landmark 1 (x, y, z)
 * @param l2 - Landmark 2 (x, y, z)
 * @returns 3D Distance magnitude
 */
export function distance3D(l1: Landmark, l2: Landmark): number {
  const dx = l2.x - l1.x;
  const dy = l2.y - l1.y;
  const dz = l2.z - l1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Detects if the hand is in an Open Palm gesture.
 * All five fingertips are extended far away from the wrist landmark.
 * @param landmarks - 21 MediaPipe hand landmarks
 * @returns Boolean flag + expansion intensity ratio
 */
export function checkOpenPalm(landmarks: Landmark[]): { isOpen: boolean; ratio: number } {
  if (!landmarks || landmarks.length < 21) return { isOpen: false, ratio: 1 };

  const wrist = landmarks[0];
  const fingerTips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky
  const mcpJoints = [2, 5, 9, 13, 17];

  let totalTipDistance = 0;
  let totalMcpDistance = 0;

  for (let i = 0; i < fingerTips.length; i++) {
    const tipDist = distance2D(landmarks[fingerTips[i]], wrist);
    const mcpDist = distance2D(landmarks[mcpJoints[i]], wrist);
    totalTipDistance += tipDist;
    totalMcpDistance += mcpDist;
  }

  const avgTipDist = totalTipDistance / 5;
  const avgMcpDist = totalMcpDistance / 5;
  const extensionRatio = avgTipDist / (avgMcpDist + 0.0001);

  // Open palm threshold: tips extended at least 1.85x farther than MCP joints
  const isOpen = extensionRatio > 1.85;

  return {
    isOpen,
    ratio: Math.min(Math.max(extensionRatio / 2.2, 0.5), 2.5),
  };
}

/**
 * Detects if the hand is in a Closed Fist gesture.
 * Fingertips are curled back close to the wrist and palm MCP joints.
 * @param landmarks - 21 MediaPipe hand landmarks
 * @returns Boolean flag + contraction ratio
 */
export function checkClosedFist(landmarks: Landmark[]): { isFist: boolean; ratio: number } {
  if (!landmarks || landmarks.length < 21) return { isFist: false, ratio: 1 };

  const wrist = landmarks[0];
  const fingerTips = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky tips
  const fingerMCPs = [5, 9, 13, 17]; // Corresponding MCP joints

  let curledCount = 0;
  let totalCurledRatio = 0;

  for (let i = 0; i < fingerTips.length; i++) {
    const tipWristDist = distance2D(landmarks[fingerTips[i]], wrist);
    const mcpWristDist = distance2D(landmarks[fingerMCPs[i]], wrist);

    // Tip is curled if it's closer or almost equal to wrist distance compared to MCP
    if (tipWristDist < mcpWristDist * 1.15) {
      curledCount++;
    }
    totalCurledRatio += tipWristDist / (mcpWristDist + 0.0001);
  }

  const isFist = curledCount >= 3;
  const avgRatio = totalCurledRatio / 4;

  return {
    isFist,
    ratio: Math.max(0.35, Math.min(avgRatio * 0.7, 1.0)),
  };
}

/**
 * Calculates pinch distance between Thumb tip (4) and Index tip (8).
 * @param landmarks - 21 MediaPipe hand landmarks
 * @returns Normalized distance (0 to 1 range)
 */
export function checkPinchDistance(landmarks: Landmark[]): number {
  if (!landmarks || landmarks.length < 21) return 0.5;

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];

  const dist = distance2D(thumbTip, indexTip);
  // Map typical pinch distance (~0.02 to ~0.35) into 0..1 scale
  return Math.min(Math.max((dist - 0.02) / 0.33, 0), 1);
}

/**
 * Class for detecting horizontal swipe gestures (Left / Right) based on wrist movement velocity.
 */
export class SwipeDetector {
  private history: { x: number; time: number }[] = [];
  private lastSwipeTime = 0;
  private cooldownMs = 700; // Milliseconds debounce between swipe triggers

  /**
   * Tracks hand position and checks if a swipe occurred.
   * @param currentX - Normalized X coordinate of hand wrist/centroid (0..1)
   * @returns "left" | "right" | null
   */
  public update(currentX: number): "left" | "right" | null {
    const now = Date.now();

    // Remove history older than 300ms
    this.history = this.history.filter((h) => now - h.time < 300);
    this.history.push({ x: currentX, time: now });

    if (now - this.lastSwipeTime < this.cooldownMs) {
      return null;
    }

    if (this.history.length >= 3) {
      const oldest = this.history[0];
      const deltaX = currentX - oldest.x;
      const deltaTime = (now - oldest.time) / 1000; // Seconds

      if (deltaTime > 0.05) {
        const velocity = deltaX / deltaTime; // Units per second

        // Threshold for rapid swipe movement
        if (velocity < -1.4) {
          this.lastSwipeTime = now;
          this.history = [];
          return "left";
        } else if (velocity > 1.4) {
          this.lastSwipeTime = now;
          this.history = [];
          return "right";
        }
      }
    }

    return null;
  }
}
