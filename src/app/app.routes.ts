import { Routes } from '@angular/router';

import { HelpComponent } from './components/modals/help/help.component';
import { AboutComponent } from './components/modals/about/about.component';
import { ModalContainerComponent } from './components/modals/modal-container/modal-container.component';


export const routes: Routes = [
  {
    path: 'help',
    component: ModalContainerComponent,
    data: { component: HelpComponent }
  },
  {
    path: 'about',
    component: ModalContainerComponent,
    data: { component: AboutComponent }
  },
  {
    path: '',
    children: []
  },
  {
    path: '**',
    redirectTo: '',
  },
];
