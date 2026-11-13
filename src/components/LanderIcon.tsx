import { createLucideIcon, type IconNode } from 'lucide-react';

// Tilted to the left as it comes down, and drawn a bit smaller to stay
// within the grid; the stroke is thickened back to that of the other icons.
const SCALE = 0.88;
const tilt = {
  transform: `translate(12 12) rotate(-15) scale(${SCALE}) translate(-12 -12)`,
  strokeWidth: 2 / SCALE,
};

const parts: IconNode = [
  ['path', { d: 'M12 2v2', key: 'antenna' }],
  ['path', { d: 'M9 4h6l2 3v3H7V7z', key: 'ascent' }],
  [
    'rect',
    { x: '6', y: '10', width: '12', height: '5', rx: '1', key: 'descent' },
  ],
  ['path', { d: 'm10 15-1 3h6l-1-3', key: 'engine' }],
  // The descent engine firing, to slow down.
  [
    'path',
    {
      d: 'M12 23.5c-1.3-1.2-1.8-2.6-1.4-4h2.8c.4 1.4-.1 2.8-1.4 4z',
      key: 'flame',
    },
  ],
  ['path', { d: 'm6 12-3 8', key: 'leg-left' }],
  ['path', { d: 'm18 12 3 8', key: 'leg-right' }],
  ['path', { d: 'M2 20h2', key: 'pad-left' }],
  ['path', { d: 'M20 20h2', key: 'pad-right' }],
];

/**
 * An Apollo-style lunar lander, drawn on the Lucide grid so it sits
 * alongside the other step icons: ascent cabin, descent stage, engine bell
 * with its flame and splayed landing legs with footpads.
 */
export const Lander = createLucideIcon(
  'lander',
  parts.map(([tag, attrs]) => [tag, { ...attrs, ...tilt }]),
);
