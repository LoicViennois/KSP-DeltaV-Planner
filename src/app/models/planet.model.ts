export type AstroBody = Planet | Satellite

export interface AstroPath {
  from: AstroBody,
  to: AstroBody
  landing: boolean,
  aerobraking: boolean
}

interface AbstractBody {
  name: string
  isPlanet: boolean
  parent?: string
  hasAtmosphere: boolean
  canLand: boolean
  imageUrl: string
  dvGL: number // Ground <-> Low Orbit
  dvLI?: number // Low Orbit <-> Intercept
  color: string
}

export interface Planet extends AbstractBody {
  dvLE?: number // Low Orbit <-> Elliptical Orbit to SOI Edge
  dvEI?: number // Elliptical Orbit to SOI Edge <-> Intercept
  dvK?: number // Intercept <-> Kerbin Elliptical Orbit to SOI Edge
  satellites: Satellite[]
}

export interface Satellite extends AbstractBody {
  parent: string
  dvPL?: number // Intercept <-> Parent Body Low Orbit
  dvPE?: number // Intercept <-> Parent Body Elliptical Orbit to SOI Edge
}
