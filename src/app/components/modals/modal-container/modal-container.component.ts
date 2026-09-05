import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'ksp-modal-container',
  template: '',
  styleUrl: './modal-container.component.less'
})
export class ModalContainerComponent {
  private readonly modalService = inject(NgbModal);

  private readonly currentDialog: NgbModalRef;

  constructor() {
    const route = inject(ActivatedRoute);
    const router = inject(Router);

    this.currentDialog = this.modalService.open(route.snapshot.data['component'], { size: 'xl', scrollable: true });
    this.currentDialog.result.then(() => {
      router.navigateByUrl('/').then();
    }, () => {
      router.navigateByUrl('/').then();
    });
  }

}
