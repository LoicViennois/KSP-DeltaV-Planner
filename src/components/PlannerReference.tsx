import { ChevronDown } from 'lucide-react';

import { bodies, outerBodies } from '../lib/bodies';

const stockNames = bodies.map((body) => body.name);
const stockSet = new Set(stockNames);
const outerModNames = outerBodies
  .filter((body) => !stockSet.has(body.name))
  .map((body) => body.name);

/** Compact, searchable disclosure covering the map, calculator, and supported bodies. */
export function PlannerReference() {
  return (
    <details className="group border-t border-line/60 pt-2 text-sm text-ink-soft">
      <summary className="inline-flex min-h-7 cursor-pointer list-none items-center gap-1.5 rounded-lg py-0.5 font-medium text-ink-soft transition hover:text-ink pointer-coarse:min-h-11 [&::-webkit-details-marker]:hidden">
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 transition-transform group-open:rotate-180"
        />
        About this KSP Delta-V map &amp; bodies
      </summary>
      <div className="mt-2 space-y-3 rounded-xl border border-line bg-surface/70 p-4 leading-relaxed">
        <p>
          <strong className="font-semibold text-ink">
            KSP Delta-V Planner
          </strong>{' '}
          is an interactive Kerbal Space Program Delta-V map and rocket
          calculator. Plan take-off, low orbit, interplanetary transfer,
          capture, aerobraking, landing, and return burns across the stock
          Kerbol system and the Outer Planets Mod.
        </p>
        <dl className="space-y-2">
          <div>
            <dt className="font-semibold text-ink">Kerbol system (stock)</dt>
            <dd>{stockNames.join(', ')}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">Outer Planets Mod</dt>
            <dd>{outerModNames.join(', ')}</dd>
          </div>
        </dl>
      </div>
    </details>
  );
}
