import { Component, Input } from '@angular/core';

import { Step, StepType } from '../../../models/step.model';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'ksp-step-message',
    templateUrl: './step-message.component.html',
    styleUrls: ['./step-message.component.less'],
    imports: [NgStyle]
})
export class StepMessageComponent {
  @Input() step: Step;
  readonly stepType = StepType;
}
