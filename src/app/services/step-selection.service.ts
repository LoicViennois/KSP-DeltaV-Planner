import { Service, signal } from '@angular/core';
import { Step } from '../models/step.model';

@Service()
export class StepSelectionService {
  private readonly selectionState = signal<Step | null>(null);
  readonly selection = this.selectionState.asReadonly();

  selectionChanged(step: Step | null): void {
    this.selectionState.set(step);
  }
}
