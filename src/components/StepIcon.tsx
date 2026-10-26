import { Flag, type LucideIcon, Orbit, Rocket, Undo2 } from 'lucide-react';

import type { StepType } from '../lib/planner';

const ICONS: Record<StepType, LucideIcon> = {
  takeOff: Rocket,
  landing: Rocket,
  transitToLowOrbit: Orbit,
  transitFromLowToLow: Orbit,
  transitToSOI: Orbit,
  transitFromSOIToLow: Orbit,
  transitFromLowToSOI: Orbit,
  transitToKeostat: Orbit,
  return: Undo2,
  total: Flag,
};

/** The icon of a step, in the accent colour. */
export function StepIcon({ type }: { type: StepType }) {
  const Icon = ICONS[type];
  return (
    <Icon
      aria-hidden
      className={`size-5 shrink-0 text-thrust-text ${
        // Coming down tail first, as rockets do.
        type === 'landing' ? '-rotate-90' : ''
      }`}
    />
  );
}
