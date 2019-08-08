import { Component, Input, OnInit } from '@angular/core'

import { Step, StepType } from '../../../models/step.model'

@Component({
  selector: 'ksp-step-message',
  templateUrl: './step-message.component.html',
  styleUrls: ['./step-message.component.less']
})
export class StepMessageComponent implements OnInit {
  @Input() step: Step
  stepType = StepType

  constructor () {
  }

  ngOnInit () {
  }

}
