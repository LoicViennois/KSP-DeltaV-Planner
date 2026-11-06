// Generates the favicon and PWA icons from one SVG design: a craft orbiting
// Kerbin, the same mark as the header logo (src/components/Logo.tsx).
// Usage: pnpm icons
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

import {
  CRAFT,
  LOGO_COLORS,
  ORBIT_BACK,
  ORBIT_FRONT,
  ORBIT_STROKE_WIDTH,
  ORBIT_TILT,
  PLANET,
} from '../src/lib/logo.ts';

const PUBLIC_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../public',
);

const circle = ({ cx, cy, r }, fill) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="none"/>`;

/** A few faint stars on the tile, in the 32 unit grid of the logo. */
const STARS = [
  [5, 6],
  [26, 5],
  [27, 25],
  [8, 27],
  [21, 29],
];

/**
 * @param {{ maskable?: boolean }} options Maskable icons are full-bleed, with the
 * logo kept inside the 80% safe zone so any platform mask shape fits.
 */
function iconSvg({ maskable = false } = {}) {
  const scale = maskable ? 12 : 16;
  const offset = (512 - 32 * scale) / 2;
  const stars = STARS.map(([x, y]) =>
    circle({ cx: x, cy: y, r: 0.35 }, 'rgb(236 233 244 / 0.5)'),
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${maskable ? 0 : 112}" fill="${LOGO_COLORS.tile}"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    ${stars}
    <g transform="${ORBIT_TILT}" fill="none" stroke="${LOGO_COLORS.orbit}" stroke-width="${ORBIT_STROKE_WIDTH}" stroke-linecap="round">
      <path d="${ORBIT_BACK}" opacity="0.55"/>
      ${circle(PLANET, LOGO_COLORS.planet)}
      <path d="${ORBIT_FRONT}"/>
      ${circle(CRAFT, LOGO_COLORS.craft)}
    </g>
  </g>
</svg>
`;
}

const outputs = [
  { file: 'favicon.svg', svg: iconSvg() },
  { file: 'favicon.64.png', svg: iconSvg(), size: 64 },
  { file: 'favicon.512.png', svg: iconSvg(), size: 512 },
  { file: 'apple-touch-icon.png', svg: iconSvg({ maskable: true }), size: 180 },
  {
    file: 'icons/maskable-512x512.png',
    svg: iconSvg({ maskable: true }),
    size: 512,
  },
  ...[72, 96, 128, 144, 152, 192, 384, 512].map((size) => ({
    file: `icons/icon-${size}x${size}.png`,
    svg: iconSvg(),
    size,
  })),
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const { file, svg, size } of outputs) {
  const target = resolve(PUBLIC_DIR, file);
  mkdirSync(dirname(target), { recursive: true });
  if (!size) {
    writeFileSync(target, svg);
  } else {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(
      `<html><body style="margin:0;background:transparent">
        <img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${size}" height="${size}" style="display:block">
      </body></html>`,
    );
    await page.screenshot({ path: target, omitBackground: true });
  }
  console.log(`wrote public/${file}`);
}

await browser.close();
