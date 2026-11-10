interface OuterPlanetsToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

/** Turns the Outer Planets Mod on or off: its bodies and its map. */
export function OuterPlanetsToggle({
  checked,
  onChange,
  className,
}: OuterPlanetsToggleProps) {
  return (
    <label
      title="Adds Sarnus, Urlum, Neidon, Plock and their moons"
      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-surface py-2 pr-2.5 pl-2 font-semibold text-ink-soft transition select-none hover:border-ink-soft hover:text-ink has-checked:text-ink ${className ?? ''}`}
    >
      <img src="/planets/sarnus.svg" alt="" className="size-6 shrink-0" />
      <span className="flex-1">Outer Planets Mod</span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="relative h-6 w-10 shrink-0 cursor-pointer appearance-none rounded-full bg-surface ring-[1.5px] ring-ink-soft transition ring-inset before:absolute before:top-1 before:left-1 before:size-4 before:rounded-full before:bg-ink-soft before:transition checked:bg-thrust checked:ring-thrust checked:before:translate-x-4 checked:before:bg-thrust-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thrust motion-reduce:transition-none motion-reduce:before:transition-none"
      />
    </label>
  );
}
