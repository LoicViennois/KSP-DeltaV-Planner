import {
  Ban,
  CloudDownload,
  Flag,
  type LucideIcon,
  Orbit,
  Rocket,
  Undo2,
} from 'lucide-react';
import type { ReactNode } from 'react';

import type { AstroBody } from '../lib/bodies';
import type { Step, StepType, TripPlan } from '../lib/planner';

function Body({ body }: { body?: AstroBody }) {
  if (!body) {
    return null;
  }
  return (
    <strong className="inline-flex items-baseline gap-1 font-semibold whitespace-nowrap text-ink">
      <img
        src={body.imageUrl}
        alt=""
        className="size-4 self-center"
        loading="lazy"
      />
      {body.name}
    </strong>
  );
}

const ICONS: Record<StepType, LucideIcon> = {
  takeOff: Rocket,
  landing: Rocket,
  transitToLowOrbit: Orbit,
  transitFromLowToLow: Orbit,
  transitToSOI: Orbit,
  transitFromSOIToLow: Orbit,
  transitFromLowToSOI: Orbit,
  transitToKeostat: Orbit,
  return: Undo2,
  total: Flag,
};

function message({ type, from, to }: Step): ReactNode {
  const f = <Body body={from} />;
  const t = <Body body={to} />;
  switch (type) {
    case 'takeOff':
      return <>Take off from {f}</>;
    case 'transitToLowOrbit':
      return <>Transit to {t} low orbit</>;
    case 'transitFromLowToLow':
      return (
        <>
          Transit from {f} low orbit to {t} low orbit
        </>
      );
    case 'transitToSOI':
      return <>Transit to {t} SOI</>;
    case 'transitFromSOIToLow':
      return (
        <>
          Transit from {f} SOI to {t} low orbit
        </>
      );
    case 'transitFromLowToSOI':
      return (
        <>
          Transit from {f} low orbit to {t} SOI
        </>
      );
    case 'transitToKeostat':
      return (
        <>
          Transit to{' '}
          <strong className="font-semibold text-ink">Keostationary</strong>{' '}
          orbit
        </>
      );
    case 'landing':
      return <>Landing on {t}</>;
    case 'return':
      return (
        <>
          Return trip from {f} to {t}
        </>
      );
    case 'total':
      return 'Total';
  }
}

function DvValue({ step, total }: { step: Step; total?: boolean }) {
  const range = step.dvMax != null && step.dvMax !== step.dv;
  return (
    <span
      data-testid="dv"
      className={`shrink-0 rounded-lg px-2.5 py-1 font-digits text-sm font-semibold whitespace-nowrap ${
        total ? 'bg-thrust text-thrust-ink' : 'bg-tint text-ink'
      }`}
    >
      {range ? `${step.dv} – ${step.dvMax}` : step.dv} m/s
    </span>
  );
}

function LandingNote({ body }: { body: AstroBody }) {
  if (!body.hasAtmosphere) {
    return null;
  }
  return body.canLand ? (
    <span className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-soft">
      <CloudDownload aria-hidden className="size-4" />
      Aerobraking is possible
    </span>
  ) : (
    <span className="mt-0.5 flex items-center gap-1.5 text-sm text-alert">
      <Ban aria-hidden className="size-4" />
      Landing here might not be a good idea…
    </span>
  );
}

interface StepListProps {
  plan: TripPlan;
  onHover: (step: Step | null) => void;
}

/** The steps of a trip; hovering or focusing one highlights it on the map. */
export function StepList({ plan, onHover }: StepListProps) {
  const highlight = (step: Step) => ({
    tabIndex: 0,
    onMouseEnter: () => onHover(step),
    onMouseLeave: () => onHover(null),
    onFocus: () => onHover(step),
    onBlur: () => onHover(null),
  });

  return (
    <div className="space-y-2">
      <ol aria-label="Trip steps" className="space-y-2">
        {plan.steps.map((step, index) => {
          const Icon = ICONS[step.type];
          return (
            <li
              key={step.type}
              {...highlight(step)}
              style={{ animationDelay: `${index * 40}ms` }}
              className="flex animate-fade-in items-center gap-3 rounded-xl border border-line bg-surface p-3 transition hover:border-ink-soft"
            >
              <Icon
                aria-hidden
                className={`size-5 shrink-0 text-thrust-text ${
                  // Coming down tail first, as rockets do.
                  step.type === 'landing' ? '-rotate-90' : ''
                }`}
              />
              <span className="flex min-w-0 flex-1 flex-col text-ink-soft">
                <span>{message(step)}</span>
                {step.type === 'landing' && step.to && (
                  <LandingNote body={step.to} />
                )}
              </span>
              <DvValue step={step} />
            </li>
          );
        })}
      </ol>
      {plan.total && (
        <div
          {...highlight(plan.total)}
          data-testid="total"
          className="flex animate-fade-in items-center gap-3 rounded-xl border border-thrust bg-thrust-surface p-3"
        >
          <Flag aria-hidden className="size-5 shrink-0 text-thrust-text" />
          <span className="flex-1 text-lg font-bold">Total</span>
          <DvValue step={plan.total} total />
        </div>
      )}
    </div>
  );
}
