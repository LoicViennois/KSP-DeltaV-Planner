import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { InfoComponent } from './components/modals/info/info.component'
import { CopyrightComponent } from './components/modals/copyright/copyright.component'


const routes: Routes = [
  {
    path: 'information',
    component: InfoComponent,
  },
  {
    path: 'copyright',
    component: CopyrightComponent,
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
