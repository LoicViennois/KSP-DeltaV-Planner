import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { environment } from '../../../../environments/environment';


@Component({
    selector: 'ksp-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.less']
})
export class AboutComponent {
  activeModal = inject(NgbActiveModal);

  readonly version: string = environment.version;

}

