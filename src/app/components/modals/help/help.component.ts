import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'ksp-help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.less'],
    standalone: false
})
export class HelpComponent {
  constructor(public activeModal: NgbActiveModal) {
  }

}
