import {
  type AstroBody,
  isKerbinSatellite,
  kerbin,
  type Planet,
  parentOf,
} from './bodies';

export type StepType =
  | 'takeOff'
  | 'transitToLowOrbit'
  | 'transitFromLowToLow'
  | 'transitToSOI'
  | 'transitFromSOIToLow'
  | 'transitFromLowToSOI'
  | 'transitToKeostat'
  | 'landing'
  | 'return'
  | 'total';

export interface Step {
  readonly type: StepType;
  readonly from?: AstroBody;
  readonly to?: AstroBody;
  /** Δv without any plane change, in m/s */
  readonly dv: number;
  /** Δv including the maximum plane change, in m/s */
  readonly dvMax?: number;
  /** Whether aerobraking saves the capture burn of this step */
  readonly aerobraked?: boolean;
}

export interface Trip {
  readonly from: AstroBody | null;
  readonly to: AstroBody | null;
  readonly landing: boolean;
  readonly aerobraking: boolean;
  readonly return: boolean;
}

export interface TripPlan {
  readonly steps: readonly Step[];
  readonly total: Step | null;
}

export const initialTrip: Trip = {
  from: kerbin,
  to: null,
  landing: false,
  aerobraking: true,
  return: false,
};

export function isKerbinTrip(trip: Trip): boolean {
  return trip.from?.name === kerbin.name && trip.to?.name === kerbin.name;
}

/** Leaving Kerbin for anywhere but Kerbin, or coming back to it. */
export function withFrom(trip: Trip, body: AstroBody): Trip {
  return {
    ...trip,
    from: body,
    to: body.name !== kerbin.name ? kerbin : trip.to,
  };
}

export function withTo(trip: Trip, body: AstroBody): Trip {
  return {
    ...trip,
    to: body,
    from: body.name !== kerbin.name ? kerbin : trip.from,
  };
}

export function reversed(trip: Trip): Trip {
  return { ...trip, from: trip.to, to: trip.from };
}

/** The burns of a transfer, split by what the atmosphere can take over. */
interface Burns {
  /** Spent anyway */
  readonly dv: number;
  /** The capture at the end, saved by aerobraking into an atmosphere */
  readonly capture: number;
}

/** Kerbin low orbit to the low orbit of `planet`, or the other way round. */
function kerbinToLowOrbit(planet: Planet, toKerbin: boolean): Burns {
  const dvK = planet.dvK ?? 0;
  const planetLow = planet.dvLI ?? (planet.dvLE ?? 0) + (planet.dvEI ?? 0);
  return toKerbin
    ? { dv: planetLow + dvK, capture: kerbin.dvLE }
    : { dv: kerbin.dvLE + dvK, capture: planetLow };
}

/** Kerbin low orbit to an elliptical orbit around `planet`, or back. */
function kerbinToSOI(planet: Planet, toKerbin: boolean): Burns {
  const dvK = planet.dvK ?? 0;
  const dvEI = planet.dvEI ?? 0;
  return toKerbin
    ? { dv: dvEI + dvK, capture: kerbin.dvLE }
    : { dv: kerbin.dvLE + dvK, capture: dvEI };
}

