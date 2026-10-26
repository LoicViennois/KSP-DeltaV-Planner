interface BaseBody {
  readonly name: string;
  readonly hasAtmosphere: boolean;
  readonly canLand: boolean;
  readonly imageUrl: string;
  /** Ground <-> low orbit */
  readonly dvGL: number;
  /** Low orbit <-> intercept */
  readonly dvLI?: number;
  /** Maximum plane change */
  readonly dvPlaneChange: number | null;
  readonly color: string;
}

export interface Planet extends BaseBody {
  readonly isPlanet: true;
  /** Low orbit <-> elliptical orbit to SOI edge */
  readonly dvLE?: number;
  /** Elliptical orbit to SOI edge <-> intercept */
  readonly dvEI?: number;
  /** Intercept <-> Kerbin elliptical orbit to SOI edge */
  readonly dvK: number | null;
  readonly satellites: readonly Satellite[];
}

export interface Satellite extends BaseBody {
  readonly isPlanet: false;
  readonly parent: string;
  /** Intercept <-> parent body low orbit */
  readonly dvPL?: number;
  /** Intercept <-> parent body elliptical orbit to SOI edge */
  readonly dvPE?: number;
}

export type AstroBody = Planet | Satellite;

export interface HomePlanet extends Planet {
  readonly dvLE: number;
  /** Low orbit <-> keostationary orbit */
  readonly dvKeostat: number;
}

const image = (name: string) => `/planets/${name.toLowerCase()}.webp`;

export const kerbin: HomePlanet = {
  name: 'Kerbin',
  isPlanet: true,
  hasAtmosphere: true,
  canLand: true,
  imageUrl: image('Kerbin'),
  dvGL: 3400,
  dvLE: 950,
  dvK: null,
  dvPlaneChange: null,
  dvKeostat: 1115,
  color: '#2A7EFE',
  satellites: [
    {
      name: 'Mun',
      isPlanet: false,
      hasAtmosphere: false,
      canLand: true,
      imageUrl: image('Mun'),
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
      imageUrl: image('Minmus'),
      parent: 'Kerbin',
      dvGL: 180,
      dvLI: 160,
      dvPL: 930,
      dvPlaneChange: 340,
      color: '#51C47F',
    },
  ],
};

export const planets: readonly Planet[] = [
  {
    name: 'Moho',
    isPlanet: true,
    hasAtmosphere: false,
    canLand: true,
    imageUrl: image('Moho'),
    dvGL: 870,
    dvLI: 2410,
    dvK: 760,
    dvPlaneChange: 2520,
    satellites: [],
    color: '#D38D5F',
  },
  {
    name: 'Eve',
    isPlanet: true,
    hasAtmosphere: true,
    canLand: true,
    imageUrl: image('Eve'),
    dvGL: 8000,
    dvLE: 1330,
    dvEI: 80,
    dvK: 90,
    dvPlaneChange: 430,
    color: '#7137c7',
    satellites: [
      {
        name: 'Gilly',
        isPlanet: false,
        hasAtmosphere: false,
        canLand: true,
        imageUrl: image('Gilly'),
        parent: 'Eve',
        dvGL: 30,
        dvLI: 410,
        dvPE: 60,
        dvPlaneChange: 0,
        color: '#8a5cd1',
      },
    ],
  },
  kerbin,
  {
    name: 'Duna',
    isPlanet: true,
    hasAtmosphere: true,
    canLand: true,
    imageUrl: image('Duna'),
    dvGL: 1450,
    dvLE: 360,
    dvEI: 250,
    dvK: 130,
    dvPlaneChange: 10,
    color: '#fd4001',
    satellites: [
      {
        name: 'Ike',
        isPlanet: false,
        hasAtmosphere: false,
        canLand: true,
        imageUrl: image('Ike'),
        parent: 'Duna',
        dvGL: 390,
        dvLI: 180,
        dvPE: 30,
        dvPlaneChange: 0,
        color: '#fd612c',
      },
    ],
  },
  {
    name: 'Dres',
    isPlanet: true,
    hasAtmosphere: false,
    canLand: true,
    imageUrl: image('Dres'),
    dvGL: 430,
    dvLI: 1290,
    dvK: 610,
    dvPlaneChange: 1010,
    satellites: [],
    color: '#989898',
  },
  {
    name: 'Jool',
    isPlanet: true,
    hasAtmosphere: true,
    canLand: false,
    imageUrl: image('Jool'),
    dvGL: 14000,
    dvLE: 2810,
    dvEI: 160,
    dvK: 980,
    dvPlaneChange: 270,
    color: '#71c737',
    satellites: [
      {
        name: 'Laythe',
        isPlanet: false,
        hasAtmosphere: true,
        canLand: true,
        imageUrl: image('Laythe'),
        parent: 'Jool',
        dvGL: 2900,
        dvLI: 1070,
        dvPE: 930,
        dvPlaneChange: 0,
        color: '#87c75d',
      },
      {
        name: 'Vall',
        isPlanet: false,
        hasAtmosphere: false,
        canLand: true,
        imageUrl: image('Vall'),
        parent: 'Jool',
        dvGL: 860,
        dvLI: 910,
        dvPE: 620,
        dvPlaneChange: 0,
        color: '#6aae3c',
      },
      {
        name: 'Tylo',
        isPlanet: false,
        hasAtmosphere: false,
        canLand: true,
        imageUrl: image('Tylo'),
        parent: 'Jool',
        dvGL: 2270,
        dvLI: 1100,
        dvPE: 400,
        dvPlaneChange: 0,
        color: '#5a9333',
      },
      {
        name: 'Bop',
        isPlanet: false,
        hasAtmosphere: false,
        canLand: true,
        imageUrl: image('Bop'),
        parent: 'Jool',
        dvGL: 230,
        dvLI: 900,
        dvPE: 220,
        dvPlaneChange: 2440,
        color: '#416a24',
      },
      {
        name: 'Pol',
        isPlanet: false,
        hasAtmosphere: false,
        canLand: true,
        imageUrl: image('Pol'),
        parent: 'Jool',
        dvGL: 130,
        dvLI: 820,
        dvPE: 160,
        dvPlaneChange: 700,
        color: '#2d4a19',
      },
    ],
  },
  {
    name: 'Eeloo',
    isPlanet: true,
    hasAtmosphere: false,
    canLand: true,
    imageUrl: image('Eeloo'),
    dvGL: 620,
    dvLI: 1370,
    dvK: 1140,
    dvPlaneChange: 1330,
    satellites: [],
    color: '#a9a9a9',
  },
  {
    // Not quite a planet, but it is reached like one.
    name: 'Kerbol',
    isPlanet: true,
    hasAtmosphere: true,
    canLand: false,
    imageUrl: image('Kerbol'),
    dvGL: 67000,
    dvLI: 13700,
    dvK: 6000,
    dvPlaneChange: 0,
    satellites: [],
    color: '#EFAB01',
  },
];

/** Every body, each planet followed by its satellites. */
export const bodies: readonly AstroBody[] = planets.flatMap((planet) => [
  planet,
  ...planet.satellites,
]);

export function parentOf(satellite: Satellite): Planet {
  const parent = planets.find((planet) => planet.name === satellite.parent);
  if (!parent) {
    throw new Error(`Unknown parent body ${satellite.parent}`);
  }
  return parent;
}

export function isKerbinSatellite(body: AstroBody): boolean {
  return !body.isPlanet && body.parent === kerbin.name;
}
