import { type AstroBody, bodiesOf } from './bodies';
import { outerPlanetsEnabled } from './outer-planets';
import { initialTrip, type Trip } from './planner';
import { readJson, writeJson } from './storage';

const STORAGE_KEY = 'ksp_trip';

/** What is kept of a trip: bodies by name, so the data can change freely. */
interface SavedTrip {
  from: string | null;
  to: string | null;
  landing: boolean;
  aerobraking: boolean;
  return: boolean;
}

/** Among the bodies shown: those of the Outer Planets Mod, if it is on. */
function bodyNamed(name: unknown): AstroBody | null {
  return (
    bodiesOf(outerPlanetsEnabled()).find((body) => body.name === name) ?? null
  );
}

function flag(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/** The trip of the last visit, or the initial one, so a reload keeps it. */
export function loadTrip(): Trip {
  const saved = readJson<Partial<SavedTrip>>(STORAGE_KEY);
  if (saved === null || typeof saved !== 'object') {
    return initialTrip;
  }
  return {
    from: saved.from === undefined ? initialTrip.from : bodyNamed(saved.from),
    to: bodyNamed(saved.to),
    landing: flag(saved.landing, initialTrip.landing),
    aerobraking: flag(saved.aerobraking, initialTrip.aerobraking),
    return: flag(saved.return, initialTrip.return),
  };
}

export function saveTrip(trip: Trip): void {
  writeJson(STORAGE_KEY, {
    from: trip.from?.name ?? null,
    to: trip.to?.name ?? null,
    landing: trip.landing,
    aerobraking: trip.aerobraking,
    return: trip.return,
  } satisfies SavedTrip);
}
