import { Calculator, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { mapHighlight } from '../lib/map-highlight';
import type { Step, StepType, Trip, TripPlan } from '../lib/planner';
import { floatingIconButton } from '../lib/styles';
import { MapViewer } from './MapViewer';
import { Modal } from './Modal';
import { StepIcon } from './StepIcon';

const SHORT_LABELS: Record<StepType, string> = {
  takeOff: 'Take off',
  transitToLowOrbit: 'Low orbit',
  transitFromLowToLow: 'Low orbit',
  transitToSOI: 'SOI',
  transitFromSOIToLow: 'Low orbit',
  transitFromLowToSOI: 'SOI',
  transitToKeostat: 'Keostationary',
  landing: 'Landing',
  return: 'Return',
  total: 'Total',
};

function shortLabel(step: Step): string {
  const body = step.type === 'takeOff' ? step.from : step.to;
  const label = SHORT_LABELS[step.type];
  return body && step.type !== 'return' && step.type !== 'transitToKeostat'
    ? `${label} · ${body.name}`
    : label;
}

/** The faded edges of the list of steps, which a step is brought out of. */
const EDGE = 16;
/** How much of the next step shows past a step, to hint at the rest. */
const PEEK = 40;

/**
 * Scrolls the list of steps just enough to show a step in full, out of its
 * faded edges, with a bit of the steps around it. Only the list scrolls:
 * scrollIntoView would also scroll the map and the dialog around it.
 */
function reveal(step: HTMLElement, smooth = true) {
  const item = step.closest('li');
  const list = item?.parentElement;
  if (!item || !list) {
    return;
  }
  // Where the list should scroll to show [start, end] in its view.
  const to = (
    scroll: number,
    view: number,
    start: number,
    end: number,
    before: number,
    after: number,
  ) => {
    // The neighbours only show when the step itself still fits.
    const room = end - start + before + after + 2 * EDGE <= view;
    const from = start - EDGE - (room ? before : 0);
    const until = end + EDGE + (room ? after : 0);
    return from < scroll ? from : until > scroll + view ? until - view : scroll;
  };
  const prev = item.previousElementSibling ? PEEK : 0;
  const next = item.nextElementSibling ? PEEK : 0;
  list.scrollTo({
    left: to(
      list.scrollLeft,
      list.clientWidth,
      item.offsetLeft,
      item.offsetLeft + item.offsetWidth,
      prev,
      next,
    ),
    top: to(
      list.scrollTop,
      list.clientHeight,
      item.offsetTop,
      item.offsetTop + item.offsetHeight,
      prev,
      next,
    ),
    behavior:
      smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'smooth'
        : 'auto',
  });
}

/** The Δv of a step, without its unit. */
function amount(step: Step): string {
  return step.dvMax != null && step.dvMax !== step.dv
    ? `${step.dv}–${step.dvMax}`
    : `${step.dv}`;
}

interface MapDialogProps {
  open: boolean;
  onClose: () => void;
  /** Empties the trip, as the reset button of the panel does. */
  onReset: () => void;
  onShowNotes: () => void;
  trip: Trip;
  plan: TripPlan;
  /**
   * The step picked, shared with the panel: the total by default, and again
   * with every new trip.
   */
  selected: StepType;
  onSelect: (type: StepType) => void;
}

/** The Δv map in full screen, where tapping a step zooms on it. */
export default function MapDialog({
  open,
  onClose,
  onReset,
  onShowNotes,
  trip,
  plan,
  selected,
  onSelect,
}: MapDialogProps) {
  // Bumped to zoom back out, even when the trip was already empty.
  const [resets, setResets] = useState(0);
  const steps = plan.total ? [...plan.steps, plan.total] : plan.steps;
  const step = steps.find((s) => s.type === selected) ?? null;
  const focus = useMemo(() => mapHighlight(trip, step), [trip, step]);
  const listRef = useRef<HTMLUListElement>(null);

  // Opened again, the map shows the step still picked in full; the total,
  // picked by default, leaves the row at its start.
  useEffect(() => {
    if (!open) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      const picked = listRef.current?.querySelector<HTMLElement>(
        '[aria-pressed="true"]',
      );
      if (picked && picked.dataset.step !== 'total') {
        reveal(picked, false);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Δv map"
      // The map takes the whole screen, and closes from its own buttons.
      hideHeader
      className="h-dvh max-h-none w-screen max-w-none flex-col rounded-none border-0 open:flex"
      bodyClassName="relative min-h-0 flex-1"
    >
      {open && (
        <MapViewer
          trip={trip}
          step={step}
          focus={focus}
          resets={resets}
          controls={
            <>
              {/* Reset stays in the panel on wide screens. */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setResets((n) => n + 1);
                    onReset();
                  }}
                  aria-label="Reset path"
                  title="Reset"
                  className={`${floatingIconButton} md:hidden`}
                >
                  <RotateCcw aria-hidden className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  title="Close"
                  className={floatingIconButton}
                >
                  <X aria-hidden className="size-5" />
                </button>
              </div>
              <button
                type="button"
                onClick={onShowNotes}
                aria-label="Reading the numbers"
                title="Reading the numbers"
                className={floatingIconButton}
              >
                <Calculator aria-hidden className="size-5" />
              </button>
            </>
          }
          footer={
            <div className="pb-[max(1rem,env(safe-area-inset-bottom))]">
              {steps.length > 0 ? (
                <ul
                  ref={listRef}
                  aria-label="Show a step on the map"
                  // A row on phones, a column under the buttons on wider screens.
                  className="pointer-events-auto relative flex gap-2 overflow-x-auto px-4 py-1 justify-center-safe [mask-image:linear-gradient(to_right,transparent,#000_1rem,#000_calc(100%-1rem),transparent)] [scrollbar-width:none] md:max-h-[calc(100dvh-20rem)] md:flex-col md:items-end md:justify-start md:overflow-y-auto md:px-1 md:[mask-image:none]"
                >
                  {steps.map((s) => (
                    <li key={s.type} className="shrink-0">
                      <button
                        type="button"
                        aria-pressed={s.type === selected}
                        data-step={s.type}
                        aria-label={`${shortLabel(s)}, ${amount(s)} m/s`}
                        title={`${shortLabel(s)}, ${amount(s)} m/s`}
                        onClick={(event) => {
                          // Picked again, the step gives way to the total.
                          onSelect(s.type === selected ? 'total' : s.type);
                          reveal(event.currentTarget);
                        }}
                        className={`flex h-10 cursor-pointer items-center gap-1.5 rounded-full bg-surface/90 pr-3.5 pl-3 font-digits text-sm whitespace-nowrap shadow-lg ring-1 ring-line backdrop-blur transition hover:bg-surface aria-pressed:bg-thrust-surface aria-pressed:ring-2 aria-pressed:ring-thrust ${s.type === 'total' ? 'font-bold' : 'font-semibold'}`}
                      >
                        <StepIcon type={s.type} />
                        {amount(s)}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mx-4 w-fit rounded-full bg-surface/90 px-4 py-2 text-sm text-ink-soft shadow-lg ring-1 ring-line backdrop-blur md:mx-1">
                  Pick a destination to see your trip on the map.
                </p>
              )}
            </div>
          }
        />
      )}
    </Modal>
  );
}
