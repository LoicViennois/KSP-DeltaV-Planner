import { Component, Input } from '@angular/core';

import { Step, StepType } from '../../../models/step.model';

@Component({
  selector: 'ksp-step-message',
  templateUrl: './step-message.component.html',
  styleUrls: ['./step-message.component.less']
})
export class StepMessageComponent {
  @Input() step: Step;
  readonly stepType = StepType;

  constructor() {
  }

}
