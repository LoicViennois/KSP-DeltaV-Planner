import { Component, computed, inject } from '@angular/core';

import { AstroBody, AstroPath } from '../../models/planet.model';
import { Step, StepType } from '../../models/step.model';
import { Kerbin } from '../../models/data/kerbin';
import { AstroPathService } from '../../services/astro-path.service';
import { StepSelectionService } from '../../services/step-selection.service';
import { BodiesService } from '../../services/bodies.service';
import { RouterLink } from '@angular/router';
import { NgbDropdown, NgbDropdownToggle, NgbDropdownMenu, NgbDropdownButtonItem, NgbDropdownItem, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { StepMessageComponent } from './step-message/step-message.component';
import { DvPillComponent } from './dv-pill/dv-pill.component';

@Component({
  selector: 'ksp-panel',
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.less',
  imports: [RouterLink, NgbDropdown, NgbDropdownToggle, NgbDropdownMenu, NgbDropdownButtonItem, NgbDropdownItem, FormsModule, StepMessageComponent, NgbPopover, DvPillComponent]
})
export class PanelComponent {
  readonly astroPathService = inject(AstroPathService);
  readonly stepSelectionService = inject(StepSelectionService);
  private readonly bodiesService = inject(BodiesService);

  readonly path = this.astroPathService.path;
  readonly steps = computed(() => this.path().steps);

  get kerbin(): Kerbin {
    return this.bodiesService.kerbin;
  }

  get options(): AstroBody[] {
    return this.bodiesService.bodies;
  }

  constructor() {
    this.astroPathService.reset();
  }

  pathFromChanged(body: AstroBody): void {
    const path = { ...this.path(), from: body };
    if (body.name !== 'Kerbin') {
      path.to = this.kerbin;
    }
    this.astroPathService.pathChanged(path);
  }

  pathToChanged(body: AstroBody): void {
    const path = { ...this.path(), to: body };
    if (body.name !== 'Kerbin') {
      path.from = this.kerbin;
    }
    this.astroPathService.pathChanged(path);
  }

  updateOptions(options: Partial<Pick<AstroPath, 'landing' | 'aerobraking' | 'return'>>): void {
    this.astroPathService.pathChanged({ ...this.path(), ...options });
  }

  landingInAtmosphere(step: Step): boolean {
    return step.type === StepType.landing && this.path().to?.hasAtmosphere === true;
  }

}