/** The Δv a transfer to `planet` can take above its best case. */
function worstCaseExtra(planet: Planet): number {
  const eccentric = (planet.dvKMax ?? planet.dvK ?? 0) - (planet.dvK ?? 0);
  return (planet.dvPlaneChange ?? 0) + eccentric;
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

/**
 * A step reaching `target`, whose capture burn is saved when the ship can
 * aerobrake into its atmosphere.
 */
function transfer(
  step: Omit<Step, 'dv' | 'dvMax' | 'aerobraked'>,
  burns: Burns,
  target: AstroBody,
  aerobraking: boolean,
  extra = 0,
): Step {
  const aerobraked = aerobraking && target.hasAtmosphere && burns.capture > 0;
  const dv = burns.dv + (aerobraked ? 0 : burns.capture);
  return {
    ...step,
    dv,
    ...(extra > 0 && { dvMax: dv + extra }),
    ...(aerobraked && { aerobraked }),
  };
}

/** The steps between the low orbits of `from` and `to`, one being Kerbin. */
function transfers(
  from: AstroBody,
  to: AstroBody,
  aerobraking: boolean,
): Step[] {
  const outbound = from.name === kerbin.name;
  const body = outbound ? to : from;
  const extra = (value: number) => (outbound ? value : 0);

  if (body.isPlanet) {
    return [
      transfer(
        { type: 'transitToLowOrbit', to },
        kerbinToLowOrbit(body, !outbound),
        to,
        aerobraking,
        // Either way, on an eccentric orbit or out of the plane of Kerbin.
        worstCaseExtra(body),
      ),
    ];
  }

  const satellite: Burns = {
    dv: body.dvPL ?? body.dvPE ?? 0,
    capture: body.dvLI ?? 0,
  };
  // The capture and the escape swap round on the way back.
  const lowToLow: Burns = outbound
    ? satellite
    : { dv: satellite.capture, capture: satellite.dv };

  if (isKerbinSatellite(body)) {
    return [
      transfer(
        { type: 'transitFromLowToLow', from, to },
        lowToLow,
        to,
        aerobraking,
        extra(body.dvPlaneChange ?? 0),
      ),
    ];
  }

  const planet = parentOf(body);
  // Through the low orbit of the planet, or only through its SOI.
  const viaLowOrbit = body.dvPL != null;
  const legs = viaLowOrbit
    ? {
        planet: kerbinToLowOrbit(planet, !outbound),
        toPlanet: 'transitToLowOrbit' as const,
        toBody: 'transitFromLowToLow' as const,
        fromBody: 'transitFromLowToLow' as const,
      }
    : {
        planet: kerbinToSOI(planet, !outbound),
        toPlanet: 'transitToSOI' as const,
        toBody: 'transitFromSOIToLow' as const,
        fromBody: 'transitFromLowToSOI' as const,
      };

  const planetLeg = (target: AstroBody) =>
    transfer(
      // Back home, Kerbin is reached in low orbit whatever the route.
      { type: outbound ? legs.toPlanet : 'transitToLowOrbit', to: target },
      legs.planet,
      target,
      aerobraking,
      extra(worstCaseExtra(planet)),
    );

  if (outbound) {
    return [
      planetLeg(planet),
      transfer(
        { type: legs.toBody, from: planet, to },
        lowToLow,
        to,
        aerobraking,
        body.dvPlaneChange ?? 0,
      ),
    ];
  }
  return [
    transfer(
      { type: legs.fromBody, from, to: planet },
      // Leaving for the SOI edge of the planet, there is nothing to capture.
      viaLowOrbit
        ? lowToLow
        : { dv: sum([lowToLow.dv, lowToLow.capture]), capture: 0 },
      planet,
      aerobraking,
    ),
    planetLeg(kerbin),
  ];
}

/** The Δv of each step of a trip, from the take-off to the optional return. */
export function planTrip(trip: Trip): TripPlan {
  const { from, to } = trip;
  if (from == null || to == null) {
    return { steps: [], total: null };
  }

  const steps: Step[] = [{ type: 'takeOff', from, dv: from.dvGL }];

  if (isKerbinTrip(trip)) {
    steps.push(
      { type: 'transitToSOI', to: kerbin, dv: kerbin.dvLE },
      { type: 'transitToKeostat', to: kerbin, dv: kerbin.dvKeostat },
    );
    return { steps, total: null };
  }

  if (from.name !== kerbin.name && to.name !== kerbin.name) {
    return { steps, total: null };
  }
  steps.push(...transfers(from, to, trip.aerobraking));

  if (trip.landing) {
    steps.push(landing(to, trip.aerobraking));
  }

  if (trip.return) {
    const back = transfers(to, from, trip.aerobraking);
    const dv = sum([
      ...(trip.landing ? [to.dvGL] : []),
      ...back.map((step) => step.dv),
      landing(from, trip.aerobraking).dv,
    ]);
    const planeChange = to.isPlanet
      ? worstCaseExtra(to)
      : (to.dvPlaneChange ?? 0) + worstCaseExtra(parentOf(to));
    steps.push({
      type: 'return',
      from: to,
      to: from,
      dv,
      dvMax: dv + planeChange,
    });
  }

  return {
    steps,
    total: {
      type: 'total',
      dv: sum(steps.map((step) => step.dv)),
      dvMax: sum(steps.map((step) => step.dvMax ?? step.dv)),
    },
  };
}

function landing(body: AstroBody, aerobraking: boolean): Step {
  return {
    type: 'landing',
    to: body,
    dv: aerobraking && body.hasAtmosphere ? 0 : body.dvGL,
  };
}
