import { Component, OnDestroy, OnInit } from '@angular/core'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { AstroBody, AstroPath } from '../../models/planet.model'
import { Step, StepType } from '../../models/step.model'
import { Kerbin } from '../../models/data/kerbin'
import { AstroPathService } from '../../services/astro-path.service'
import { StepSelectionService } from '../../services/step-selection.service'
import { BodiesService } from '../../services/bodies.service'

@Component({
  selector: 'ksp-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.less']
})
export class PanelComponent implements OnInit, OnDestroy {
  path: AstroPath

  private readonly unsubscribe = new Subject<void>()

  get kerbin (): Kerbin {
    return this.bodiesService.kerbin
  }

  get options (): AstroBody[] {
    return this.bodiesService.bodies
  }

  get steps (): Step[] {
    return this.path.steps
  }

  constructor (public readonly astroPathService: AstroPathService,
               public readonly stepSelectionService: StepSelectionService,
               private readonly bodiesService: BodiesService) {
  }

  ngOnInit () {
    this.astroPathService.getPath()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(p => {
        this.path = p
      })
    this.astroPathService.reset()
  }

  ngOnDestroy () {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }

  pathFromChanged () {
    if (this.path.from.name !== 'Kerbin') {
      this.path.to = this.kerbin
    }
    this.astroPathService.pathChanged(this.path)
  }

  pathToChanged () {
    if (this.path.to.name !== 'Kerbin') {
      this.path.from = this.kerbin
    }
    this.astroPathService.pathChanged(this.path)
  }

  landingInAtmosphere (step: Step): boolean {
    return step.type === StepType.landing && this.path.to.hasAtmosphere
  }

}
