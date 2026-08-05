"use client";

/**
 * 3D Fingertip Particle Trail Emitter
 * Spawns glowing stardust trail particles in 3D space following index fingertip coordinates.
 */

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FingertipTrailsProps {
  position: { x: number; y: number; z: number } | null;
  colorHex?: string;
}

const TRAIL_COUNT = 60;

/**
 * Renders dynamic glowing particle trail behind user's index finger in 3D space.
 */
export function FingertipTrails({ position, colorHex = "#00ffff" }: FingertipTrailsProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Initialize static arrays for positions, sizes, and opacities
  const { positions, sizes, opacities, velocities } = useMemo(() => {
    const pos = new Float32Array(TRAIL_COUNT * 3);
    const sz = new Float32Array(TRAIL_COUNT);
    const op = new Float32Array(TRAIL_COUNT);
    const vel = new Float32Array(TRAIL_COUNT * 3);

    for (let i = 0; i < TRAIL_COUNT; i++) {
      pos[i * 3] = 9999;     // Offscreen initially
      pos[i * 3 + 1] = 9999;
      pos[i * 3 + 2] = 9999;
      sz[i] = 0;
      op[i] = 0;
      vel[i * 3] = (Math.random() - 0.5) * 0.03;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.03;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
    }

    return {
      positions: pos,
      sizes: sz,
      opacities: op,
      velocities: vel,
    };
  }, []);

  const currentIndex = useRef<number>(0);

  // Generate glowing circle micro-texture
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.3, "rgba(0, 240, 255, 0.8)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;

    // Spawn new trail particle at current fingertip 3D location
    if (position) {
      const idx = currentIndex.current * 3;
      posArr[idx] = position.x + (Math.random() - 0.5) * 0.15;
      posArr[idx + 1] = position.y + (Math.random() - 0.5) * 0.15;
      posArr[idx + 2] = position.z + (Math.random() - 0.5) * 0.15;

      opacities[currentIndex.current] = 1.0;
      sizes[currentIndex.current] = 0.35 + Math.random() * 0.25;

      currentIndex.current = (currentIndex.current + 1) % TRAIL_COUNT;
    }

    // Update existing trail particles (fade out and drift)
    for (let i = 0; i < TRAIL_COUNT; i++) {
      if (opacities[i] > 0) {
        opacities[i] -= 0.03; // Fade out rate
        sizes[i] *= 0.95;    // Shrink rate

        const i3 = i * 3;
        posArr[i3] += velocities[i3];
        posArr[i3 + 1] += velocities[i3 + 1];
        posArr[i3 + 2] += velocities[i3 + 2];
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.4}
        color={colorHex}
        map={texture}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
