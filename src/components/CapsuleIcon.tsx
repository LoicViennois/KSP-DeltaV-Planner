import { createLucideIcon, type IconNode } from 'lucide-react';

// Tilted to the left at 45° like the lander, and fitted to the grid as tightly
// as the rocket; the stroke is thickened back to that of the other icons.
const SCALE = 0.875;
// The middle of the capsule once tilted, brought back to that of the grid.
const MIDDLE = 13.24;
const tilt = {
  transform: `translate(12 12) scale(${SCALE}) translate(${-MIDDLE} ${-MIDDLE}) rotate(-45 12 12)`,
  strokeWidth: 2 / SCALE,
};

const parts: IconNode = [
  ['path', { d: 'M9.5 8h5l3.5 8H6z', key: 'cone' }],
  ['path', { d: 'M5 17c4.5 2.6 9.5 2.6 14 0', key: 'shield' }],
  ['path', { d: 'M3 20.5c5.5 4 12.5 4 18 0', key: 'shock' }],
  // The air rushing past, clear of the capsule.
  ['path', { d: 'M8.5 1.5v2.5', key: 'wind-left' }],
  ['path', { d: 'M12 1v3', key: 'wind' }],
  ['path', { d: 'M15.5 1.5v2.5', key: 'wind-right' }],
];

/**
 * A capsule coming back through an atmosphere, heat shield first, drawn on
 * the Lucide grid like the lander: its cone, the shield, the shock wave in
 * front of it and the wind past it.
 */
export const Capsule = createLucideIcon(
  'capsule',
  parts.map(([tag, attrs]) => [tag, { ...attrs, ...tilt }]),
);
