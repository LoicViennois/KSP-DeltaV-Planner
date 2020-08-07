import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { InfoComponent } from './components/modals/info/info.component'
import { CopyrightComponent } from './components/modals/copyright/copyright.component'
import { ModalContainerComponent } from './components/modals/modal-container/modal-container.component'


const routes: Routes = [
  {
    path: 'information',
    component: ModalContainerComponent,
    data: { component: InfoComponent }
  },
  {
    path: 'copyright',
    component: ModalContainerComponent,
    data: { component: CopyrightComponent }
  },
  {
    path: '',
    children: []
  },
  {
    path: '**',
    redirectTo: '',
  },
]


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
