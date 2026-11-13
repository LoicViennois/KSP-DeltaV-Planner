import {
  Ban,
  CloudDownload,
  type LucideIcon,
  Orbit,
  Rocket,
  Undo2,
} from 'lucide-react';

import type { Aerobraking, Trip } from '../lib/planner';
import { Capsule } from './CapsuleIcon';
import { Lander } from './LanderIcon';

type Option = 'takeOff' | 'landing' | 'return';

// The icons of the steps each option adds.
const OPTIONS: { option: Option; label: string; icon: LucideIcon }[] = [
  // Off, the trip starts from low orbit, like a ship already up there.
  { option: 'takeOff', label: 'Take-off', icon: Rocket },
  { option: 'landing', label: 'Landing', icon: Lander },
  { option: 'return', label: 'Return', icon: Undo2 },
];

// Each one includes the one before.
const AEROBRAKING: { level: Aerobraking; label: string; icon: LucideIcon }[] = [
  { level: 'off', label: 'Off', icon: Ban },
  { level: 'landing', label: 'Landing', icon: Capsule },
  { level: 'capture', label: 'Capture too', icon: Orbit },
];

interface TripOptionsProps {
  trip: Trip;
  /** Options that make no sense for this trip, like landing on Jool:
   * shown off, though the choice is kept for the next trip. */
  disabled: readonly Option[];
  onChange: (changes: Partial<Trip>) => void;
}

// A toggle button look; the input stays, for keyboards and screen readers.
const button =
  'relative flex cursor-pointer items-center justify-center gap-1.5 font-semibold whitespace-nowrap transition select-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-thrust has-disabled:cursor-not-allowed has-disabled:opacity-50';
// Invisible, over the whole button: clicks land on the input itself.
const input = 'absolute inset-0 m-0 cursor-[inherit] appearance-none opacity-0';
// In the accent colour, like the step icons, then in the button's ink.
const icon = 'size-4 shrink-0 text-thrust-text transition';

export function TripOptions({ trip, disabled, onChange }: TripOptionsProps) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-sm leading-6 font-semibold text-ink-soft">
        Options
      </legend>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ option, label, icon: Icon }) => {
          const off = disabled.includes(option);
          return (
            <label
              key={option}
              className={`${button} group rounded-lg border border-line bg-surface px-2 py-2 hover:border-ink-soft has-checked:border-thrust has-checked:bg-thrust has-checked:text-thrust-ink has-disabled:hover:border-line max-[359px]:gap-1 max-[359px]:px-1 max-[359px]:text-sm`}
            >
              <input
                type="checkbox"
                checked={trip[option] && !off}
                disabled={off}
                onChange={(event) =>
                  onChange({ [option]: event.target.checked })
                }
                className={input}
              />
              <Icon
                aria-hidden
                className={`${icon} group-has-checked:text-thrust-ink max-[359px]:size-3.5`}
              />
              {label}
            </label>
          );
        })}
      </div>

      <fieldset className="mt-3">
        <legend className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
          <CloudDownload aria-hidden className="size-4" />
          Aerobraking
        </legend>
        {/* Levels rather than two options: capturing in an atmosphere
            without landing through it would make little sense. */}
        <div className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface p-1">
          {AEROBRAKING.map(({ level, label, icon: Icon }) => (
            <label
              key={level}
              className={`${button} group rounded-lg px-1 py-1.5 text-sm text-ink-soft hover:text-ink has-checked:bg-thrust has-checked:text-thrust-ink`}
            >
              <input
                type="radio"
                name="aerobraking"
                value={level}
                checked={trip.aerobraking === level}
                onChange={() => onChange({ aerobraking: level })}
                className={input}
              />
              {/* Left out on the narrowest screens, for the labels. */}
              <Icon
                aria-hidden
                className={`${icon} group-has-checked:text-thrust-ink max-[359px]:hidden`}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
    </fieldset>
  );
}
