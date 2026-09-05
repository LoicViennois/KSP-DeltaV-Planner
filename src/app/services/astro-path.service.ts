import { Service, computed, inject, signal } from '@angular/core';

import { AstroPath, Planet, Satellite } from '../models/planet.model';
import { StepType } from '../models/step.model';
import { Kerbin } from '../models/data/kerbin';
import { BodiesService } from './bodies.service';

@Service()
export class AstroPathService {
  private readonly bodiesService = inject(BodiesService);

  private readonly initialPath: AstroPath = {
    from: this.kerbin,
    to: null,
    landing: false,
    aerobraking: true,
    steps: [],
    total: null,
    return: false
  };

  private readonly pathState = signal<AstroPath>({ ...this.initialPath });
  readonly path = this.pathState.asReadonly();
  readonly isKerbinTrip = computed(() => this.isKerbinTripFor(this.path()));

  private get kerbin(): Kerbin {
    return this.bodiesService.kerbin;
  }

  reset(): void {
    this.pathState.set({ ...this.initialPath, steps: [] });
  }

  pathChanged(path: AstroPath): void {
    const newPath: AstroPath = {
      ...path,
      steps: [],
      total: null
    };
    this.computeSteps(newPath);
    this.pathState.set(newPath);
  }

  reversePath(): void {
    const currentPath = this.path();
    const newPath: AstroPath = {
      ...currentPath,
      from: currentPath.to,
      to: currentPath.from,
      steps: [],
      total: null
    };
    this.computeSteps(newPath);
    this.pathState.set(newPath);
  }

  private computeSteps(path: AstroPath): void {
    const from = path.from;
    const to = path.to;
    if (from == null || to == null) {
      return;
    }

    path.steps = [{
      type: StepType.takeOff,
      from,
      dv: from.dvGL,
      returnDv: this.doAerobrakeFrom(path) ? 0 : from.dvGL
    }];

    /**
     * Kerbin trip
     */
    if (this.isKerbinTripFor(path)) {
      this.computeKerbinToKerbin(path);
      return;
    }

    /**
     * From Kerbin to Planet
     */
    if (from.name === 'Kerbin' && to.isPlanet) {
      this.computeKerbinToPlanet(path);
      this.computeTotal(path);
      return;
    }

    /**
     * From Planet to Kerbin
     */
    if (from.isPlanet && to.name === 'Kerbin') {
      this.computePlanetToKerbin(path);
      this.computeTotal(path);
      return;
    }

    /**
     * From Kerbin to Satellite
     */
    if (from.name === 'Kerbin' && !to.isPlanet) {
      this.computeKerbinToSatellite(path);
      this.computeTotal(path);
      return;
    }

    /**
     * From Satellite to Kerbin
     */
    if (!from.isPlanet && to.name === 'Kerbin') {
      this.computeSatelliteToKerbin(path);
      this.computeTotal(path);
      return;
    }
  }

  private isKerbinTripFor(path: AstroPath): boolean {
    return path.from?.name === 'Kerbin' && path.to?.name === 'Kerbin';
  }

  private doAerobrakeFrom(path: AstroPath): boolean {
    return path.from != null && path.aerobraking && path.from.hasAtmosphere;
  }

  private doAerobrakeTo(path: AstroPath): boolean {
    return path.to != null && path.aerobraking && path.to.hasAtmosphere;
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
      to: planet,
      dv,
      dvMax: dv + (planet.dvPlaneChange ?? 0)
    });
  }

  private computePlanetToKerbin(path: AstroPath): void {
    const planet = path.from as Planet;
    const dv = this.kerbin.transitToLowOrbit(planet);
    path.steps.push({
      type: StepType.transitToLowOrbit,
      to: this.kerbin,
      dv,
      dvMax: dv + (planet.dvPlaneChange ?? 0)
    });
  }

  private computeKerbinToSatellite(path: AstroPath): void {
    const satellite = path.to as Satellite;
    if (this.isKerbinSatellite(satellite)) {
      const dv = satellite.dvPL! + satellite.dvLI!;
      path.steps.push({
        type: StepType.transitFromLowToLow,
        from: this.kerbin,
        to: satellite,
        dv,
        dvMax: dv + satellite.dvPlaneChange!
      });
    } else {
      const planet = this.bodiesService.getParent(satellite);
      const dv1 = this.kerbin.transitToSOI(planet);
      const dv2 = satellite.dvPE! + satellite.dvLI!;
      path.steps.push({
        type: StepType.transitToSOI,
        to: planet,
        dv: dv1,
        dvMax: dv1 + (planet.dvPlaneChange ?? 0)
      }, {
        type: StepType.transitFromSOIToLow,
        from: planet,
        to: satellite,
        dv: dv2,
        dvMax: dv2 + satellite.dvPlaneChange!
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
        dv: satellite.dvPL! + satellite.dvLI!
      });
    } else {
      const planet = this.bodiesService.getParent(satellite);
      path.steps.push({
        type: StepType.transitFromLowToSOI,
        from: satellite,
        to: planet,
        dv: satellite.dvPE! + satellite.dvLI!
      }, {
        type: StepType.transitToLowOrbit,
        to: this.kerbin,
        dv: this.kerbin.transitToSOI(planet)
      });
    }
  }

  private computeTotal(path: AstroPath): void {
    const to = path.to;
    const from = path.from;
    if (from == null || to == null) {
      return;
    }

    /**
     * Landing
     */
    if (path.landing) {
      path.steps.push({
        type: StepType.landing,
        to,
        dv: this.doAerobrakeTo(path) ? 0 : to.dvGL,
        returnDv: to.dvGL
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
      if (to.isPlanet) {
        dvMax += to.dvPlaneChange ?? 0;
      } else {
        const planet = this.bodiesService.getParent(to as Satellite);
        dvMax += (to.dvPlaneChange ?? 0) + (planet.dvPlaneChange ?? 0);
      }
      path.steps.push({
        type: StepType.return,
        from: to,
        to: from,
        dv,
        dvMax
      });
    }

    path.total = {
      type: StepType.total,
      dv: path.steps.map(step => step.dv).reduce((dv1, dv2) => dv1 + dv2),
      dvMax: path.steps.map(step => step.dvMax ?? step.dv).reduce((dv1, dv2) => dv1 + dv2)
    };
  }

  private isKerbinSatellite(satellite: Satellite): boolean {
    return ['Mun', 'Minmus'].includes(satellite.name);
  }
}
