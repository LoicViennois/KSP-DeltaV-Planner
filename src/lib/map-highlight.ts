import type { Step, Trip } from './planner';

// Element ids of the Δv map (src/assets/dv-map.svg) are `<body>-<suffix>`.
const SUFFIX_HUB = ['transit', 'hub', 'com'];
const SUFFIX_LOW = [...SUFFIX_HUB, 'transit-low', 'low'];
const SUFFIX_LANDING = [...SUFFIX_LOW, 'ground'];

const SUFFIX_STEP_GROUND = ['ground', 'low', 'com'];
const SUFFIX_STEP_SOI = ['transit', 'hub'];
const SUFFIX_STEP_LOW = [...SUFFIX_STEP_SOI, 'transit-low', 'low'];

const ids = (body: string, suffixes: string[]) =>
  suffixes.map((suffix) => `${body}-${suffix}`);

export interface MapHighlight {
  /** Elements of the planned path, null when the whole map shows. */
  readonly path: readonly string[] | null;
  /** Elements of the hovered step, shown brighter than the rest of the path. */
  readonly step: readonly string[] | null;
}

function pathIds(trip: Trip): string[] | null {
  const { from, to } = trip;
  if (from == null || to == null) {
    return null;
  }

  const fromName = from.name.toLowerCase();
  const toName = to.name.toLowerCase();

  let shown = [
    'hub',
    fromName,
    toName,
    ...ids(fromName, SUFFIX_LANDING),
    ...ids(toName, trip.landing ? SUFFIX_LANDING : SUFFIX_LOW),
  ];
  for (const body of [to, from]) {
    if (!body.isPlanet) {
      shown.push(...ids(body.parent.toLowerCase(), SUFFIX_HUB));
    }
  }

  // Mun and Minmus are reached without leaving Kerbin's SOI.
  if ([fromName, toName].some((name) => name === 'mun' || name === 'minmus')) {
    shown = shown.filter((id) => id !== 'kerbin-transit-low' && id !== 'hub');
  }

  if (fromName === toName) {
    shown.push('kerbin-keostat');
  }

  return shown;
}

function stepIds(trip: Trip, step: Step): string[] | null {
  const { from, to } = trip;
  if (from == null || to == null) {
    return null;
  }

  const fromName = from.name.toLowerCase();
  const toName = to.name.toLowerCase();
  const stepFrom = step.from?.name.toLowerCase() ?? '';
  const stepTo = step.to?.name.toLowerCase() ?? '';

  switch (step.type) {
    case 'takeOff':
      return [...ids(fromName, SUFFIX_STEP_GROUND), fromName];
    case 'landing':
      return [...ids(toName, SUFFIX_STEP_GROUND), toName];
    case 'transitToLowOrbit': {
      const origin = from.isPlanet ? fromName : from.parent.toLowerCase();
      return [
        'hub',
        ...ids(origin, SUFFIX_STEP_LOW),
        ...ids(toName, SUFFIX_STEP_LOW),
      ];
    }
    case 'transitToSOI':
      return [
        'hub',
        ...ids(fromName, SUFFIX_STEP_LOW),
        ...ids(stepTo, SUFFIX_STEP_SOI),
      ];
    case 'transitFromSOIToLow':
      return [`${stepFrom}-hub`, ...ids(stepTo, SUFFIX_STEP_LOW)];
    case 'transitFromLowToSOI':
      return [`${stepTo}-hub`, ...ids(stepFrom, SUFFIX_STEP_LOW)];
    case 'transitFromLowToLow':
      return [
        ...ids(fromName, SUFFIX_STEP_LOW),
        ...ids(toName, SUFFIX_STEP_LOW),
      ];
    case 'transitToKeostat':
      return ['kerbin-low', 'kerbin-keostat'];
    // The return trip and the total span the whole path.
    case 'return':
    case 'total':
      return null;
  }
}

export function mapHighlight(trip: Trip, step: Step | null): MapHighlight {
  const path = pathIds(trip);
  return {
    path,
    step: path && step ? stepIds(trip, step) : null,
  };
}

/** Fades the map elements off the highlighted path. */
export function applyHighlight(svg: SVGSVGElement, highlight: MapHighlight) {
  const byId = (id: string) => svg.querySelector(`[id="${id}"]`);
  // Path ids also name elements nested in the map groups.
  svg
    .querySelectorAll('.map-fade, .fade-soft')
    .forEach((el) => el.classList.remove('map-fade', 'fade-soft'));

  if (highlight.path == null) {
    return;
  }

  svg.querySelectorAll('.dv-map').forEach((el) => el.classList.add('map-fade'));
  for (const id of highlight.path) {
    const el = byId(id);
    el?.classList.remove('map-fade');
    el?.classList.toggle('fade-soft', highlight.step != null);
  }
  for (const id of highlight.step ?? []) {
    byId(id)?.classList.remove('fade-soft');
  }
}
