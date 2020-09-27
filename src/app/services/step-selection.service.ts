import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Step } from '../models/step.model';

@Injectable({
  providedIn: 'root'
})
export class StepSelectionService {
  private readonly step: Subject<Step | null>;

  constructor() {
    this.step = new Subject();
  }

  getSelection(): Observable<Step | null> {
    return this.step.asObservable();
  }

  selectionChanged(step: Step | null): void {
    this.step.next(step);
  }
}
