import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { AstroPath, isFullAstroPath, isPlanet, isSatellite, Planet, Satellite } from '../models/planet.model';
import { StepType } from '../models/step.model';
import { Kerbin } from '../models/data/kerbin';
import { BodiesService } from './bodies.service';

@Injectable({
  providedIn: 'root'
})
export class AstroPathService {
  private readonly path: BehaviorSubject<AstroPath>;
  private readonly initialPath: AstroPath;

  constructor(private readonly bodiesService: BodiesService) {
    this.initialPath = {
      from: this.kerbin,
      to: null,
      landing: false,
      aerobraking: true,
      steps: [],
      total: null,
      return: false
    };
    this.path = new BehaviorSubject({ ...this.initialPath });
  }

  get isKerbinTrip(): boolean {
    const path = this.path.value;
    if (!isFullAstroPath(path)) {
      return false;
    }
    return path.from.name === 'Kerbin' && path.to.name === 'Kerbin';
  }

  private get kerbin(): Kerbin {
    return this.bodiesService.kerbin;
  }

  reset(): void {
    this.path.next({ ...this.initialPath });
  }

  getPath(): Observable<AstroPath> {
    return this.path.asObservable();
  }

  pathChanged(path: AstroPath): void {
    const newPath = { ...path };
    this.computeSteps(newPath);
    this.path.next(newPath);
  }

  reversePath(): void {
    const newPath = { ...this.path.value };
    [newPath.from, newPath.to] = [newPath.to, newPath.from];
    this.computeSteps(newPath);
    this.path.next(newPath);
  }

  private computeSteps(path: AstroPath): void {
    if (!isFullAstroPath(path)) {
      return;
    }
    path.steps = [{
      type: StepType.takeOff,
      from: path.from,
      to: null,
      dv: path.from.dvGL,
      returnDv: this.doAerobrakeFrom(path) ? 0 : path.from.dvGL
    }];

    /**
     * Kerbin trip
     */
    if (this.isKerbinTrip) {
      this.computeKerbinToKerbin(path);
      return;
    }

    /**
     * From Kerbin to Planet
     */
    if (path.from.name === 'Kerbin' && isPlanet(path.to)) {
      this.computeKerbinToPlanet(path);
      this.computeTotal(path);
      return;
    }

    /**
     * From Planet to Kerbin
     */
    if (isPlanet(path.from) && path.to.name === 'Kerbin') {
      this.computePlanetToKerbin(path);
      this.computeTotal(path);
      return;
    }

    /**
     * From Kerbin to Satellite
     */
    if (path.from.name === 'Kerbin' && isSatellite(path.to)) {
      this.computeKerbinToSatellite(path);
      this.computeTotal(path);
      return;
    }

    /**
     * From Satellite to Kerbin
     */
    if (isSatellite(path.from) && path.to.name === 'Kerbin') {
      this.computeSatelliteToKerbin(path);
      this.computeTotal(path);
      return;
    }
  }

  private doAerobrakeFrom(path: AstroPath): boolean {
    return path.aerobraking && (path.from?.hasAtmosphere ?? false);
  }

  private doAerobrakeTo(path: AstroPath): boolean {
    return path.aerobraking && (path.to?.hasAtmosphere ?? false);
  }

  private computeKerbinToKerbin(path: AstroPath): void {
    path.steps.push({
      type: StepType.transitToSOI,
      from: null,
      to: this.kerbin,
      dv: this.kerbin.dvLE
    }, {
      type: StepType.transitToKeostat,
      from: null,
      to: this.kerbin,
      dv: this.kerbin.dvKeostat
    });
  }

  private computeKerbinToPlanet(path: AstroPath): void {
    const planet = path.to as Planet;
    path.steps.push({
      type: StepType.transitToLowOrbit,
      from: null,
      to: path.to,
      dv: this.kerbin.transitToLowOrbit(planet)
    });
  }

  private computePlanetToKerbin(path: AstroPath): void {
    const planet = path.from as Planet;
    path.steps.push({
      type: StepType.transitToLowOrbit,
      from: null,
      to: this.kerbin,
      dv: this.kerbin.transitToLowOrbit(planet)
    });
  }

  private computeKerbinToSatellite(path: AstroPath): void {
    const satellite = path.to as Satellite;
    if (this.isKerbinSatellite(satellite)) {
      path.steps.push({
        type: StepType.transitFromLowToLow,
        from: this.kerbin,
        to: satellite,
        dv: (satellite.dvPL ?? 0) + (satellite.dvLI ?? 0)
      });
    } else {
      const planet = (this.bodiesService.bodies.find((body) => body.name === satellite.parent)) as Planet;
      path.steps.push({
        type: StepType.transitToSOI,
        from: null,
        to: planet,
        dv: this.kerbin.transitToSOI(planet)
      }, {
        type: StepType.transitFromSOIToLow,
        from: planet,
        to: satellite,
        dv: (satellite.dvPE ?? 0) + (satellite.dvLI ?? 0)
      });
    }
  }

  private computeSatelliteToKerbin(path: AstroPath): void {
    const satellite = path.from as Satellite;
    if (this.isKerbinSatellite(satellite)) {
      path.steps.push({
        type: StepType.transitFromLowToLow,
        from: satellite,
        to: this.kerbin,
        dv: (satellite.dvPL ?? 0) + (satellite.dvLI ?? 0)
      });
    } else {
      const planet = (this.bodiesService.bodies.find((body) => body.name === satellite.parent)) as Planet;
      path.steps.push({
        type: StepType.transitFromLowToSOI,
        from: satellite,
        to: planet,
        dv: (satellite.dvPE ?? 0) + (satellite.dvLI ?? 0)
      }, {
        type: StepType.transitToLowOrbit,
        from: null,
        to: this.kerbin,
        dv: this.kerbin.transitToSOI(planet)
      });
    }
  }

  private computeTotal(path: AstroPath): void {
    /**
     * Landing
     */
    if (path.landing) {
      path.steps.push({
        type: StepType.landing,
        from: null,
        to: path.to,
        dv: this.doAerobrakeTo(path) ? 0 : path.to?.dvGL ?? 0,
        returnDv: path.to?.dvGL ?? 0
      });
    }

    /**
     * Return
     */
    if (path.return) {
      path.steps.push({
        type: StepType.return,
        from: path.to,
        to: path.from,
        dv: path.steps
          .map(step => step.returnDv != null ? step.returnDv : step.dv)
          .reduce((dv1, dv2) => dv1 + dv2)
      });
    }

    path.total = {
      type: StepType.total,
      from: null,
      to: null,
      dv: path.steps.map(step => step.dv).reduce((dv1, dv2) => dv1 + dv2)
    };
  }

  private isKerbinSatellite(satellite: Satellite): boolean {
    return ['Mun', 'Minmus'].includes(satellite.name);
  }

}
