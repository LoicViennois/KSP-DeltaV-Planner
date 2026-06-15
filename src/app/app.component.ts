import { Component } from '@angular/core';
import { MapComponent } from './components/map/map.component';
import { PanelComponent } from './components/panel/panel.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'ksp-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less'],
    imports: [MapComponent, PanelComponent, RouterOutlet]
})
export class AppComponent {
}
