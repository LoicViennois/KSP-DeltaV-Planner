import { Component, Input } from '@angular/core';

import { FullStep, Step, StepType } from '../../../models/step.model';

@Component({
  selector: 'ksp-step-message',
  templateUrl: './step-message.component.html',
  styleUrls: ['./step-message.component.less']
})
export class StepMessageComponent {
  @Input() step!: Step | FullStep;
  readonly stepType = StepType;

  constructor() {
  }

  get stepFromColor(): string {
    return (this.step as FullStep).from.color;
  }

  get stepToColor(): string {
    return (this.step as FullStep).to.color;
  }

  get stepFromName(): string {
    return (this.step as FullStep).from.name;
  }

  get stepToName(): string {
    return (this.step as FullStep).to.name;
  }

}
