# 🌌 Hand Galaxy

A modern, high-performance **Next.js 15** web application built with **React Three Fiber (R3F)**, **Three.js**, and **Google MediaPipe Hand Landmarker AI**.

Control an 8,000+ glowing particle galaxy in real-time using computer vision and hand gestures detected through your webcam.

![Hand Galaxy](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-v8-blue?style=for-the-badge&logo=three.js)
![MediaPipe](https://img.shields.io/badge/Google-MediaPipe_Vision-4285F4?style=for-the-badge&logo=google)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)

---

## 🌟 Key Features

- **8,000+ Glowing Particles**: Procedurally generated WebGL galaxy utilizing `THREE.BufferGeometry` and `THREE.AdditiveBlending` for zero-lag 60 FPS performance.
- **5 Galaxy Topologies**:
  1. **2-Arm Spiral**
  2. **4-Arm Spiral**
  3. **Ring Galaxy**
  4. **Starburst Cluster**
  5. **Sombrero / Elliptical Galaxy**
- **5 Galactic Color Palettes**:
  - Cosmic Cyan
  - Supernova Violet
  - Solar Gold
  - Aurora Emerald
  - Nebula Crimson
- **Continuous Star Motion**: Stars continuously orbit galactic cores with distance-based Keplerian angular velocities.
- **Fingertip Particle Trails**: Dynamic 3D stardust emitter following index landmark coordinates.
- **Privacy-First Permission**: Camera permission is requested **only** when clicking the explicit *"Start Camera"* button.
- **PiP Skeleton Overlay**: Real-time Picture-in-Picture webcam feed with 21 2D landmark nodes and bone connections.
- **Manual Overrides**: Sliders for manual control when testing without a webcam.

---

## ✋ Hand Gesture Control Map

| Gesture | Action | Description |
|---|---|---|
| 👆 **Index Finger Point** | **Rotate Galaxy** | Move index finger horizontally or vertically to pitch and yaw the galaxy. |
| 🤌 **Pinch (Thumb + Index)** | **Zoom Camera** | Change distance between thumb and index tip to smoothly zoom in or out. |
| 🖐️ **Open Palm** | **Expand Galaxy** | Extend all fingers away from wrist to expand galaxy particle radius (1.8x scale). |
| ✊ **Closed Fist** | **Contract Galaxy** | Curl fingers into a fist to collapse particles into a dense galactic core (0.4x scale). |
| 👈 **Swipe Left** | **Color Palette Shift** | Rapid wrist velocity to the left cycles to the next color theme. |
| 👉 **Swipe Right** | **Generate New Galaxy** | Rapid wrist velocity to the right morphs into a new galaxy shape. |

> **Note**: All hand gesture values pass through **Linear Interpolation (`lerp`)** algorithms (`current + (target - current) * alpha`) to eliminate webcam micro-jitter and deliver silky smooth 60 FPS movement.

---

## 🏗️ Project Structure

```text
hand-galaxy/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with fonts & metadata
│   │   ├── page.tsx           # Main application page component
│   │   └── globals.css        # Tailwind CSS imports & animations
│   ├── components/
│   │   ├── GalaxyCanvas.tsx   # R3F Canvas & 8000+ particle WebGL geometry
│   │   ├── FingertipTrails.tsx# 3D star dust trail emitter following index tip
│   │   ├── HandTrackerOverlay.tsx # PiP Webcam view with 2D skeleton drawing
│   │   ├── HUDOverlay.tsx     # Head-Up Display banner, gesture guide & status
│   │   ├── ControlPanel.tsx   # Floating control dock & manual sliders
│   │   └── LoadingScreen.tsx  # Animated MediaPipe model loader
│   ├── hooks/
│   │   ├── useWebcam.ts       # HTML5 MediaDevices stream controller
│   │   ├── useHandLandmarker.ts # Google MediaPipe WASM AI inference loop
│   │   └── useGestureEngine.ts# Gesture translation engine with lerp math
│   └── lib/
│       ├── colorPalettes.ts   # Galactic color schemes (HEX/RGB converters)
│       ├── galaxyGenerators.ts# Procedural math generators for 5 galaxy types
│       └── gestureUtils.ts    # Lerp, 3D vectors, pinch, palm, fist & swipe math
├── public/
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher
- A working webcam for gesture controls

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd hand-galaxy
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your web browser.

5. Click **"Start Camera"** to grant webcam access and begin controlling the galaxy!

---

## ⚙️ Performance Optimizations

- **Single Draw Call**: 8,000+ particles are drawn in a single WebGL draw call using `THREE.BufferGeometry` and `THREE.Points`.
- **Zero React Re-renders inside 60 FPS Loop**: 60 FPS animation updates happen strictly inside R3F `useFrame` mutating WebGL array attributes (`needsUpdate = true`) without triggering React component re-renders.
- **Additive Blending**: Particles use depth writing disabled (`depthWrite: false`) and `THREE.AdditiveBlending` for glowing star effects without depth sorting overhead.

---

## 📄 License

MIT License. Built with Next.js 15, React Three Fiber, and MediaPipe.
