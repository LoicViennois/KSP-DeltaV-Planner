import { Calculator, RotateCcw, X } from 'lucide-react';
import { useMemo, useState } from 'react';

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
  /** The step zoomed on, shared with the panel: the total by default. */
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
                  aria-label="Show a step on the map"
                  // A row on phones, a column under the buttons on wider screens.
                  className="pointer-events-auto flex gap-2 overflow-x-auto px-4 py-1 justify-center-safe [mask-image:linear-gradient(to_right,transparent,#000_1rem,#000_calc(100%-1rem),transparent)] [scrollbar-width:none] md:max-h-[calc(100dvh-20rem)] md:flex-col md:items-end md:justify-start md:overflow-y-auto md:px-1 md:[mask-image:none]"
                >
                  {steps.map((s) => (
                    <li key={s.type} className="shrink-0">
                      <button
                        type="button"
                        aria-pressed={s.type === selected}
                        aria-label={`${shortLabel(s)}, ${amount(s)} m/s`}
                        title={`${shortLabel(s)}, ${amount(s)} m/s`}
                        onClick={(event) => {
                          // Tapped again, the step gives way to the total.
                          onSelect(s.type === selected ? 'total' : s.type);
                          // Bring a step cut by the edge of the row in full.
                          event.currentTarget.scrollIntoView({
                            behavior: matchMedia(
                              '(prefers-reduced-motion: reduce)',
                            ).matches
                              ? 'auto'
                              : 'smooth',
                            block: 'nearest',
                            inline: 'center',
                          });
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
