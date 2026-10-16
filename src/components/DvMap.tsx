import { useEffect, useRef } from 'react';

import mapSvg from '../assets/dv-map.svg?raw';
import { applyHighlight, mapHighlight } from '../lib/map-highlight';
import type { Step, Trip } from '../lib/planner';

const markup = { __html: mapSvg };

interface DvMapProps {
  trip: Trip;
  step: Step | null;
}

/** The KSPedia Δv map, with the planned trip highlighted. */
export default function DvMap({ trip, step }: DvMapProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = ref.current?.querySelector('svg');
    if (svg) {
      applyHighlight(svg, mapHighlight(trip, step));
    }
  }, [trip, step]);

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Δv map of the Kerbol system"
      dangerouslySetInnerHTML={markup}
      className="overflow-hidden rounded-2xl border border-line bg-[#14111c] shadow-xl [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
    />
  );
}
