import { useId } from 'react';

interface OuterPlanetsToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const HINT = 'Adds Sarnus, Urlum, Neidon, Plock and their moons';

/** Turns the Outer Planets Mod on or off: its bodies and its map. */
export function OuterPlanetsToggle({
  checked,
  onChange,
  className,
}: OuterPlanetsToggleProps) {
  const hintId = useId();
  return (
    <>
      <label
        title={HINT}
        className={`flex h-6 cursor-pointer items-center gap-2 text-sm font-semibold text-ink-soft transition select-none hover:text-ink has-checked:text-ink ${className ?? ''}`}
      >
        <img src="/planets/sarnus.svg" alt="" className="size-5 shrink-0" />
        <span className="mr-1">Outer Planets Mod</span>
        <input
          type="checkbox"
          role="switch"
          aria-describedby={hintId}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="relative h-6 w-10 shrink-0 cursor-pointer appearance-none rounded-full bg-surface ring-[1.5px] ring-ink-soft transition ring-inset before:absolute before:top-1 before:left-1 before:size-4 before:rounded-full before:bg-ink-soft before:transition checked:bg-thrust checked:ring-thrust checked:before:translate-x-4 checked:before:bg-thrust-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thrust motion-reduce:transition-none motion-reduce:before:transition-none"
        />
      </label>
      {/* The hint of the title, for screen readers too; out of the label,
          which would add it to the name of the switch. */}
      <span id={hintId} hidden>
        {HINT}
      </span>
    </>
  );
}
