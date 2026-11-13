import { createLucideIcon, type IconNode } from 'lucide-react';

// Upright, and a bit smaller than the grid with its flame below: brought
// back to its middle, the stroke thickened back to that of the other icons.
const SCALE = 0.92;
const fit = {
  transform: `translate(12 12) scale(${SCALE}) translate(-12 -13)`,
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
  // The descent engine firing, to slow down: a small flame, clear of the
  // bell like that of the rocket.
  [
    'path',
    {
      d: 'M12 24c-.9-.8-1.2-1.6-1-2.5h2c.2.9-.1 1.7-1 2.5z',
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
  parts.map(([tag, attrs]) => [tag, { ...attrs, ...fit }]),
);
