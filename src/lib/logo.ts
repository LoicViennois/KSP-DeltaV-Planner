// The logo, drawn on a 32 unit grid: Kerbin with a craft in a tilted orbit.
// Shared by the header logo and the favicon and PWA icons (scripts/generate-icons.mjs).

export const LOGO_COLORS = {
  tile: '#1c1927',
  planet: '#2a7efe',
  orbit: '#8fd14f',
  craft: '#ece9f4',
} as const;

export const ORBIT_TILT = 'rotate(-22 16 16)';
/** The half of the orbit passing behind the planet. */
export const ORBIT_BACK = 'M3 16A13 4.5 0 0 1 29 16';
/** The half of the orbit passing in front of the planet. */
export const ORBIT_FRONT = 'M29 16A13 4.5 0 0 1 3 16';
export const ORBIT_STROKE_WIDTH = 1.8;
export const PLANET = { cx: 16, cy: 16, r: 7 } as const;
export const CRAFT = { cx: 9.5, cy: 19.9, r: 2 } as const;
