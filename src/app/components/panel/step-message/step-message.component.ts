import { Component, input } from '@angular/core';

import { Step, StepType } from '../../../models/step.model';

@Component({
  selector: 'ksp-step-message',
  templateUrl: './step-message.component.html',
  styleUrl: './step-message.component.less'
})
export class StepMessageComponent {
  readonly step = input.required<Step>();
  readonly stepType = StepType;
}
