// Shared by the starfield and the stars added on click
// (src/components/Starfield.tsx), so both come from the same sky.
// From loicviennois-home (src/lib/stars.ts).

export type Tint = 'white' | 'cool' | 'warm';

export interface Star {
  x: number;
  y: number;
  r: number;
  opacity: number;
  tint: Tint;
}

export type Random = () => number;

export function mulberry32(seed: number): Random {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number) => Math.round(value * 100) / 100;

/** A star at (x, y), with a random size, brightness and tint. */
export function makeStar(random: Random, x: number, y: number): Star {
  // Cubing skews towards small, dim stars with the odd bright one.
  const magnitude = random() ** 3;
  const roll = random();
  return {
    x: round(x),
    y: round(y),
    r: round(0.45 + magnitude * 1.25),
    opacity: round(0.35 + magnitude * 0.45 + random() * 0.2),
    tint: roll < 0.62 ? 'white' : roll < 0.84 ? 'cool' : 'warm',
  };
}

/** `count` stars scattered over a `size`-pixel square tile. */
export function scatter(seed: number, size: number, count: number): Star[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, () =>
    makeStar(random, random() * size, random() * size),
  );
}
