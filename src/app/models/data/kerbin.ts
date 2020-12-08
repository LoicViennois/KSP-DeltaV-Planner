import { Planet } from '../planet.model';

export class Kerbin implements Planet {
  readonly name = 'Kerbin';
  readonly isPlanet = true;
  readonly hasAtmosphere = true;
  readonly canLand = true;
  readonly imageUrl = 'assets/planets/kerbin.webp';
  readonly dvGL = 3400;
  readonly dvLE = 950;
  readonly dvK = null;
  readonly dvPlaneChange = null;
  readonly dvKeostat = 1115;
  readonly color = '#2A7EFE';
  readonly satellites = [
    {
      name: 'Mun',
      isPlanet: false,
      hasAtmosphere: false,
      canLand: true,
      imageUrl: 'assets/planets/mun.webp',
      parent: 'Kerbin',
      dvGL: 580,
      dvLI: 310,
      dvPL: 860,
      dvPlaneChange: 0,
      color: '#7F7F80',
    },
    {
      name: 'Minmus',
      isPlanet: false,
      hasAtmosphere: false,
      canLand: true,
      imageUrl: 'assets/planets/minmus.webp',
      parent: 'Kerbin',
      dvGL: 180,
      dvLI: 160,
      dvPL: 930,
      dvPlaneChange: 340,
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
