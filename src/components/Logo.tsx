import {
  CRAFT,
  LOGO_COLORS,
  ORBIT_BACK,
  ORBIT_FRONT,
  ORBIT_STROKE_WIDTH,
  ORBIT_TILT,
  PLANET,
} from '../lib/logo';

// Same mark as the favicon and PWA icons (scripts/generate-icons.mjs).
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={`size-8 shrink-0 ${className ?? ''}`}
    >
      <rect width="32" height="32" rx="7" fill={LOGO_COLORS.tile} />
      <g
        transform={ORBIT_TILT}
        fill="none"
        stroke={LOGO_COLORS.orbit}
        strokeWidth={ORBIT_STROKE_WIDTH}
        strokeLinecap="round"
      >
        <path d={ORBIT_BACK} opacity="0.55" />
        <circle {...PLANET} fill={LOGO_COLORS.planet} stroke="none" />
        <path d={ORBIT_FRONT} />
        <circle {...CRAFT} fill={LOGO_COLORS.craft} stroke="none" />
      </g>
    </svg>
  );
}
