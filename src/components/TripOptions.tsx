import type { Trip } from '../lib/planner';

type Option = 'landing' | 'aerobraking' | 'return';

const OPTIONS: { option: Option; label: string }[] = [
  { option: 'landing', label: 'Landing' },
  { option: 'aerobraking', label: 'Aerobraking' },
  { option: 'return', label: 'Return' },
];

interface TripOptionsProps {
  trip: Trip;
  /** Options that make no sense for this trip, like landing back home. */
  disabled: readonly Option[];
  onChange: (option: Option, checked: boolean) => void;
}

export function TripOptions({ trip, disabled, onChange }: TripOptionsProps) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold text-ink-soft">
        Options
      </legend>
      {/* One row: equal columns on mobile, centred on wider screens. */}
      <div className="grid grid-cols-3 gap-2 md:flex md:justify-center">
        {OPTIONS.map(({ option, label }) => (
          // A toggle button look; the checkbox stays, for keyboards and screen readers.
          <label
            key={option}
            className="relative flex cursor-pointer items-center justify-center rounded-lg border border-line bg-surface px-2 py-2 font-semibold transition select-none max-[359px]:text-sm hover:border-ink-soft has-checked:border-thrust has-checked:bg-thrust has-checked:text-thrust-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-thrust has-disabled:cursor-not-allowed has-disabled:opacity-50 has-disabled:hover:border-line md:px-4"
          >
            <input
              type="checkbox"
              checked={trip[option]}
              disabled={disabled.includes(option)}
              onChange={(event) => onChange(option, event.target.checked)}
              // Invisible, over the whole button: clicks land on the checkbox itself.
              className="absolute inset-0 m-0 cursor-[inherit] appearance-none opacity-0"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
