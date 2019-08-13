import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'

import { AstroBody, AstroPath, Planet, Satellite } from '../models/planet.model'
import { Step, StepType } from '../models/step.model'
import { Kerbin } from '../models/data/kerbin'
import { BodiesService } from './bodies.service'

@Injectable({
  providedIn: 'root'
})
export class AstroPathService {
  private path: BehaviorSubject<AstroPath>
  private step: Subject<Step>

  get kerbin (): Kerbin {
    return this.bodiesService.kerbin
  }

  get bodies (): AstroBody[] {
    return this.bodiesService.bodies
  }

  constructor (private bodiesService: BodiesService) {
    this.step = new Subject()
    this.path = new BehaviorSubject({
      from: this.kerbin,
      to: null,
      landing: false,
      aerobraking: true,
      steps: [],
      total: null,
      return: false
    })
  }

  reset () {
    this.path.next({
      from: this.kerbin,
      to: null,
      landing: false,
      aerobraking: true,
      steps: [],
      total: null,
      return: false
    })
  }

  getPath (): Observable<AstroPath> {
    return this.path.asObservable()
  }

  pathChanged (path: AstroPath) {
    this.computeSteps(path)
    this.path.next(path)
  }

  getSelection (): Observable<Step> {
    return this.step.asObservable()
  }

  selectionChanged (step: Step) {
    this.step.next(step)
  }

  reverseSelection () {
    const path = this.path.value;
    [path.from, path.to] = [path.to, path.from]
    this.computeSteps(path)
    this.path.next(path)
  }

  get isKerbinTrip (): boolean {
    const path = this.path.value
    if (path.from == null || path.to == null) {
      return false
    }
    return path.from.name === 'Kerbin' && path.to.name === 'Kerbin'
  }

  private computeSteps (path: AstroPath) {
    if (path.from == null || path.to == null) {
      return
    }
    path.steps = [{
      type: StepType.takeOff,
      from: path.from,
      dv: path.from.dvGL,
      returnDv: this.doAerobrakeFrom(path) ? 0 : path.from.dvGL
    }]

    /**
     * Kerbin trip
     */
    if (this.isKerbinTrip) {
      this.computeKerbinToKerbin(path)
      return
    }

    /**
     * From Kerbin to Planet
     */
    if (path.from.name === 'Kerbin' && path.to.isPlanet) {
      this.computeKerbinToPlanet(path)
      this.computeTotal(path)
      return
    }

    /**
     * From Planet to Kerbin
     */
    if (path.from.isPlanet && path.to.name === 'Kerbin') {
      this.computePlanetToKerbin(path)
      this.computeTotal(path)
      return
    }

    /**
     * From Kerbin to Satellite
     */
    if (path.from.name === 'Kerbin' && !path.to.isPlanet) {
      this.computeKerbinToSatellite(path)
      this.computeTotal(path)
      return
    }

    /**
     * From Satellite to Kerbin
     */
    if (!path.from.isPlanet && path.to.name === 'Kerbin') {
      this.computeSatelliteToKerbin(path)
      this.computeTotal(path)
      return
    }
  }

  private doAerobrakeFrom (path: AstroPath): boolean {
    return path.aerobraking && path.from.hasAtmosphere
  }

  private doAerobrakeTo (path: AstroPath): boolean {
    return path.aerobraking && path.to.hasAtmosphere
  }

  private computeKerbinToKerbin (path: AstroPath) {
    path.steps.push({
      type: StepType.transitToSOI,
      to: this.kerbin,
      dv: this.kerbin.dvLE
    }, {
      type: StepType.transitToKeostat,
      to: this.kerbin,
      dv: this.kerbin.dvKeostat
    })
  }

  private computeKerbinToPlanet (path: AstroPath) {
    const planet = path.to as Planet
    path.steps.push({
      type: StepType.transitToLowOrbit,
      to: path.to,
      dv: this.kerbin.transitToLowOrbit(planet)
    })
  }

  private computePlanetToKerbin (path: AstroPath) {
    const planet = path.from as Planet
    path.steps.push({
      type: StepType.transitToLowOrbit,
      to: this.kerbin,
      dv: this.kerbin.transitToLowOrbit(planet)
    })
  }

  private computeKerbinToSatellite (path: AstroPath) {
    const satellite = path.to as Satellite
    if (this.isKerbinSatellite(satellite)) {
      path.steps.push({
        type: StepType.transitFromLowToLow,
        from: this.kerbin,
        to: satellite,
        dv: satellite.dvPL + satellite.dvLI
      })
    } else {
      const planet = (this.bodies.find((body) => body.name === satellite.parent)) as Planet
      path.steps.push({
        type: StepType.transitToSOI,
        to: planet,
        dv: this.kerbin.transitToSOI(planet)
      }, {
        type: StepType.transitFromSOIToLow,
        from: planet,
        to: satellite,
        dv: satellite.dvPE + satellite.dvLI
      })
    }
  }

  private computeSatelliteToKerbin (path: AstroPath) {
    const satellite = path.from as Satellite
    if (this.isKerbinSatellite(satellite)) {
      path.steps.push({
        type: StepType.transitFromLowToLow,
        from: satellite,
        to: this.kerbin,
        dv: satellite.dvPL + satellite.dvLI
      })
    } else {
      const planet = (this.bodies.find((body) => body.name === satellite.parent)) as Planet
      path.steps.push({
        type: StepType.transitFromLowToSOI,
        from: satellite,
        to: planet,
        dv: satellite.dvPE + satellite.dvLI
      }, {
        type: StepType.transitToLowOrbit,
        to: this.kerbin,
        dv: this.kerbin.transitToSOI(planet)
      })
    }
  }

  private computeTotal (path: AstroPath) {
    /**
     * Landing
     */
    if (path.landing) {
      path.steps.push({
        type: StepType.landing,
        to: path.to,
        dv: this.doAerobrakeTo(path) ? 0 : path.to.dvGL,
        returnDv: path.to.dvGL
      })
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
      })
    }

    path.total = {
      type: StepType.total,
      dv: path.steps.map(step => step.dv).reduce((dv1, dv2) => dv1 + dv2)
    }
  }

  private isKerbinSatellite (satellite: Satellite) {
    return ['Mun', 'Minmus'].includes(satellite.name)
  }

}
