import { Component, Input, OnInit } from '@angular/core';
import { Step } from '../../../models/step.model';

@Component({
  selector: 'ksp-dv-pill',
  templateUrl: './dv-pill.component.html',
  styleUrls: ['./dv-pill.component.less']
})
export class DvPillComponent implements OnInit {
  @Input() step: Step;

  constructor() {
  }

  get dvMax(): boolean {
    return (this.step.dvMax != null) && (this.step.dv !== this.step.dvMax);
  }

  ngOnInit(): void {
    return;
  }

}
