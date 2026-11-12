import { type AstroBody, isKerbinSatellite } from './bodies';
import type { Step, Trip } from './planner';

// Elements of the Δv maps are named `<body>-<suffix>`: by their id on the
// KSPedia map (src/assets/dv-map.svg), by their data-map attribute on the
// Outer Planets Mod one (src/assets/dv-map-opm.svg), where they are many.
const SUFFIX_HUB = ['transit', 'hub', 'com'];
const SUFFIX_LOW = [...SUFFIX_HUB, 'transit-low', 'low'];
const SUFFIX_LANDING = [...SUFFIX_LOW, 'ground'];

const SUFFIX_STEP_GROUND = ['ground', 'low', 'com'];
const SUFFIX_STEP_SOI = ['transit', 'hub'];
const SUFFIX_STEP_LOW = [...SUFFIX_STEP_SOI, 'transit-low', 'low'];

const ids = (body: string, suffixes: string[]) =>
  suffixes.map((suffix) => `${body}-${suffix}`);

/** Routes of the OPM map some satellites share with others. */
const VIA: Record<string, readonly string[]> = {
  // Tal orbits Wal.
  tal: ['wal-transit', 'wal-low'],
  priax: ['priax-polta-transit'],
  polta: ['priax-polta-transit'],
};

const via = (body: string) => VIA[body] ?? [];

/** Satellites reached from the low orbit of a planet other than Kerbin. */
const fromParentLowOrbit = (body: AstroBody) =>
  !body.isPlanet && !isKerbinSatellite(body) && body.dvPL != null;

const planetOf = (body: AstroBody) =>
  (body.isPlanet ? body.name : body.parent).toLowerCase();

/** The elements of the map named `name`. */
export function mapElements(root: ParentNode, name: string): Element[] {
  return [...root.querySelectorAll(`[id="${name}"], [data-map="${name}"]`)];
}

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
      const parent = body.parent.toLowerCase();
      shown.push(
        ...ids(parent, fromParentLowOrbit(body) ? SUFFIX_LOW : SUFFIX_HUB),
        ...via(body.name.toLowerCase()),
      );
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
    case 'transitToLowOrbit':
      return [
        'hub',
        ...ids(planetOf(from), SUFFIX_STEP_LOW),
        ...ids(planetOf(to), SUFFIX_STEP_LOW),
      ];
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
    case 'transitFromLowToLow': {
      // From the low orbit of the planet only, not from its own route.
      const end = (body: AstroBody | undefined) =>
        body?.isPlanet
          ? [`${body.name.toLowerCase()}-low`]
          : body
            ? [
                ...ids(body.name.toLowerCase(), SUFFIX_STEP_LOW),
                ...via(body.name.toLowerCase()),
              ]
            : [];
      return [...end(step.from), ...end(step.to)];
    }
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
  // Path ids also name elements nested in the map groups.
  svg
    .querySelectorAll('.map-fade, .fade-soft')
    .forEach((el) => el.classList.remove('map-fade', 'fade-soft'));

  if (highlight.path == null) {
    return;
  }

  svg.querySelectorAll('.dv-map').forEach((el) => el.classList.add('map-fade'));
  for (const id of highlight.path) {
    for (const el of mapElements(svg, id)) {
      el.classList.remove('map-fade');
      el.classList.toggle('fade-soft', highlight.step != null);
    }
  }
  for (const id of highlight.step ?? []) {
    mapElements(svg, id).forEach((el) => el.classList.remove('fade-soft'));
  }
}
