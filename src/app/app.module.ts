import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbDropdownModule, NgbPopoverModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { MapComponent } from './components/map/map.component';
import { PanelComponent } from './components/panel/panel.component';
import { StepMessageComponent } from './components/panel/step-message/step-message.component';
import { CopyrightComponent } from './components/modals/copyright/copyright.component';
import { InfoComponent } from './components/modals/info/info.component';
import { ModalContainerComponent } from './components/modals/modal-container/modal-container.component';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';

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
    InfoComponent,
    ModalContainerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    NgbDropdownModule,
    NgbPopoverModule,
    NgbModalModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
