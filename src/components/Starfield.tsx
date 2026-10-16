import { useEffect, useRef } from 'react';

import { makeStar, scatter } from '../lib/stars';

// The starfield of loicviennois.com (src/components/Starfield.astro there).
// A faint, fixed field of stars behind the page. Positions, sizes, brightness
// and tints come from a seeded generator, so the sky is irregular but identical
// on every load. Two tiles of coprime sizes overlap, which keeps the repeat
// from ever lining up into a visible grid. Clicking or tapping the background
// adds a star under the pointer, with a brief flare.

const LAYERS = [
  { id: 'stars-a', size: 613, stars: scatter(1987, 613, 70) },
  { id: 'stars-b', size: 419, stars: scatter(2026, 419, 26) },
];

const SVG_NS = 'http://www.w3.org/2000/svg';
// Beyond this, each new star replaces the oldest added one.
const MAX_ADDED = 300;
// A pointer that travels further than this is a drag, not a tap.
const TAP_SLOP = 8;
const INTERACTIVE =
  'a, button, input, select, textarea, label, summary, [role], [tabindex], dialog';

export function Starfield() {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    let press: { id: number; x: number; y: number } | undefined;

    // Pointer events rather than click: iOS does not send clicks for taps on
    // non-interactive content, and a scrolling touch ends in pointercancel.
    const onPointerDown = (event: PointerEvent) => {
      const onControl =
        event.target instanceof Element && event.target.closest(INTERACTIVE);
      press =
        event.isPrimary && event.button === 0 && !onControl
          ? { id: event.pointerId, x: event.clientX, y: event.clientY }
          : undefined;
    };

    const onPointerCancel = () => {
      press = undefined;
    };

    const onPointerUp = (event: PointerEvent) => {
      const start = press;
      press = undefined;
      const group = groupRef.current;
      if (!group || start?.id !== event.pointerId) {
        return;
      }
      const moved = Math.hypot(
        event.clientX - start.x,
        event.clientY - start.y,
      );
      // Selecting text should not leave a star behind.
      if (moved > TAP_SLOP || !(window.getSelection()?.isCollapsed ?? true)) {
        return;
      }

      // The sky is fixed to the viewport, so client coordinates are sky coordinates.
      const { x, y, r, opacity, tint } = makeStar(
        Math.random,
        event.clientX,
        event.clientY,
      );
      const star = document.createElementNS(SVG_NS, 'circle');
      star.setAttribute('cx', String(x));
      star.setAttribute('cy', String(y));
      star.setAttribute('r', String(r));
      star.setAttribute('class', `star-${tint} star-added`);
      star.style.setProperty('--brightness', String(opacity));
      group.append(star);

      if (group.childElementCount > MAX_ADDED) {
        group.firstElementChild?.remove();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointercancel', onPointerCancel);
    document.addEventListener('pointerup', onPointerUp);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointercancel', onPointerCancel);
      document.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  return (
    <svg
      aria-hidden
      focusable="false"
      data-testid="starfield"
      className="pointer-events-none fixed inset-0 -z-10 size-full"
    >
      <defs>
        {LAYERS.map(({ id, size, stars }) => (
          <pattern
            key={id}
            id={id}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            {stars.map(({ x, y, r, opacity, tint }, index) => (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={r}
                fillOpacity={opacity}
                className={`star-${tint}`}
              />
            ))}
          </pattern>
        ))}
      </defs>
      {LAYERS.map(({ id }) => (
        <rect
          key={id}
          className="starfield-sky"
          width="100%"
          height="100%"
          fill={`url(#${id})`}
        />
      ))}
      <g ref={groupRef} data-testid="added-stars" />
    </svg>
  );
}
