import { ArrowLeftRight, ArrowRight } from 'lucide-react';
import { useState } from 'react';

import {
  type AstroBody,
  kerbin,
  type Planet,
  parentOf,
  planets,
} from '../lib/bodies';
import { reversed, type Trip, withFrom, withTo } from '../lib/planner';

type End = 'from' | 'to';

const END_LABELS: Record<End, string> = { from: 'From', to: 'To' };
const END_NAMES: Record<End, string> = {
  from: 'starting point',
  to: 'destination',
};

// Out from Kerbol, each about as big as it is next to the others.
const ORDER = [
  'Kerbol',
  'Moho',
  'Eve',
  'Kerbin',
  'Duna',
  'Dres',
  'Jool',
  'Eeloo',
];
const SIZES: Record<string, string> = {
  Kerbol: 'size-8 sm:size-10',
  Moho: 'size-5',
  Eve: 'size-7 sm:size-8',
  Kerbin: 'size-7',
  Duna: 'size-6',
  Dres: 'size-4',
  Jool: 'size-8 sm:size-10',
  Eeloo: 'size-5',
};
const system = ORDER.map((name) => planets.find((p) => p.name === name)).filter(
  (p) => p != null,
);

function planetOf(body: AstroBody): Planet {
  return body.isPlanet ? body : parentOf(body);
}

interface SystemPickerProps {
  trip: Trip;
  onChange: (trip: Trip) => void;
}

/**
 * The trip ends over the whole Kerbol system: pick the end to set, then tap
 * a planet, and one of its moons to go further.
 */
export function SystemPicker({ trip, onChange }: SystemPickerProps) {
  const [active, setActive] = useState<End>('to');
  // The planet whose moons are shown, and the end a moon would set.
  const [browsing, setBrowsing] = useState<{ planet: Planet; end: End }>(
    () => ({ planet: planetOf(trip.to ?? trip.from ?? kerbin), end: 'to' }),
  );

  function set(end: End, body: AstroBody) {
    onChange(end === 'from' ? withFrom(trip, body) : withTo(trip, body));
  }

  function chooseEnd(end: End) {
    setActive(end);
    const body = trip[end];
    setBrowsing({ planet: body ? planetOf(body) : browsing.planet, end });
  }

  function pickPlanet(planet: Planet) {
    set(active, planet);
    setBrowsing({ planet, end: active });
  }

  function reverse() {
    onChange(reversed(trip));
    const end = active === 'from' ? 'to' : 'from';
    setActive(end);
    setBrowsing({ ...browsing, end: browsing.end === 'from' ? 'to' : 'from' });
  }

  /** How a body is marked: chosen itself, or through one of its moons. */
  function marks(body: AstroBody) {
    const mark = (end: End) => {
      const value = trip[end];
      if (!value) {
        return null;
      }
      if (value.name === body.name) {
        return 'exact';
      }
      return body.isPlanet && planetOf(value).name === body.name
        ? 'moon'
        : null;
    };
    return { from: mark('from'), to: mark('to') };
  }

  function bodyClass(body: AstroBody) {
    const { from, to } = marks(body);
    return [
      'grid shrink-0 place-items-center rounded-full border-2 p-0.5 transition',
      to ? 'border-thrust' : 'border-transparent',
      to === 'moon' ? 'border-dashed' : '',
      from ? 'outline-2 outline-offset-2 outline-ink-soft' : '',
      from === 'moon' ? 'outline-dashed' : '',
    ].join(' ');
  }

  function status(body: AstroBody) {
    const { from, to } = marks(body);
    return [
      from === 'exact' && 'starting point',
      to === 'exact' && 'destination',
    ]
      .filter(Boolean)
      .join(' and ');
  }

  const moons = browsing.planet.satellites;

  return (
    <div className="space-y-3">
      <div className="relative grid grid-cols-2 rounded-xl border border-line bg-surface">
        {(['from', 'to'] as const).map((end) => {
          const value = trip[end];
          return (
            <button
              key={end}
              type="button"
              aria-pressed={active === end}
              onClick={() => chooseEnd(end)}
              className={`flex h-16 cursor-pointer items-center gap-2 text-left transition hover:bg-tint focus-visible:-outline-offset-2 aria-pressed:bg-thrust-surface ${
                end === 'from'
                  ? 'rounded-l-xl pr-5 pl-3'
                  : 'rounded-r-xl pr-3 pl-5'
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
                <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                  {END_LABELS[end]}
                </span>
                <span
                  data-testid="body-name"
                  className={`truncate font-semibold ${value ? 'text-lg' : 'text-base text-ink-soft'}`}
                >
                  {value?.name ?? 'Select…'}
                </span>
              </span>
            </button>
          );
        })}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-line"
        />
        <button
          type="button"
          onClick={reverse}
          aria-label="Reverse path"
          title="Reverse"
          className="group absolute top-1/2 left-1/2 grid size-8 -translate-1/2 cursor-pointer place-items-center rounded-full border border-line bg-surface text-ink-soft transition hover:border-thrust hover:text-ink active:scale-90"
        >
          <ArrowRight
            aria-hidden
            className="size-4 group-hover:hidden group-focus-visible:hidden"
          />
          <ArrowLeftRight
            aria-hidden
            className="hidden size-4 group-hover:block group-focus-visible:block"
          />
        </button>
      </div>

      <div className="rounded-xl border border-line bg-surface px-2 py-3 sm:px-3">
        <p
          aria-live="polite"
          className="mb-3 px-1 text-sm text-ink-soft sm:px-0"
        >
          Tap a body to set the{' '}
          <span className="font-semibold text-ink">{END_NAMES[active]}</span>.
        </p>
        <ul aria-label="Planets" className="flex items-end justify-between">
          {system.map((planet) => {
            const state = status(planet);
            return (
              <li key={planet.name}>
                <button
                  type="button"
                  onClick={() => pickPlanet(planet)}
                  aria-label={state ? `${planet.name}, ${state}` : planet.name}
                  className="flex cursor-pointer flex-col items-center gap-1 rounded-lg py-1 transition hover:bg-tint sm:px-0.5"
                >
                  <span className={bodyClass(planet)}>
                    <img
                      src={planet.imageUrl}
                      alt=""
                      className={`max-w-none ${SIZES[planet.name]}`}
                    />
                  </span>
                  <span
                    className={`text-[0.65rem] sm:text-[0.7rem] ${marks(planet).from || marks(planet).to ? 'font-bold text-ink' : 'text-ink-soft'}`}
                  >
                    {planet.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 border-t border-line pt-3">
          {moons.length > 0 ? (
            <ul
              aria-label={`Moons of ${browsing.planet.name}`}
              className="flex flex-wrap items-end justify-center gap-1"
            >
              {moons.map((moon) => {
                const state = status(moon);
                return (
                  <li key={moon.name}>
                    <button
                      type="button"
                      onClick={() => set(browsing.end, moon)}
                      aria-label={state ? `${moon.name}, ${state}` : moon.name}
                      className="flex cursor-pointer flex-col items-center gap-1 rounded-lg px-1.5 py-1 transition hover:bg-tint"
                    >
                      <span className={bodyClass(moon)}>
                        <img src={moon.imageUrl} alt="" className="size-6" />
                      </span>
                      <span
                        className={`text-[0.7rem] ${state ? 'font-bold text-ink' : 'text-ink-soft'}`}
                      >
                        {moon.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-3 text-center text-sm text-ink-soft">
              {browsing.planet.name} has no moons.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
