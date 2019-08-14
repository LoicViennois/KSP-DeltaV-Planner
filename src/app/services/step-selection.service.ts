import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'
import { Step } from '../models/step.model'

@Injectable({
  providedIn: 'root'
})
export class StepSelectionService {
  private readonly step: Subject<Step>

  constructor () {
    this.step = new Subject()
  }

  getSelection (): Observable<Step> {
    return this.step.asObservable()
  }

  selectionChanged (step: Step) {
    this.step.next(step)
  }
}
