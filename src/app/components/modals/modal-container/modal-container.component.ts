import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';


@Component({
  selector: 'ksp-modal-container',
  template: '',
  styleUrls: ['./modal-container.component.less']
})
export class ModalContainerComponent {
  currentDialog: NgbModalRef;

  constructor(
    private modalService: NgbModal,
    route: ActivatedRoute,
    router: Router
  ) {
    this.currentDialog = this.modalService.open(route.snapshot.data.component, { size: 'xl', scrollable: true });
    this.currentDialog.result.then(() => {
      router.navigateByUrl('/').then();
    }, () => {
      router.navigateByUrl('/').then();
    });
  }

}
