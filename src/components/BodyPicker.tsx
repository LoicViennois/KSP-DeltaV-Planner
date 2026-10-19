import { CornerDownRight } from 'lucide-react';
import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

import { type AstroBody, bodies } from '../lib/bodies';

interface BodyPickerProps {
  label: string;
  placeholder: string;
  value: AstroBody | null;
  onChange: (body: AstroBody) => void;
  /** The half of the trip card the field takes, which its list lines up with. */
  side: 'start' | 'end';
}

/** Select-only combobox (WAI-ARIA APG pattern): focus stays on the button. */
export function BodyPicker({
  label,
  placeholder,
  value,
  onChange,
  side,
}: BodyPickerProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: '', at: 0 });
  const id = useId();
  const labelId = `${id}-label`;
  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const selectedIndex = value
    ? bodies.findIndex((body) => body.name === value.name)
    : -1;

  function show() {
    setActive(Math.max(selectedIndex, 0));
    setOpen(true);
  }

  function choose(index: number) {
    const body = bodies[index];
    if (body) {
      onChange(body);
    }
    setOpen(false);
  }

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, active]);

  function findByTyping(key: string): number {
    const now = Date.now();
    const state = typeahead.current;
    state.text = now - state.at < 700 ? state.text + key : key;
    state.at = now;
    const prefix = state.text.toLowerCase();
    return bodies.findIndex((body) =>
      body.name.toLowerCase().startsWith(prefix),
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = bodies.length - 1;
    const moves: Record<string, number> = {
      ArrowDown: Math.min(active + 1, last),
      ArrowUp: Math.max(active - 1, 0),
      Home: 0,
      End: last,
      PageDown: Math.min(active + 10, last),
      PageUp: Math.max(active - 10, 0),
    };

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        show();
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        show();
        setActive(moves[event.key] ?? 0);
      }
      return;
    }

    if (event.key in moves) {
      event.preventDefault();
      setActive(moves[event.key] ?? active);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(active);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Tab') {
      choose(active);
    } else if (event.key.length === 1 && /\S/.test(event.key)) {
      const match = findByTyping(event.key);
      if (match >= 0) {
        setActive(match);
      }
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        role="combobox"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(active) : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        className={`flex h-16 w-full cursor-pointer items-center gap-2 text-left transition hover:bg-tint focus-visible:-outline-offset-2 aria-expanded:bg-tint ${
          // Room for the reverse button, on the line between the two fields.
          side === 'start' ? 'rounded-l-xl pr-5 pl-3' : 'rounded-r-xl pr-3 pl-5'
        }`}
      >
        {value ? (
          <img src={value.imageUrl} alt="" className="size-8 shrink-0" />
        ) : (
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-full border border-dashed border-ink-soft text-sm text-ink-soft"
          >
            ?
          </span>
        )}
        <span className="flex min-w-0 flex-col leading-tight">
          <span
            id={labelId}
            className="text-xs font-semibold tracking-wide text-ink-soft uppercase"
          >
            {label}
          </span>
          <span
            data-testid="body-name"
            className={`truncate text-lg font-semibold ${value ? '' : 'text-ink-soft'}`}
          >
            {value?.name ?? placeholder}
          </span>
        </span>
      </button>
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-labelledby={labelId}
        hidden={!open}
        className={`absolute top-full z-30 mt-2 max-h-80 w-max min-w-full ${side === 'end' ? 'right-0' : 'left-0'} animate-fade-in overflow-y-auto overscroll-contain rounded-xl border border-line bg-surface p-1.5 shadow-2xl`}
      >
        {bodies.map((body, index) => (
          <li
            key={body.name}
            id={optionId(index)}
            role="option"
            aria-selected={index === selectedIndex}
            // Keep the focus on the combobox.
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => choose(index)}
            onPointerMove={() => setActive(index)}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg py-1.5 pr-2 ${
              body.isPlanet ? 'pl-2' : 'pl-5'
            } ${index === active ? 'bg-tint' : ''} aria-selected:font-semibold aria-selected:text-thrust-text`}
          >
            {!body.isPlanet && (
              <CornerDownRight aria-hidden className="size-4 text-ink-soft" />
            )}
            <img
              src={body.imageUrl}
              alt=""
              loading="lazy"
              className={body.isPlanet ? 'size-8' : 'size-6'}
            />
            {body.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
