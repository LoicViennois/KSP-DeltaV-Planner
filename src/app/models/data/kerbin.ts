import { Planet } from '../planet.model';

export class Kerbin implements Planet {
  readonly name = 'Kerbin';
  readonly isPlanet = true;
  readonly hasAtmosphere = true;
  readonly canLand = true;
  readonly imageUrl = 'assets/planets/kerbin.png';
  readonly dvGL = 3400;
  readonly dvLE = 950;
  readonly dvKeostat = 1115;
  readonly color = '#2A7EFE';
  readonly satellites = [
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
  ];

  transitToLowOrbit(planet: Planet): number {
    return this.dvLE + planet.dvK + (planet.dvLI || planet.dvLE + planet.dvEI);
  }

  transitToSOI(planet: Planet): number {
    return this.dvLE + planet.dvK + planet.dvEI;
  }
}
