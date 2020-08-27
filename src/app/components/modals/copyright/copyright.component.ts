import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { environment } from '../../../../environments/environment';


@Component({
  selector: 'ksp-copyright',
  templateUrl: './copyright.component.html',
  styleUrls: ['./copyright.component.less']
})
export class CopyrightComponent {
  readonly version: string = environment.version;

  constructor(public activeModal: NgbActiveModal) {
  }

}

