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
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map(({ option, label }) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 font-medium transition select-none hover:border-ink-soft has-checked:border-thrust has-checked:bg-thrust-surface has-disabled:cursor-not-allowed has-disabled:opacity-50"
          >
            <input
              type="checkbox"
              checked={trip[option]}
              disabled={disabled.includes(option)}
              onChange={(event) => onChange(option, event.target.checked)}
              className="size-4 cursor-[inherit] accent-thrust"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
