import type { Trip } from '../lib/planner';

type Option = 'takeOff' | 'landing' | 'aerobraking' | 'return';

const OPTIONS: { option: Option; label: string }[] = [
  // Off, the trip starts from low orbit, like a ship already up there.
  { option: 'takeOff', label: 'Take-off' },
  { option: 'aerobraking', label: 'Aerobraking' },
  { option: 'landing', label: 'Landing' },
  { option: 'return', label: 'Return' },
];

interface TripOptionsProps {
  trip: Trip;
  /** Options that make no sense for this trip, like landing on Jool:
   * shown off, though the choice is kept for the next trip. */
  disabled: readonly Option[];
  onChange: (option: Option, checked: boolean) => void;
}

export function TripOptions({ trip, disabled, onChange }: TripOptionsProps) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-sm leading-6 font-semibold text-ink-soft">
        Options
      </legend>
      {/* Equal columns on mobile, two rows of two when narrow; one centred
          row beside the map, a bit smaller in its narrow panel. */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:flex md:justify-center md:gap-1.5 lg:gap-2">
        {OPTIONS.map(({ option, label }) => {
          const off = disabled.includes(option);
          return (
            // A toggle button look; the checkbox stays, for keyboards and screen readers.
            <label
              key={option}
              className="relative flex cursor-pointer items-center justify-center rounded-lg border border-line bg-surface px-2 py-2 font-semibold whitespace-nowrap transition select-none max-[359px]:text-sm hover:border-ink-soft has-checked:border-thrust has-checked:bg-thrust has-checked:text-thrust-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-thrust has-disabled:cursor-not-allowed has-disabled:opacity-50 has-disabled:hover:border-line md:px-2.5 md:text-sm lg:px-3 lg:text-base"
            >
              <input
                type="checkbox"
                checked={trip[option] && !off}
                disabled={off}
                onChange={(event) => onChange(option, event.target.checked)}
                // Invisible, over the whole button: clicks land on the checkbox itself.
                className="absolute inset-0 m-0 cursor-[inherit] appearance-none opacity-0"
              />
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
