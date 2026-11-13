import { CloudDownload, Flag } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import type { AstroBody } from '../lib/bodies';
import type { Step, StepType, TripPlan } from '../lib/planner';
import { StepIcon } from './StepIcon';

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

const aerobrakingText = ({ type }: Step) =>
  `Aerobraking saves the ${type === 'landing' ? 'landing' : 'capture'} burn`;

/**
 * Whether the tooltip of a pill shows, meeting WCAG 1.4.13: on hover of the
 * pill or keyboard focus of its step, while the pointer moves onto the
 * tooltip, and until Escape dismisses it.
 */
function useTooltip(enabled: boolean) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const shown = enabled && (hovered || focused) && !dismissed;

  // The step around the pill takes the keyboard focus.
  useEffect(() => {
    const step = ref.current?.closest('button');
    if (!enabled || !step) {
      return;
    }
    // Each new hover or focus shows it again, after an Escape.
    const onFocus = () => {
      setFocused(step.matches(':focus-visible'));
      setDismissed(false);
    };
    const onBlur = () => setFocused(false);
    step.addEventListener('focus', onFocus);
    step.addEventListener('blur', onBlur);
    return () => {
      step.removeEventListener('focus', onFocus);
      step.removeEventListener('blur', onBlur);
    };
  }, [enabled]);

  useEffect(() => {
    if (!shown) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Only the tooltip goes, not the full screen map around it.
        event.preventDefault();
        setDismissed(true);
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [shown]);

  return {
    shown,
    // The tooltip is part of the pill, so hovering it keeps the pill hovered.
    target: {
      ref,
      onPointerEnter: () => {
        setHovered(true);
        setDismissed(false);
      },
      onPointerLeave: () => setHovered(false),
    },
  };
}

/**
 * The Δv of a step, with a mark when the atmosphere takes its burn over:
 * an icon only, so as not to make the step taller, explained by a tooltip
 * of our own, more legible than a title. Screen readers read the step's own
 * text: the tooltip is for the eyes only.
 */
function DvValue({ step, total }: { step: Step; total?: boolean }) {
  const range = step.dvMax != null && step.dvMax !== step.dv;
  const tooltip = useTooltip(step.aerobraked === true);
  return (
    <span
      {...tooltip.target}
      data-testid="dv"
      className={`relative flex shrink-0 items-center gap-2.5 rounded-lg px-2.5 py-1 font-digits text-sm font-semibold whitespace-nowrap ${
        // Tinted rather than filled, so as not to look like the green map
        // button on phones, and still seen on the picked row's own tint.
        total ? 'bg-thrust/12 text-thrust-text' : 'bg-tint text-ink'
      }`}
    >
      {step.aerobraked && (
        <CloudDownload aria-hidden className="size-4 text-thrust-text" />
      )}
      {range ? `${step.dv} – ${step.dvMax}` : step.dv} m/s
      {tooltip.shown && (
        // Above the pill, its right edge on the pill's. A transparent bridge,
        // as wide as the tooltip, fills the gap and the height of the pill,
        // so that the pointer never leaves them, even on a slant.
        <span
          aria-hidden
          data-testid="aerobraking-hint"
          className="absolute right-0 bottom-full z-10 mb-2 w-max max-w-64 animate-fade-in rounded-lg bg-ink px-3 py-1.5 font-sans text-sm font-semibold whitespace-normal text-bg shadow-lg after:absolute after:inset-x-0 after:top-full after:h-9"
        >
          {aerobrakingText(step)}
        </span>
      )}
    </span>
  );
}

interface StepListProps {
  plan: TripPlan;
  /** The step shown on the map, the total unless another one is picked. */
  selected: StepType;
  onSelect: (type: StepType) => void;
}

const card =
  'flex w-full animate-fade-in cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left transition hover:border-ink-soft aria-pressed:border-thrust aria-pressed:bg-thrust-surface aria-pressed:ring-1 aria-pressed:ring-thrust';

/** The steps of a trip; picking one shows it on the map. */
export function StepList({ plan, selected, onSelect }: StepListProps) {
  const button = (step: Step) => ({
    type: 'button' as const,
    'aria-pressed': step.type === selected,
    // Picking the step shown again goes back to the total.
    onClick: () => onSelect(step.type === selected ? 'total' : step.type),
  });

  return (
    <div className="space-y-2">
      <ol aria-label="Trip steps" className="space-y-2">
        {plan.steps.map((step, index) => (
          <li key={step.type}>
            <button
              {...button(step)}
              style={{ animationDelay: `${index * 40}ms` }}
              className={card}
            >
              <StepIcon type={step.type} />
              <span className="flex min-w-0 flex-1 flex-col text-ink-soft">
                <span>{message(step)}</span>
              </span>
              {step.aerobraked && (
                <span className="sr-only">{aerobrakingText(step)}</span>
              )}
              <DvValue step={step} />
            </button>
          </li>
        ))}
      </ol>
      {plan.total && (
        <button {...button(plan.total)} data-testid="total" className={card}>
          <Flag aria-hidden className="size-5 shrink-0 text-thrust-text" />
          <span className="flex-1 text-lg font-bold">Total</span>
          <DvValue step={plan.total} total />
        </button>
      )}
    </div>
  );
}
