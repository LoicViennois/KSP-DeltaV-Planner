import { Component, OnDestroy, OnInit } from '@angular/core'
import * as d3 from 'd3-selection'
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs'

import { AstroPathService } from '../../services/astro-path.service'
import { AstroPath } from '../../models/planet.model'
import { Step, StepType } from '../../models/step.model'

@Component({
  selector: 'ksp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit, OnDestroy {
  private svg
  private unsubscribe = new Subject<void>()
  private suffixHub: string[]
  private suffixLow: string[]
  private suffixLanding: string[]
  private suffixStepGround: string[]
  private suffixStepSOI: string[]
  private suffixStepLow: string[]
  private path: AstroPath

  constructor (private astroPathService: AstroPathService) {
    this.suffixHub = ['transit', 'hub', 'com']
    this.suffixLow = this.suffixHub.concat(['transit-low', 'low'])
    this.suffixLanding = this.suffixLow.concat(['ground'])

    this.suffixStepGround = ['ground', 'low', 'com']
    this.suffixStepSOI = ['transit', 'hub']
    this.suffixStepLow = this.suffixStepSOI.concat(['transit-low', 'low'])
  }

  ngOnInit () {
    this.svg = d3.select('svg')
    this.astroPathService.getPath()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((p) => {
        this.path = p
        this.pathChanged({ soft: false })
      })
    this.astroPathService.getSelection()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((s) => this.selectionChanged(s))
  }

  ngOnDestroy () {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }

  private fadeAll () {
    this.svg.selectAll('.dv-map')
      .classed('fade-soft', false)
      .classed('fade', true)
  }

  private showAll () {
    this.svg.selectAll('.dv-map')
      .classed('fade', false)
    this.svg.selectAll('.dv-map')
      .classed('soft-fade', false)
  }

  private pathChanged (options: { soft: boolean }) {
    // not a full path
    if (this.path.from == null || this.path.to == null) {
      this.showAll()
      return
    }

    // init
    this.fadeAll()
    const fromName = this.path.from.name.toLowerCase()
    const toName = this.path.to.name.toLowerCase()
    const suffixTo = this.path.landing ? this.suffixLanding : this.suffixLow

    // build ids
    let idsToShow = [
      'hub',
      fromName,
      toName,
      ...this.suffixLanding.map(suffix => `${fromName}-${suffix}`),
      ...suffixTo.map(suffix => `${toName}-${suffix}`)
    ]

    // destination is a satellite
    if (!this.path.to.isPlanet) {
      const parentName = this.path.to.parent.toLowerCase()
      idsToShow.push(...this.suffixHub.map(suffix => `${parentName}-${suffix}`))
    }
    if (!this.path.from.isPlanet) {
      const parentName = this.path.from.parent.toLowerCase()
      idsToShow.push(...this.suffixHub.map(suffix => `${parentName}-${suffix}`))
    }

    // destination is mun or minmus
    if ([toName, fromName].includes('mun') || [toName, fromName].includes('minmus')) {
      idsToShow = idsToShow.filter((id) => id !== 'kerbin-transit-low' && id !== 'hub')
    }

    // kerbin trip
    if (toName === fromName) {
      idsToShow.push('kerbin-keostat')
    }

    // fade elements in svg
    idsToShow.forEach((id) => {
      this.svg.select(`#${id}`)
        .classed('fade', false)
    })
    if (options.soft) {
      idsToShow.forEach((id) => {
        this.svg.select(`#${id}`)
          .classed('fade-soft', true)
      })
    }
  }

  private selectionChanged (step: Step) {
    // selection cleared (on mouse leave)
    if (step == null) {
      this.pathChanged({ soft: false })
      return
    }

    // step is total or return
    if (step.type === StepType.total || step.type === StepType.return) {
      return
    }

    // init
    const pathFromName = this.path.from.name.toLowerCase()
    const pathToName = this.path.to.name.toLowerCase()
    let idsToShow = []

    // build ids
    this.pathChanged({ soft: true })
    if (step.type === StepType.takeOff) {
      idsToShow = this.suffixStepGround.map((suffix) => `${pathFromName}-${suffix}`)
      idsToShow.push(pathFromName)
    } else if (step.type === StepType.landing) {
      idsToShow = this.suffixStepGround.map((suffix) => `${pathToName}-${suffix}`)
      idsToShow.push(pathToName)
    } else if (step.type === StepType.transitToLowOrbit) {
      idsToShow = [
        'hub',
        ...this.suffixStepLow.map(suffix => `${this.path.from.isPlanet ?
          pathFromName : this.path.from.parent.toLowerCase()}-${suffix}`),
        ...this.suffixStepLow.map(suffix => `${pathToName}-${suffix}`)
      ]
    } else if (step.type === StepType.transitToSOI) {
      idsToShow = [
        'hub',
        ...this.suffixStepLow.map(suffix => `${pathFromName}-${suffix}`),
        ...this.suffixStepSOI.map(suffix => `${step.to.name.toLowerCase()}-${suffix}`)
      ]
    } else if (step.type === StepType.transitFromSOIToLow) {
      idsToShow = [
        `${step.from.name.toLowerCase()}-hub`,
        ...this.suffixStepLow.map(suffix => `${step.to.name.toLowerCase()}-${suffix}`)
      ]
    } else if (step.type === StepType.transitFromLowToSOI) {
      idsToShow = [
        `${step.to.name.toLowerCase()}-hub`,
        ...this.suffixStepLow.map(suffix => `${step.from.name.toLowerCase()}-${suffix}`)
      ]
    } else if (step.type === StepType.transitFromLowToLow) {
      // mun or minmus
      idsToShow = [
        ...this.suffixStepLow.map(suffix => `${pathFromName}-${suffix}`),
        ...this.suffixStepLow.map(suffix => `${pathToName}-${suffix}`)
      ]
    } else if (step.type === StepType.transitToKeostat) {
      idsToShow = [
        'kerbin-low',
        'kerbin-keostat'
      ]
    }

    // fade elements in svg
    idsToShow.forEach((id) => {
      this.svg.select(`#${id}`)
        .classed('fade-soft', false)
    })
  }
}
