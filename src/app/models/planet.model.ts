import { Step } from './step.model'

export type AstroBody = Planet | Satellite

export interface AstroPath {
  from: AstroBody,
  to: AstroBody
  landing: boolean,
  aerobraking: boolean,
  steps: Step[],
  total: Step,
  return: boolean
}

interface AbstractBody {
  readonly name: string
  readonly isPlanet: boolean
  readonly parent?: string
  readonly hasAtmosphere: boolean
  readonly canLand: boolean
  readonly imageUrl: string
  readonly dvGL: number // Ground <-> Low Orbit
  readonly dvLI?: number // Low Orbit <-> Intercept
  readonly color: string
}

export interface Planet extends AbstractBody {
  readonly dvLE?: number // Low Orbit <-> Elliptical Orbit to SOI Edge
  readonly dvEI?: number // Elliptical Orbit to SOI Edge <-> Intercept
  readonly dvK?: number // Intercept <-> Kerbin Elliptical Orbit to SOI Edge
  readonly satellites: Satellite[]
}

export interface Satellite extends AbstractBody {
  readonly parent: string
  readonly dvPL?: number // Intercept <-> Parent Body Low Orbit
  readonly dvPE?: number // Intercept <-> Parent Body Elliptical Orbit to SOI Edge
}
