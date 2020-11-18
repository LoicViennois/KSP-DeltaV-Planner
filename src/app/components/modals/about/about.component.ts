import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { environment } from '../../../../environments/environment';


@Component({
  selector: 'ksp-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.less']
})
export class AboutComponent {
  readonly version: string = environment.version;

  constructor(public activeModal: NgbActiveModal) {
  }

}

