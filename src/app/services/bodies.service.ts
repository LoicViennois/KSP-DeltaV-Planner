import { Injectable } from '@angular/core'

import { AstroBody } from '../models/planet.model'
import { planets } from '../models/data/planets'
import { Kerbin } from '../models/data/kerbin'

@Injectable({
  providedIn: 'root'
})
export class BodiesService {
  readonly bodies: AstroBody[]
  readonly kerbin: Kerbin

  constructor () {
    const bodies: AstroBody[] = []
    for (const planet of planets) {
      bodies.push(planet)
      for (const satellite of planet.satellites) {
        bodies.push(satellite)
      }
    }
    this.bodies = bodies
    this.kerbin = this.bodies.find(body => body.name === 'Kerbin') as Kerbin
  }
}
