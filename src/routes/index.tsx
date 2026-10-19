import { createFileRoute } from '@tanstack/react-router';
import {
  ArrowLeftRight,
  Calculator,
  MapIcon,
  Maximize2,
  RotateCcw,
  Telescope,
} from 'lucide-react';
import { lazy, Suspense, useMemo, useState } from 'react';

import { BodyPicker } from '../components/BodyPicker';
import { NotesDialog } from '../components/NotesDialog';
import { StepList } from '../components/StepList';
import { TripOptions } from '../components/TripOptions';
import { useMediaQuery } from '../lib/media';
import { floatingBar, floatingIconButton, mapButton } from '../lib/styles';
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
  const [notesOpen, setNotesOpen] = useState(false);

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
            <div className="absolute top-4 right-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={openMap}
                aria-label="Open the map in full screen"
                title="Full screen"
                className={floatingIconButton}
              >
                <Maximize2 aria-hidden className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => setNotesOpen(true)}
                aria-label="Reading the numbers"
                title="Reading the numbers"
                className={floatingIconButton}
              >
                <Calculator aria-hidden className="size-5" />
              </button>
            </div>
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
          <div className="grid grid-cols-2 gap-3">
            <BodyPicker
              label="From"
              placeholder="Select…"
              value={trip.from}
              onChange={(body) => update(withFrom(trip, body))}
            />
            <BodyPicker
              label="To"
              placeholder="Select…"
              value={trip.to}
              onChange={(body) => update(withTo(trip, body))}
              align="end"
            />
          </div>
          <div className="flex justify-center gap-1">
            <button
              type="button"
              onClick={() => update(reversed(trip))}
              aria-label="Reverse path"
              className={toolButton}
            >
              <ArrowLeftRight aria-hidden className="size-4" />
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
            <Telescope aria-hidden className="size-8" />
            Pick a destination to see the Δv of each step of the trip.
          </p>
        )}
      </section>

      <div className={`${floatingBar} md:hidden`}>
        <button type="button" onClick={openMap} className={mapButton}>
          <MapIcon aria-hidden className="size-5" />
          Map
        </button>
      </div>

      {mapOpened && (
        <Suspense fallback={null}>
          <MapDialog
            open={mapOpen}
            onClose={() => setMapOpen(false)}
            onReset={() => update(initialTrip)}
            onShowNotes={() => setNotesOpen(true)}
            trip={trip}
            plan={plan}
          />
        </Suspense>
      )}

      {/* Opened from the map, or over it in full screen. */}
      <NotesDialog open={notesOpen} onClose={() => setNotesOpen(false)} />
    </div>
  );
}
