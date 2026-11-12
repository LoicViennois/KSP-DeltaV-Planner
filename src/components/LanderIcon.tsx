import { createLucideIcon } from 'lucide-react';

/**
 * An Apollo-style lunar lander, drawn on the Lucide grid so it sits
 * alongside the other step icons: ascent cabin, descent stage, engine bell
 * and splayed landing legs with footpads.
 */
export const Lander = createLucideIcon('lander', [
  ['path', { d: 'M12 2v2', key: 'antenna' }],
  ['path', { d: 'M9 4h6l2 3v3H7V7z', key: 'ascent' }],
  [
    'rect',
    { x: '6', y: '10', width: '12', height: '5', rx: '1', key: 'descent' },
  ],
  ['path', { d: 'm10 15-1 3h6l-1-3', key: 'engine' }],
  ['path', { d: 'm6 12-3 8', key: 'leg-left' }],
  ['path', { d: 'm18 12 3 8', key: 'leg-right' }],
  ['path', { d: 'M2 20h2', key: 'pad-left' }],
  ['path', { d: 'M20 20h2', key: 'pad-right' }],
]);
