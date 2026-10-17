import { createFileRoute } from '@tanstack/react-router';
import {
  ArrowDownUp,
  MapIcon,
  Maximize2,
  RotateCcw,
  Telescope,
} from 'lucide-react';
import { lazy, Suspense, useMemo, useState } from 'react';

import { BodyPicker } from '../components/BodyPicker';
import { StepList } from '../components/StepList';
import { TripOptions } from '../components/TripOptions';
import { useMediaQuery } from '../lib/media';
import { floatingBar, floatingButton } from '../lib/styles';
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

// Small screens only download the map once it is opened in full screen.
const DvMap = lazy(() => import('../components/DvMap'));
const MapDialog = lazy(() => import('../components/MapDialog'));

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
  const [mapOpen, setMapOpen] = useState(false);
  // Mounted on first open, so the map is only downloaded when needed.
  const [mapOpened, setMapOpened] = useState(false);

  function openMap() {
    setMapOpened(true);
    setMapOpen(true);
  }

  function update(next: Trip) {
    setTrip(next);
    setHovered(null);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,var(--map-width))_21rem] md:justify-center lg:grid-cols-[minmax(0,var(--map-width))_25rem] lg:gap-8">
      <div className="hidden md:block">
        {showMap && (
          <div className="sticky top-[calc(3.5rem+1px+1.25rem)]">
            <Suspense
              fallback={
                <div className="aspect-4/3 animate-pulse rounded-2xl bg-tint" />
              }
            >
              <DvMap trip={trip} step={hovered} />
            </Suspense>
            <button
              type="button"
              onClick={openMap}
              aria-label="Open the map in full screen"
              title="Full screen"
              className="absolute top-3 right-3 grid size-10 cursor-pointer place-items-center rounded-xl bg-surface/80 text-ink shadow-lg ring-1 ring-line backdrop-blur transition hover:bg-surface active:scale-90"
            >
              <Maximize2 aria-hidden className="size-5" />
            </button>
          </div>
        )}
      </div>

      <section aria-labelledby="planner-title" className="space-y-5">
        <div>
          <h1 id="planner-title" className="text-2xl font-bold tracking-tight">
            Plan your trip
          </h1>
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

      <div className={`${floatingBar} md:hidden`}>
        <button type="button" onClick={openMap} className={floatingButton}>
          <MapIcon aria-hidden className="size-5 text-thrust-text" />
          Map
        </button>
      </div>

      {mapOpened && (
        <Suspense fallback={null}>
          <MapDialog
            open={mapOpen}
            onClose={() => setMapOpen(false)}
            trip={trip}
            plan={plan}
          />
        </Suspense>
      )}
    </div>
  );
}
