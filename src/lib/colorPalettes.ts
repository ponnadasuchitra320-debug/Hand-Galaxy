/**
 * Color Palettes for Hand Galaxy
 * Provides curated galactic themes with distinct inner core, outer arm, and star accent colors.
 */

export interface ColorPalette {
  id: string;
  name: string;
  coreColor: string;    // Galactic core glow (HEX)
  armColorInner: string;// Inner spiral arm color (HEX)
  armColorOuter: string;// Outer spiral arm color (HEX)
  starAccent: string;   // Distant star dust accent (HEX)
  bgGlow: string;       // Ambient background hue (HEX)
}

/**
 * List of pre-defined color schemes available for the galaxy.
 */
export const GALAXY_PALETTES: ColorPalette[] = [
  {
    id: "cosmic-cyan",
    name: "Cosmic Cyan",
    coreColor: "#ffffff",
    armColorInner: "#00f0ff",
    armColorOuter: "#7000ff",
    starAccent: "#00a8ff",
    bgGlow: "#030816",
  },
  {
    id: "supernova-violet",
    name: "Supernova Violet",
    coreColor: "#fff0f5",
    armColorInner: "#d800ff",
    armColorOuter: "#4b0082",
    starAccent: "#ff007f",
    bgGlow: "#0e021a",
  },
  {
    id: "solar-gold",
    name: "Solar Gold",
    coreColor: "#ffffff",
    armColorInner: "#ffaa00",
    armColorOuter: "#ff3300",
    starAccent: "#ffe600",
    bgGlow: "#140800",
  },
  {
    id: "aurora-emerald",
    name: "Aurora Emerald",
    coreColor: "#e6ffff",
    armColorInner: "#00ffcc",
    armColorOuter: "#008855",
    starAccent: "#73ff00",
    bgGlow: "#01120c",
  },
  {
    id: "deep-crimson",
    name: "Nebula Crimson",
    coreColor: "#ffffff",
    armColorInner: "#ff0055",
    armColorOuter: "#800020",
    starAccent: "#ff6600",
    bgGlow: "#1a0008",
  },
];

/**
 * Utility function to convert a HEX string color into an RGB object (0-1 float range for WebGL).
 * @param hex - Hexadecimal color code string (e.g. "#ff0000")
 * @returns Object with r, g, b values normalized between 0 and 1
 */
export function hexToRgbNormalized(hex: string): { r: number; g: number; b: number } {
  const sanitizedHex = hex.replace("#", "");
  const num = parseInt(sanitizedHex, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}
