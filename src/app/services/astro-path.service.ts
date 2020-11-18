import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { AstroPath, Planet, Satellite } from '../models/planet.model';
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
    if (path.from == null || path.to == null) {
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
    newPath.total = null;
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
    if (path.from == null || path.to == null) {
      return;
    }
    path.steps = [{
      type: StepType.takeOff,
      from: path.from,
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
    if (path.from.name === 'Kerbin' && path.to.isPlanet) {
      this.computeKerbinToPlanet(path);
      this.computeTotal(path);
      return;
    }

    /**
     * From Planet to Kerbin
     */
    if (path.from.isPlanet && path.to.name === 'Kerbin') {
      this.computePlanetToKerbin(path);
      this.computeTotal(path);
      return;
    }

    /**
     * From Kerbin to Satellite
     */
    if (path.from.name === 'Kerbin' && !path.to.isPlanet) {
      this.computeKerbinToSatellite(path);
      this.computeTotal(path);
      return;
    }

    /**
     * From Satellite to Kerbin
     */
    if (!path.from.isPlanet && path.to.name === 'Kerbin') {
      this.computeSatelliteToKerbin(path);
      this.computeTotal(path);
      return;
    }
  }

  private doAerobrakeFrom(path: AstroPath): boolean {
    return path.aerobraking && path.from.hasAtmosphere;
  }

  private doAerobrakeTo(path: AstroPath): boolean {
    return path.aerobraking && path.to.hasAtmosphere;
  }

  private computeKerbinToKerbin(path: AstroPath): void {
    path.steps.push({
      type: StepType.transitToSOI,
      to: this.kerbin,
      dv: this.kerbin.dvLE
    }, {
      type: StepType.transitToKeostat,
      to: this.kerbin,
      dv: this.kerbin.dvKeostat
    });
  }

  private computeKerbinToPlanet(path: AstroPath): void {
    const planet = path.to as Planet;
    const dv = this.kerbin.transitToLowOrbit(planet);
    path.steps.push({
      type: StepType.transitToLowOrbit,
      to: path.to,
      dv,
      dvMax: dv + planet.dvPlaneChange
    });
  }

  private computePlanetToKerbin(path: AstroPath): void {
    const planet = path.from as Planet;
    const dv = this.kerbin.transitToLowOrbit(planet);
    path.steps.push({
      type: StepType.transitToLowOrbit,
      to: this.kerbin,
      dv,
      dvMax: dv + planet.dvPlaneChange
    });
  }

  private computeKerbinToSatellite(path: AstroPath): void {
    const satellite = path.to as Satellite;
    if (this.isKerbinSatellite(satellite)) {
      const dv = satellite.dvPL + satellite.dvLI;
      path.steps.push({
        type: StepType.transitFromLowToLow,
        from: this.kerbin,
        to: satellite,
        dv,
        dvMax: dv + satellite.dvPlaneChange,
      });
    } else {
      const planet = this.bodiesService.getParent(satellite);
      const dv1 = this.kerbin.transitToSOI(planet);
      const dv2 = satellite.dvPE + satellite.dvLI;
      path.steps.push({
        type: StepType.transitToSOI,
        to: planet,
        dv: dv1,
        dvMax: dv1 + planet.dvPlaneChange
      }, {
        type: StepType.transitFromSOIToLow,
        from: planet,
        to: satellite,
        dv: dv2,
        dvMax: dv2 + satellite.dvPlaneChange
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
        dv: satellite.dvPL + satellite.dvLI
      });
    } else {
      const planet = this.bodiesService.getParent(satellite);
      path.steps.push({
        type: StepType.transitFromLowToSOI,
        from: satellite,
        to: planet,
        dv: satellite.dvPE + satellite.dvLI
      }, {
        type: StepType.transitToLowOrbit,
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
        to: path.to,
        dv: this.doAerobrakeTo(path) ? 0 : path.to.dvGL,
        returnDv: path.to.dvGL
      });
    }

    /**
     * Return
     */
    if (path.return) {
      const dv = path.steps
        .map(step => step.returnDv != null ? step.returnDv : step.dv)
        .reduce((dv1, dv2) => dv1 + dv2);

      let dvMax = dv;
      if (path.to.isPlanet) {
        dvMax += path.to.dvPlaneChange;
      } else {
        const planet = this.bodiesService.getParent(path.to as Satellite);
        dvMax += path.to.dvPlaneChange + planet.dvPlaneChange;
      }
      path.steps.push({
        type: StepType.return,
        from: path.to,
        to: path.from,
        dv,
        dvMax
      });
    }

    path.total = {
      type: StepType.total,
      dv: path.steps.map(step => step.dv).reduce((dv1, dv2) => dv1 + dv2),
      dvMax: path.steps.map(step => step.dvMax || step.dv).reduce((dv1, dv2) => dv1 + dv2)
    };
  }

  private isKerbinSatellite(satellite: Satellite): boolean {
    return ['Mun', 'Minmus'].includes(satellite.name);
  }

}
