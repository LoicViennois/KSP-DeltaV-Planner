import { Component, OnInit } from '@angular/core'

import { AstroBody, AstroPath, Planet, Satellite } from '../../models/planet.model'
import { Step, StepType } from '../../models/step.model'
import { Kerbin } from '../../models/data/kerbin'
import { planets } from '../../models/data/planets'
import { AstroPathService } from '../../services/astro-path.service'

@Component({
  selector: 'ksp-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.less']
})
export class PanelComponent implements OnInit {
  options: AstroBody[]
  selectedPath: AstroPath
  steps: Step[]
  total: Step
  return = false

  private kerbin: Kerbin

  constructor (private astroPathService: AstroPathService) {
    this.options = []
    for (const planet of planets) {
      this.options.push(planet)
      for (const satellite of planet.satellites) {
        this.options.push(satellite)
      }
    }
    this.kerbin = this.options.find(p => p.name === 'Kerbin') as Kerbin
  }

  ngOnInit () {
    this.init()

    /** Debug */
    // this.selectedPath.to = this.options.find(p => p.name === 'Ike')
    // this.selectedPath.landing = true
    // this.computeDeltaV()
    /***/
  }

  init () {
    this.selectedPath = {
      from: this.kerbin,
      to: null,
      landing: false
    }
    this.steps = []
    this.return = false
    this.astroPathService.pathChanged(this.selectedPath)
  }

  reverseSelection () {
    [this.selectedPath.from, this.selectedPath.to] = [this.selectedPath.to, this.selectedPath.from]
    this.computeDeltaV()
  }

  selectFromChanged () {
    if (this.selectedPath.from !== this.kerbin) {
      this.selectedPath.to = this.kerbin
    }
    this.computeDeltaV()
  }

  selectToChanged () {
    if (this.selectedPath.to !== this.kerbin) {
      this.selectedPath.from = this.kerbin
    }
    this.computeDeltaV()
  }

  landingInAtmosphere (step: Step): boolean {
    return step.type === StepType.landing && this.selectedPath.to.hasAtmosphere
  }

  computeDeltaV () {
    if (this.selectedPath.from == null
      || this.selectedPath.to == null) {
      return
    }
    this.steps = [{
      type: StepType.takeOff,
      from: this.selectedPath.from,
      dv: this.selectedPath.from.dvGL
    }]
    this.total = null

    /**
     * Kerbin trip
     */
    if (this.isKerbinTrip) {
      this.computeKerbinToKerbin()
      this.astroPathService.pathChanged(this.selectedPath)
      return
    }

    /**
     * From Kerbin to Planet
     */
    if (this.selectedPath.from === this.kerbin && this.selectedPath.to.isPlanet) {
      this.computeKerbinToPlanet()
      this.computeTotal()
      this.astroPathService.pathChanged(this.selectedPath)
      return
    }

    /**
     * From Planet to Kerbin
     */
    if (this.selectedPath.from.isPlanet && this.selectedPath.to === this.kerbin) {
      this.computePlanetToKerbin()
      this.computeTotal()
      this.astroPathService.pathChanged(this.selectedPath)
      return
    }

    /**
     * From Kerbin to Satellite
     */
    if (this.selectedPath.from === this.kerbin && !this.selectedPath.to.isPlanet) {
      this.computeKerbinToSatellite()
      this.computeTotal()
      this.astroPathService.pathChanged(this.selectedPath)
      return
    }

    /**
     * From Satellite to Kerbin
     */
    if (!this.selectedPath.from.isPlanet && this.selectedPath.to === this.kerbin) {
      this.computeSatelliteToKerbin()
      this.computeTotal()
      this.astroPathService.pathChanged(this.selectedPath)
      return
    }
  }

  enterItem (step: Step) {
    this.astroPathService.selectionChanged(step)
  }

  leaveItem () {
    this.astroPathService.selectionChanged(null)
  }

  get isKerbinTrip (): boolean {
    return this.selectedPath.from === this.kerbin
      && this.selectedPath.to === this.kerbin
  }

  private computeKerbinToKerbin () {
    this.steps.push({
      type: StepType.transitToSOI,
      to: this.kerbin,
      dv: this.kerbin.dvLE
    }, {
      type: StepType.transitToKeostat,
      to: this.kerbin,
      dv: this.kerbin.dvKeostat
    })
  }

  private computeKerbinToPlanet () {
    const planet = this.selectedPath.to as Planet
    this.steps.push({
      type: StepType.transitToLowOrbit,
      to: this.selectedPath.to,
      dv: this.kerbin.transitToLowOrbit(planet)
    })
  }

  private computePlanetToKerbin () {
    const planet = this.selectedPath.from as Planet
    this.steps.push({
      type: StepType.transitToLowOrbit,
      to: this.kerbin,
      dv: this.kerbin.transitToLowOrbit(planet)
    })
  }

  private computeKerbinToSatellite () {
    const satellite = this.selectedPath.to as Satellite
    if (this.isKerbinSatellite(satellite)) {
      this.steps.push({
        type: StepType.transitFromLowToLow,
        from: this.kerbin,
        to: satellite,
        dv: satellite.dvPL + satellite.dvLI
      })
    } else {
      const planet = (this.options.find((body) => body.name === satellite.parent)) as Planet
      this.steps.push({
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

  private computeSatelliteToKerbin () {
    const satellite = this.selectedPath.from as Satellite
    if (this.isKerbinSatellite(satellite)) {
      this.steps.push({
        type: StepType.transitFromLowToLow,
        from: satellite,
        to: this.kerbin,
        dv: satellite.dvPL + satellite.dvLI
      })
    } else {
      const planet = (this.options.find((body) => body.name === satellite.parent)) as Planet
      this.steps.push({
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

  private computeTotal () {
    /**
     * Landing
     */
    if (this.selectedPath.landing) {
      this.steps.push({
        type: StepType.landing,
        to: this.selectedPath.to,
        dv: this.selectedPath.to.dvGL
      })
    }

    /**
     * Return
     */
    if (this.return) {
      this.steps.push({
        type: StepType.return,
        from: this.selectedPath.to,
        to: this.selectedPath.from,
        dv: this.steps.map(step => step.dv).reduce((dv1, dv2) => dv1 + dv2)
      })
    }

    /**
     * Total
     */
    this.total = {
      type: StepType.total,
      dv: this.steps.map(step => step.dv).reduce((dv1, dv2) => dv1 + dv2)
    }
  }

  private isKerbinSatellite (satellite: Satellite) {
    return ['Mun', 'Minmus'].includes(satellite.name)
  }

}
