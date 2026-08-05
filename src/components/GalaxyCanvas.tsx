"use client";

/**
 * 3D Galaxy Canvas Component (React Three Fiber + Three.js)
 * Renders 8000+ glowing particles with additive blending, continuous orbital animation,
 * dynamic shape morphing, color palette transitions, and smooth gesture response.
 */

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GALAXY_PALETTES, ColorPalette } from "../lib/colorPalettes";
import { GalaxyShape, generateGalaxyData } from "../lib/galaxyGenerators";
import { FingertipTrails } from "./FingertipTrails";

interface GalaxyParticlesProps {
  particleCount: number;
  shape: GalaxyShape;
  palette: ColorPalette;
  rotationX: number;
  rotationY: number;
  scale: number;
  zoom: number;
}

/**
 * Internal 3D Particle Cloud component executing 60 FPS WebGL frame updates.
 */
function GalaxyParticles({
  particleCount,
  shape,
  palette,
  rotationX,
  rotationY,
  scale,
  zoom,
}: GalaxyParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Target positions and target colors for smooth morphing animations
  const targetPositionsRef = useRef<Float32Array | null>(null);
  const targetColorsRef = useRef<Float32Array | null>(null);

  // Generate initial procedural galaxy buffers
  const initialData = useMemo(() => {
    return generateGalaxyData(particleCount, shape, palette);
  }, [particleCount, shape, palette]);

  // Create soft glowing star canvas texture
  const particleTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.9)");
      gradient.addColorStop(0.5, "rgba(200, 230, 255, 0.4)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Update target buffers when shape or palette changes
  useEffect(() => {
    const newData = generateGalaxyData(particleCount, shape, palette);
    targetPositionsRef.current = newData.positions;
    targetColorsRef.current = newData.colors;
  }, [particleCount, shape, palette]);

  // Frame loop for 60 FPS continuous star animation and morphing
  useFrame((state, delta) => {
    if (!pointsRef.current || !groupRef.current) return;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const colAttr = geo.attributes.color as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    const time = state.clock.getElapsedTime();

    // 1. Morph particle positions & colors towards target buffers (if shape/palette changed)
    const targetPos = targetPositionsRef.current;
    const targetCol = targetColorsRef.current;
    const morphSpeed = delta * 4.0; // Morph transition rate

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      if (targetPos) {
        posArr[i3] += (targetPos[i3] - posArr[i3]) * morphSpeed;
        posArr[i3 + 1] += (targetPos[i3 + 1] - posArr[i3 + 1]) * morphSpeed;
        posArr[i3 + 2] += (targetPos[i3 + 2] - posArr[i3 + 2]) * morphSpeed;
      }

      if (targetCol) {
        colArr[i3] += (targetCol[i3] - colArr[i3]) * morphSpeed;
        colArr[i3 + 1] += (targetCol[i3 + 1] - colArr[i3 + 1]) * morphSpeed;
        colArr[i3 + 2] += (targetCol[i3 + 2] - colArr[i3 + 2]) * morphSpeed;
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // 2. Continuous Galactic Core Orbital Rotation
    groupRef.current.rotation.y += delta * 0.15;
    groupRef.current.rotation.x = rotationX;
    groupRef.current.rotation.z = rotationY * 0.5;

    // 3. Smooth Scale (Open Palm expansion / Closed Fist contraction)
    groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), delta * 5.0);

    // 4. Smooth Camera Zoom (Pinch gesture)
    const targetCameraZ = 12 * zoom;
    camera.position.z += (targetCameraZ - camera.position.z) * delta * 4.0;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[initialData.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[initialData.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          vertexColors
          map={particleTexture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

/**
 * Background star dust ambient particle background.
 */
function DeepSpaceBackground() {
  const count = 1500;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#4466aa" transparent opacity={0.5} />
    </points>
  );
}

interface GalaxyCanvasProps {
  particleCount?: number;
  shape?: GalaxyShape;
  paletteIndex?: number;
  rotationX: number;
  rotationY: number;
  scale: number;
  zoom: number;
  indexTip: { x: number; y: number; z: number } | null;
}

/**
 * Main 3D Canvas container wrapper.
 */
export function GalaxyCanvas({
  particleCount = 8000,
  shape = "spiral-2",
  paletteIndex = 0,
  rotationX,
  rotationY,
  scale,
  zoom,
  indexTip,
}: GalaxyCanvasProps) {
  const activePalette = GALAXY_PALETTES[paletteIndex % GALAXY_PALETTES.length];

  return (
    <div className="w-full h-full absolute inset-0 bg-slate-950 overflow-hidden select-none">
      <Canvas
        camera={{ position: [0, 2, 12], fov: 60 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={[activePalette.bgGlow]} />
        <ambientLight intensity={0.5} />
        
        <DeepSpaceBackground />

        <GalaxyParticles
          particleCount={particleCount}
          shape={shape}
          palette={activePalette}
          rotationX={rotationX}
          rotationY={rotationY}
          scale={scale}
          zoom={zoom}
        />

        {/* 3D Fingertip star dust particle trails */}
        <FingertipTrails position={indexTip} colorHex={activePalette.armColorInner} />
      </Canvas>
    </div>
  );
}
