import { Planet } from '../planet.model'

export class Kerbin implements Planet {
  name = 'Kerbin'
  isPlanet = true
  hasAtmosphere = true
  canLand = true
  imageUrl = 'assets/planets/kerbin.png'
  dvGL = 3400
  dvLE = 950
  dvKeostat = 1115
  color = '#2A7EFE'
  satellites = [
    {
      name: 'Mun',
      isPlanet: false,
      hasAtmosphere: false,
      canLand: true,
      imageUrl: 'assets/planets/mun.png',
      parent: 'Kerbin',
      dvGL: 580,
      dvLI: 310,
      dvPL: 860,
      color: '#7F7F80',
    },
    {
      name: 'Minmus',
      isPlanet: false,
      hasAtmosphere: false,
      canLand: true,
      imageUrl: 'assets/planets/minmus.png',
      parent: 'Kerbin',
      dvGL: 180,
      dvLI: 160,
      dvPL: 930,
      color: '#51C47F',
    }
    ]

  transitToLowOrbit (planet: Planet): number {
    return this.dvLE + planet.dvK + (planet.dvLI || planet.dvLE + planet.dvEI)
  }

  transitToSOI (planet: Planet): number {
    return this.dvLE + planet.dvK + planet.dvEI
  }
}
