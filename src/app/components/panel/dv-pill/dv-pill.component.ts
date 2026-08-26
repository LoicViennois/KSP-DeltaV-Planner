import { Component, computed, input } from '@angular/core';
import { Step } from '../../../models/step.model';

@Component({
  selector: 'ksp-dv-pill',
  templateUrl: './dv-pill.component.html',
  styleUrl: './dv-pill.component.less'
})
export class DvPillComponent {
  readonly step = input.required<Step>();

  readonly dvMax = computed(() => {
    const step = this.step();
    return step.dvMax != null && step.dv !== step.dvMax;
  });

}
