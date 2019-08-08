import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'

import { AstroPath } from '../models/planet.model'
import { Step } from '../models/step.model'

@Injectable({
  providedIn: 'root'
})
export class AstroPathService {
  private path: Subject<AstroPath>
  private step: Subject<Step>

  constructor () {
    this.path = new Subject()
    this.step = new Subject()
  }

  getPath (): Observable<AstroPath> {
    return this.path.asObservable()
  }

  pathChanged (path: AstroPath) {
    this.path.next(path)
  }

  getSelection (): Observable<Step> {
    return this.step.asObservable()
  }

  selectionChanged (step: Step) {
    this.step.next(step)
  }
}
