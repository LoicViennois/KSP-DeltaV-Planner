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
  /** Δv this step costs on the way back, when it differs */
  readonly returnDv?: number;
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

function kerbinToLowOrbit(planet: Planet): number {
  const dvK = planet.dvK ?? 0;
  const dvLE = planet.dvLE ?? 0;
  const dvEI = planet.dvEI ?? 0;
  return kerbin.dvLE + dvK + (planet.dvLI ?? dvLE + dvEI);
}

function kerbinToSOI(planet: Planet): number {
  return kerbin.dvLE + (planet.dvK ?? 0) + (planet.dvEI ?? 0);
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

/** The Δv of each step of a trip, from the take-off to the optional return. */
export function planTrip(trip: Trip): TripPlan {
  const { from, to } = trip;
  if (from == null || to == null) {
    return { steps: [], total: null };
  }

  const aerobrakeFrom = trip.aerobraking && from.hasAtmosphere;
  const aerobrakeTo = trip.aerobraking && to.hasAtmosphere;

  const steps: Step[] = [
    {
      type: 'takeOff',
      from,
      dv: from.dvGL,
      returnDv: aerobrakeFrom ? 0 : from.dvGL,
    },
  ];

  if (isKerbinTrip(trip)) {
    steps.push(
      { type: 'transitToSOI', to: kerbin, dv: kerbin.dvLE },
      { type: 'transitToKeostat', to: kerbin, dv: kerbin.dvKeostat },
    );
    return { steps, total: null };
  }

  if (from.name === kerbin.name && to.isPlanet) {
    const dv = kerbinToLowOrbit(to);
    steps.push({
      type: 'transitToLowOrbit',
      to,
      dv,
      dvMax: dv + (to.dvPlaneChange ?? 0),
    });
  } else if (from.isPlanet && to.name === kerbin.name) {
    const dv = kerbinToLowOrbit(from);
    steps.push({
      type: 'transitToLowOrbit',
      to: kerbin,
      dv,
      dvMax: dv + (from.dvPlaneChange ?? 0),
    });
  } else if (from.name === kerbin.name && !to.isPlanet) {
    if (isKerbinSatellite(to)) {
      const dv = (to.dvPL ?? 0) + (to.dvLI ?? 0);
      steps.push({
        type: 'transitFromLowToLow',
        from: kerbin,
        to,
        dv,
        dvMax: dv + (to.dvPlaneChange ?? 0),
      });
    } else {
      const planet = parentOf(to);
      const toSOI = kerbinToSOI(planet);
      const toLow = (to.dvPE ?? 0) + (to.dvLI ?? 0);
      steps.push(
        {
          type: 'transitToSOI',
          to: planet,
          dv: toSOI,
          dvMax: toSOI + (planet.dvPlaneChange ?? 0),
        },
        {
          type: 'transitFromSOIToLow',
          from: planet,
          to,
          dv: toLow,
          dvMax: toLow + (to.dvPlaneChange ?? 0),
        },
      );
    }
  } else if (!from.isPlanet && to.name === kerbin.name) {
    if (isKerbinSatellite(from)) {
      steps.push({
        type: 'transitFromLowToLow',
        from,
        to: kerbin,
        dv: (from.dvPL ?? 0) + (from.dvLI ?? 0),
      });
    } else {
      const planet = parentOf(from);
      steps.push(
        {
          type: 'transitFromLowToSOI',
          from,
          to: planet,
          dv: (from.dvPE ?? 0) + (from.dvLI ?? 0),
        },
        { type: 'transitToLowOrbit', to: kerbin, dv: kerbinToSOI(planet) },
      );
    }
  } else {
    return { steps, total: null };
  }

  if (trip.landing) {
    steps.push({
      type: 'landing',
      to,
      dv: aerobrakeTo ? 0 : to.dvGL,
      returnDv: to.dvGL,
    });
  }

  if (trip.return) {
    const dv = sum(steps.map((step) => step.returnDv ?? step.dv));
    const planeChange = to.isPlanet
      ? (to.dvPlaneChange ?? 0)
      : (to.dvPlaneChange ?? 0) + (parentOf(to).dvPlaneChange ?? 0);
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
