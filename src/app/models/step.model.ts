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
  readonly from: AstroBody | null;
  readonly to: AstroBody | null;
  readonly dv: number;
  readonly returnDv?: number;
}

export interface FullStep extends Step {
  readonly from: AstroBody;
  readonly to: AstroBody;
}
