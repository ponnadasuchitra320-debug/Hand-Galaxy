/**
 * Procedural Galaxy Mesh & Buffer Generators for 3D Particles
 * Calculates 3D coordinates, color distributions, scale buffers, and orbital parameters
 * for different galaxy topologies.
 */

import { Color } from "three";
import { ColorPalette, hexToRgbNormalized } from "./colorPalettes";

export type GalaxyShape = "spiral-2" | "spiral-4" | "ring" | "cluster" | "sombrero";

export interface GalaxyData {
  positions: Float32Array;
  colors: Float32Array;
  scales: Float32Array;
  angles: Float32Array;
  distances: Float32Array;
  speeds: Float32Array;
}

/**
 * Generates procedural particle attributes for a given galaxy shape and palette.
 * @param count - Total number of particles (minimum 5000)
 * @param shape - Topology of galaxy ("spiral-2", "spiral-4", "ring", "cluster", "sombrero")
 * @param palette - Color palette scheme
 * @returns Struct containing Float32Arrays for BufferGeometry attributes
 */
export function generateGalaxyData(
  count: number = 8000,
  shape: GalaxyShape = "spiral-2",
  palette: ColorPalette
): GalaxyData {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const angles = new Float32Array(count);
  const distances = new Float32Array(count);
  const speeds = new Float32Array(count);

  const coreRGB = hexToRgbNormalized(palette.coreColor);
  const innerRGB = hexToRgbNormalized(palette.armColorInner);
  const outerRGB = hexToRgbNormalized(palette.armColorOuter);
  const accentRGB = hexToRgbNormalized(palette.starAccent);

  const colorCore = new Color(coreRGB.r, coreRGB.g, coreRGB.b);
  const colorInner = new Color(innerRGB.r, innerRGB.g, innerRGB.b);
  const colorOuter = new Color(outerRGB.r, outerRGB.g, outerRGB.b);
  const colorAccent = new Color(accentRGB.r, accentRGB.g, accentRGB.b);

  const galaxyRadius = 6.0;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    let x = 0;
    let y = 0;
    let z = 0;

    // Distance calculation with power distribution for high-density core
    const radiusRatio = Math.pow(Math.random(), 2.2);
    const radius = radiusRatio * galaxyRadius;
    const baseAngle = Math.random() * Math.PI * 2;

    // Shape-specific geometric positioning
    if (shape === "spiral-2" || shape === "spiral-4") {
      const arms = shape === "spiral-2" ? 2 : 4;
      const armAngle = ((i % arms) * (Math.PI * 2)) / arms;
      const spinAngle = radius * 1.2; // Spiral twist rate

      const totalAngle = baseAngle * 0.05 + armAngle + spinAngle;
      
      // Random dispersion offset along spiral arm width
      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.6 * (radius + 0.5);
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * (radius + 0.5);
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.6 * (radius + 0.5);

      x = Math.cos(totalAngle) * radius + randomX;
      y = randomY;
      z = Math.sin(totalAngle) * radius + randomZ;
      angles[i] = totalAngle;
    } else if (shape === "ring") {
      const ringRadius = 3.5 + Math.random() * 2.0;
      const ringAngle = baseAngle;
      const dispersion = (Math.random() - 0.5) * 0.5;

      x = Math.cos(ringAngle) * (ringRadius + dispersion);
      y = (Math.random() - 0.5) * 0.4;
      z = Math.sin(ringAngle) * (ringRadius + dispersion);
      angles[i] = ringAngle;
    } else if (shape === "cluster") {
      // Globular cluster distribution (spherical Gaussian distribution)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 4.5;

      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.sin(phi) * Math.sin(theta);
      z = r * Math.cos(phi);
      angles[i] = theta;
    } else if (shape === "sombrero") {
      // Flat dense disk with prominent central bulb
      const isBulb = Math.random() < 0.35;
      if (isBulb) {
        const r = Math.pow(Math.random(), 2) * 2.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.cos(phi) * 0.8;
        z = r * Math.sin(phi) * Math.sin(theta);
      } else {
        const r = 2.0 + Math.random() * 4.5;
        const spin = r * 0.8 + baseAngle;
        x = Math.cos(spin) * r;
        y = (Math.random() - 0.5) * 0.15;
        z = Math.sin(spin) * r;
      }
      angles[i] = baseAngle;
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    // Calculated distance from origin
    const distFromOrigin = Math.sqrt(x * x + y * y + z * z);
    distances[i] = distFromOrigin;

    // Keplerian orbital speed (inner stars orbit faster)
    speeds[i] = (0.5 + Math.random() * 0.5) / (distFromOrigin + 0.5);

    // Color gradient interpolation based on core vs outer distance
    const mixedColor = colorCore.clone();
    const distanceFactor = Math.min(distFromOrigin / galaxyRadius, 1.0);

    if (distanceFactor < 0.3) {
      mixedColor.lerp(colorInner, distanceFactor / 0.3);
    } else if (distanceFactor < 0.8) {
      mixedColor.copy(colorInner).lerp(colorOuter, (distanceFactor - 0.3) / 0.5);
    } else {
      mixedColor.copy(colorOuter).lerp(colorAccent, (distanceFactor - 0.8) / 0.2);
    }

    // Add subtle color variance to individual stars
    mixedColor.r += (Math.random() - 0.5) * 0.05;
    mixedColor.g += (Math.random() - 0.5) * 0.05;
    mixedColor.b += (Math.random() - 0.5) * 0.05;

    colors[i3] = Math.max(0, Math.min(1, mixedColor.r));
    colors[i3 + 1] = Math.max(0, Math.min(1, mixedColor.g));
    colors[i3 + 2] = Math.max(0, Math.min(1, mixedColor.b));

    // Particle size (core stars are larger, outer stars twinkle smaller)
    scales[i] = Math.max(0.08, (1.2 - distanceFactor * 0.7) * (0.6 + Math.random() * 0.8));
  }

  return {
    positions,
    colors,
    scales,
    angles,
    distances,
    speeds,
  };
}
