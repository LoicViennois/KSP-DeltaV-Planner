import { Step } from './step.model';

export type AstroBody = Planet | Satellite;

export interface AstroPath {
  from: AstroBody | null;
  to: AstroBody | null;
  landing: boolean;
  aerobraking: boolean;
  steps: Step[];
  total: Step | null;
  return: boolean;
}

export interface FullAstroPath extends AstroPath {
  from: AstroBody;
  to: AstroBody;
}

export function isFullAstroPath(path: AstroPath | FullAstroPath): path is FullAstroPath {
  return (path.from != null && path.to != null);
}

interface AbstractBody {
  readonly name: string;
  readonly hasAtmosphere: boolean;
  readonly canLand: boolean;
  readonly imageUrl: string;
  readonly dvGL: number; // Ground <-> Low Orbit
  readonly dvLI: number | null; // Low Orbit <-> Intercept
  readonly color: string;
}

export interface Planet extends AbstractBody {
  readonly dvLE: number | null ; // Low Orbit <-> Elliptical Orbit to SOI Edge
  readonly dvEI: number | null; // Elliptical Orbit to SOI Edge <-> Intercept
  readonly dvK: number | null; // Intercept <-> Kerbin Elliptical Orbit to SOI Edge
  readonly satellites: Satellite[];
}

export interface Satellite extends AbstractBody {
  readonly parent: string;
  readonly dvPL: number | null; // Intercept <-> Parent Body Low Orbit
  readonly dvPE: number | null; // Intercept <-> Parent Body Elliptical Orbit to SOI Edge
}

export function isPlanet(body: AstroBody): body is Planet {
  return (body as Planet).satellites !== undefined;
}

export function isSatellite(body: AstroBody): body is Satellite {
  return (body as Satellite).parent !== undefined;
}
