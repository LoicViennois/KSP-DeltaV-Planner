import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ServiceWorkerModule } from '@angular/service-worker'
import { SuiModule } from 'ng2-semantic-ui'

import { AppComponent } from './app.component'
import { MapComponent } from './components/map/map.component'
import { PanelComponent } from './components/panel/panel.component'
import { StepMessageComponent } from './components/panel/step-message/step-message.component'
import { CopyrightComponent } from './components/modals/copyright/copyright.component'
import { InfoComponent } from './components/modals/info/info.component'

import { environment } from '../environments/environment'
import { AppRoutingModule } from './app-routing.module'

@NgModule({
  entryComponents: [
    CopyrightComponent,
    InfoComponent
  ],
  declarations: [
    AppComponent,
    MapComponent,
    PanelComponent,
    StepMessageComponent,
    CopyrightComponent,
    InfoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    SuiModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
