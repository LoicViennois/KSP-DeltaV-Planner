import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ksp-help',
  templateUrl: './help.component.html',
  styleUrl: './help.component.less'
})
export class HelpComponent {
  activeModal = inject(NgbActiveModal);

}
