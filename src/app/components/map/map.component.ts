import {
  AfterViewInit,
  Component,
  effect,
  inject,
  signal
} from '@angular/core';
import * as d3 from 'd3-selection';

import { AstroPathService } from '../../services/astro-path.service';
import { StepSelectionService } from '../../services/step-selection.service';
import { AstroPath } from '../../models/planet.model';
import { Step, StepType } from '../../models/step.model';

@Component({
  selector: 'ksp-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.less'
})
export class MapComponent implements AfterViewInit {
  private readonly astroPathService = inject(AstroPathService);
  private readonly stepSelectionService = inject(StepSelectionService);

  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown> | null = null;
  private currentPath: AstroPath | null = null;
  private readonly viewReady = signal(false);
  private readonly suffixHub: string[];
  private readonly suffixLow: string[];
  private readonly suffixLanding: string[];
  private readonly suffixStepGround: string[];
  private readonly suffixStepSOI: string[];
  private readonly suffixStepLow: string[];

  constructor() {
    this.suffixHub = ['transit', 'hub', 'com'];
    this.suffixLow = this.suffixHub.concat(['transit-low', 'low']);
    this.suffixLanding = this.suffixLow.concat(['ground']);

    this.suffixStepGround = ['ground', 'low', 'com'];
    this.suffixStepSOI = ['transit', 'hub'];
    this.suffixStepLow = this.suffixStepSOI.concat(['transit-low', 'low']);

    effect(() => {
      const path = this.astroPathService.path();
      const selection = this.stepSelectionService.selection();
      if (!this.viewReady()) {
        return;
      }

      this.currentPath = path;
      if (selection == null) {
        this.pathChanged({ soft: false });
      } else {
        this.selectionChanged(selection);
      }
    });
  }

  ngAfterViewInit(): void {
    this.svg = d3.select<SVGSVGElement, unknown>('svg');
    this.viewReady.set(true);
  }

  private fadeAll(): void {
    const svg = this.svg;
    if (svg == null) {
      return;
    }

    svg.selectAll('.dv-map')
      .classed('fade-soft', false)
      .classed('map-fade', true);
  }

  private showAll(): void {
    const svg = this.svg;
    if (svg == null) {
      return;
    }

    svg.selectAll('.dv-map')
      .classed('map-fade', false)
      .classed('fade-soft', false);
  }

  private pathChanged(options: { soft: boolean }): void {
    const path = this.currentPath;
    const svg = this.svg;
    if (path == null || svg == null) {
      return;
    }

    // not a full path
    if (path.from == null || path.to == null) {
      this.showAll();
      return;
    }

    // init
    this.fadeAll();
    const fromName = path.from.name.toLowerCase();
    const toName = path.to.name.toLowerCase();
    const suffixTo = path.landing ? this.suffixLanding : this.suffixLow;

    // build ids
    let idsToShow = [
      'hub',
      fromName,
      toName,
      ...this.suffixLanding.map(suffix => `${fromName}-${suffix}`),
      ...suffixTo.map(suffix => `${toName}-${suffix}`)
    ];

    // destination is a satellite
    if (!path.to.isPlanet) {
      const parentName = path.to.parent!.toLowerCase();
      idsToShow.push(...this.suffixHub.map(suffix => `${parentName}-${suffix}`));
    }
    if (!path.from.isPlanet) {
      const parentName = path.from.parent!.toLowerCase();
      idsToShow.push(...this.suffixHub.map(suffix => `${parentName}-${suffix}`));
    }

    // destination is mun or minmus
    if ([toName, fromName].includes('mun') || [toName, fromName].includes('minmus')) {
      idsToShow = idsToShow.filter((id) => id !== 'kerbin-transit-low' && id !== 'hub');
    }

    // kerbin trip
    if (toName === fromName) {
      idsToShow.push('kerbin-keostat');
    }

    // fade elements in svg
    idsToShow.forEach((id) => {
      svg.select(`#${id}`)
        .classed('map-fade', false);
    });
    if (options.soft) {
      idsToShow.forEach((id) => {
        svg.select(`#${id}`)
          .classed('fade-soft', true);
      });
    }
  }

  private selectionChanged(step: Step): void {
    const path = this.currentPath;
    const svg = this.svg;
    if (path?.from == null || path.to == null || svg == null) {
      return;
    }

    // step is total or return
    if (step.type === StepType.total || step.type === StepType.return) {
      return;
    }

    // init
    const pathFromName = path.from.name.toLowerCase();
    const pathToName = path.to.name.toLowerCase();
    let idsToShow: string[] = [];

    // build ids
    this.pathChanged({ soft: true });
    if (step.type === StepType.takeOff) {
      idsToShow = this.suffixStepGround.map((suffix) => `${pathFromName}-${suffix}`);
      idsToShow.push(pathFromName);
    } else if (step.type === StepType.landing) {
      idsToShow = this.suffixStepGround.map((suffix) => `${pathToName}-${suffix}`);
      idsToShow.push(pathToName);
    } else if (step.type === StepType.transitToLowOrbit) {
      idsToShow = [
        'hub',
        ...this.suffixStepLow.map(suffix => `${path.from!.isPlanet ?
          pathFromName : path.from!.parent!.toLowerCase()}-${suffix}`),
        ...this.suffixStepLow.map(suffix => `${pathToName}-${suffix}`)
      ];
    } else if (step.type === StepType.transitToSOI) {
      idsToShow = [
        'hub',
        ...this.suffixStepLow.map(suffix => `${pathFromName}-${suffix}`),
        ...this.suffixStepSOI.map(suffix => `${step.to!.name.toLowerCase()}-${suffix}`)
      ];
    } else if (step.type === StepType.transitFromSOIToLow) {
      idsToShow = [
        `${step.from!.name.toLowerCase()}-hub`,
        ...this.suffixStepLow.map(suffix => `${step.to!.name.toLowerCase()}-${suffix}`)
      ];
    } else if (step.type === StepType.transitFromLowToSOI) {
      idsToShow = [
        `${step.to!.name.toLowerCase()}-hub`,
        ...this.suffixStepLow.map(suffix => `${step.from!.name.toLowerCase()}-${suffix}`)
      ];
    } else if (step.type === StepType.transitFromLowToLow) {
      // mun or minmus
      idsToShow = [
        ...this.suffixStepLow.map(suffix => `${pathFromName}-${suffix}`),
        ...this.suffixStepLow.map(suffix => `${pathToName}-${suffix}`)
      ];
    } else if (step.type === StepType.transitToKeostat) {
      idsToShow = [
        'kerbin-low',
        'kerbin-keostat'
      ];
    }

    // fade elements in svg
    idsToShow.forEach((id) => {
      svg.select(`#${id}`)
        .classed('fade-soft', false);
    });
  }
}
