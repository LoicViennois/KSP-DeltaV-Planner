import { AstroBody } from './planet.model';

export enum StepType {
  takeOff,
  transitToLowOrbit,
  transitFromLowToLow,
  transitToSOI,
  transitFromSOIToLow,
  transitFromLowToSOI,
  transitToKeostat,
  landing,
  return,
  total,
}

export interface Step {
  readonly type: StepType;
  readonly from?: AstroBody;
  readonly to?: AstroBody;
  readonly dv: number;
  readonly dvMax?: number;
  readonly returnDv?: number;
}
