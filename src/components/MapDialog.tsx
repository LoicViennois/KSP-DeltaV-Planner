import { X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { mapHighlight } from '../lib/map-highlight';
import type { Step, StepType, Trip, TripPlan } from '../lib/planner';
import { floatingButton } from '../lib/styles';
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
  trip: Trip;
  plan: TripPlan;
}

/** The Δv map in full screen, where tapping a step zooms on it. */
export default function MapDialog({
  open,
  onClose,
  trip,
  plan,
}: MapDialogProps) {
  const [selected, setSelected] = useState<StepType | null>(null);
  const steps = plan.total ? [...plan.steps, plan.total] : plan.steps;
  const step = steps.find((s) => s.type === selected) ?? null;
  const focus = useMemo(() => mapHighlight(trip, step), [trip, step]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Δv map"
      className="h-dvh max-h-none w-screen max-w-none flex-col rounded-none border-0 open:flex"
      // The same height and spacing as the page header; on phones, the map
      // takes the whole screen and closes from the floating button.
      headerClassName="h-[calc(3.5rem+1px)] shrink-0 border-b border-line px-4 max-md:hidden lg:px-6"
      titleClassName="text-lg font-semibold tracking-tight"
      bodyClassName="relative min-h-0 flex-1"
    >
      {open && (
        <MapViewer
          trip={trip}
          step={step}
          focus={focus}
          aside={
            steps.length > 0 && (
              <ul
                aria-label="Show a step on the map"
                className="-m-1 flex min-h-0 flex-col items-end gap-2 overflow-y-auto p-1 pt-2"
              >
                {steps.map((s) => (
                  <li key={s.type}>
                    <button
                      type="button"
                      aria-pressed={s.type === selected}
                      aria-label={`${shortLabel(s)}, ${amount(s)} m/s`}
                      title={`${shortLabel(s)}, ${amount(s)} m/s`}
                      onClick={() =>
                        setSelected(s.type === selected ? null : s.type)
                      }
                      className={`flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-surface/90 pr-3 pl-2.5 font-digits text-sm whitespace-nowrap shadow-lg ring-1 ring-line backdrop-blur transition hover:bg-surface aria-pressed:bg-thrust-surface aria-pressed:ring-2 aria-pressed:ring-thrust ${s.type === 'total' ? 'font-bold' : 'font-semibold'}`}
                    >
                      <StepIcon type={s.type} />
                      {amount(s)}
                    </button>
                  </li>
                ))}
              </ul>
            )
          }
        />
      )}
      {steps.length === 0 && (
        <p className="absolute top-3 left-3 max-w-[calc(100%-5.5rem)] rounded-xl bg-surface/90 px-3 py-2 text-sm text-ink-soft shadow-lg ring-1 ring-line backdrop-blur">
          Pick a destination to see your trip on the map.
        </p>
      )}
      <button
        type="button"
        onClick={onClose}
        className={`${floatingButton} md:hidden`}
      >
        <X aria-hidden className="size-5 text-thrust-text" />
        Close
      </button>
    </Modal>
  );
}
