import { createFileRoute } from '@tanstack/react-router';
import { ArrowDownUp, RotateCcw, Telescope } from 'lucide-react';
import { lazy, Suspense, useMemo, useState } from 'react';

import { BodyPicker } from '../components/BodyPicker';
import { StepList } from '../components/StepList';
import { TripOptions } from '../components/TripOptions';
import { useMediaQuery } from '../lib/media';
import {
  initialTrip,
  isKerbinTrip,
  planTrip,
  reversed,
  type Step,
  type Trip,
  withFrom,
  withTo,
} from '../lib/planner';

// The map is too detailed for small screens, which never download it.
const DvMap = lazy(() => import('../components/DvMap'));

export const Route = createFileRoute('/')({
  component: PlannerPage,
});

const toolButton =
  'flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-ink-soft transition hover:bg-tint hover:text-ink active:scale-95';

function PlannerPage() {
  const [trip, setTrip] = useState<Trip>(initialTrip);
  const [hovered, setHovered] = useState<Step | null>(null);
  const plan = useMemo(() => planTrip(trip), [trip]);
  const showMap = useMediaQuery('(min-width: 48rem)');
  const homeTrip = isKerbinTrip(trip);

  function update(next: Trip) {
    setTrip(next);
    setHovered(null);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_21rem] lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-8">
      <div className="hidden md:block">
        {showMap && (
          <div className="sticky top-20">
            <Suspense
              fallback={
                <div className="aspect-4/3 animate-pulse rounded-2xl border border-line bg-[#14111c]" />
              }
            >
              <DvMap trip={trip} step={hovered} />
            </Suspense>
          </div>
        )}
      </div>

      <section aria-labelledby="planner-title" className="space-y-5">
        <div>
          <h1 id="planner-title" className="text-2xl font-bold tracking-tight">
            Plan your trip
          </h1>
          <p className="mt-1 text-ink-soft">
            The Δv your rocket needs to travel the Kerbol system.
          </p>
        </div>

        <div className="space-y-2">
          <BodyPicker
            label="From"
            placeholder="Select your starting point"
            value={trip.from}
            onChange={(body) => update(withFrom(trip, body))}
          />
          <div className="flex justify-center gap-1">
            <button
              type="button"
              onClick={() => update(reversed(trip))}
              aria-label="Reverse path"
              className={toolButton}
            >
              <ArrowDownUp aria-hidden className="size-4" />
              Reverse
            </button>
            <button
              type="button"
              onClick={() => update(initialTrip)}
              aria-label="Reset path"
              className={toolButton}
            >
              <RotateCcw aria-hidden className="size-4" />
              Reset
            </button>
          </div>
          <BodyPicker
            label="To"
            placeholder="Select your destination"
            value={trip.to}
            onChange={(body) => update(withTo(trip, body))}
          />
        </div>

        <TripOptions
          trip={trip}
          disabled={homeTrip ? ['landing', 'return'] : []}
          onChange={(option, checked) => update({ ...trip, [option]: checked })}
        />

        {plan.steps.length > 0 ? (
          <StepList plan={plan} onHover={setHovered} />
        ) : (
          <p className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line px-4 py-8 text-center text-ink-soft">
            <Telescope aria-hidden className="size-8 text-thrust-text" />
            Pick a destination to see the Δv of each step of the trip.
          </p>
        )}
      </section>
    </div>
  );
}
