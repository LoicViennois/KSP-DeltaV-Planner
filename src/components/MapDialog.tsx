import { useMemo, useState } from 'react';

import { mapHighlight } from '../lib/map-highlight';
import type { Step, StepType, Trip, TripPlan } from '../lib/planner';
import { MapViewer } from './MapViewer';
import { Modal } from './Modal';

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

function dv(step: Step): string {
  return step.dvMax != null && step.dvMax !== step.dv
    ? `${step.dv} – ${step.dvMax} m/s`
    : `${step.dv} m/s`;
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
      // The same height and spacing as the page header.
      headerClassName="h-[calc(3.5rem+1px)] shrink-0 border-b border-line px-4 lg:px-6"
      titleClassName="text-lg font-semibold tracking-tight"
      bodyClassName="flex min-h-0 flex-1 flex-col"
    >
      <div className="min-h-0 flex-1">
        {open && <MapViewer trip={trip} step={step} focus={focus} />}
      </div>
      <div className="border-t border-line bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {steps.length > 0 ? (
          <ul
            aria-label="Show a step on the map"
            className="flex gap-2 overflow-x-auto pb-1"
          >
            {steps.map((s) => (
              <li key={s.type} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={s.type === selected}
                  onClick={() =>
                    setSelected(s.type === selected ? null : s.type)
                  }
                  className={`flex cursor-pointer flex-col items-start rounded-lg border px-3 py-1.5 text-left text-sm transition aria-pressed:border-thrust aria-pressed:bg-thrust-surface ${
                    s.type === 'total'
                      ? 'border-thrust font-bold'
                      : 'border-line hover:border-ink-soft'
                  }`}
                >
                  <span className="font-semibold whitespace-nowrap">
                    {shortLabel(s)}
                  </span>
                  <span className="font-digits text-xs whitespace-nowrap text-ink-soft">
                    {dv(s)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">
            Pick a destination to see your trip on the map.
          </p>
        )}
      </div>
    </Modal>
  );
}
