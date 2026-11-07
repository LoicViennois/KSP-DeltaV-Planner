import { use, useEffect, useRef } from 'react';

import mapSvg from '../assets/dv-map.svg?raw';
import { applyHighlight, mapHighlight } from '../lib/map-highlight';
import { useOuterPlanets } from '../lib/outer-planets';
import type { Step, Trip } from '../lib/planner';

const markup = { __html: mapSvg };

// Only those playing with the Outer Planets Mod download its map.
let outerMarkup: Promise<{ __html: string }> | null = null;
function loadOuterMarkup() {
  outerMarkup ??= import('../assets/dv-map-opm.svg?raw').then((module) => ({
    __html: module.default,
  }));
  return outerMarkup;
}

interface DvMapProps {
  trip: Trip;
  step: Step | null;
  className?: string;
}

/** The KSPedia Δv map, or the Outer Planets Mod one, with the trip highlighted. */
export default function DvMap({ trip, step, className }: DvMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const outerPlanets = useOuterPlanets();
  // Suspends while the map of the Outer Planets Mod loads.
  const html = outerPlanets ? use(loadOuterMarkup()) : markup;

  useEffect(() => {
    const svg = ref.current?.querySelector('svg');
    if (svg) {
      applyHighlight(svg, mapHighlight(trip, step));
    }
  }, [trip, step, html]);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={
        outerPlanets
          ? 'Δv map of the Kerbol system, with the Outer Planets Mod'
          : 'Δv map of the Kerbol system'
      }
      dangerouslySetInnerHTML={html}
      className={`dv-map-art [&_svg]:block [&_svg]:h-auto [&_svg]:w-full ${className ?? ''}`}
    />
  );
}
