import { AstroBody } from './planet.model'

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
  type: StepType,
  from?: AstroBody,
  to?: AstroBody,
  dv: number,
  returnDv?: number
}
