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
  /** The worst case of `dvK`, for a planet on an eccentric orbit */
  readonly dvKMax?: number;
  readonly satellites: readonly Satellite[];
}

export interface Satellite extends BaseBody {
  readonly isPlanet: false;
  readonly parent: string;
  /**
   * Intercept <-> parent body low orbit, for the satellites reached from the
   * low orbit of their planet rather than from the edge of its SOI.
   */
  readonly dvPL?: number;
  /** Intercept <-> parent body elliptical orbit to SOI edge */
  readonly dvPE?: number;
  /**
   * The satellite it orbits, for a moon of a moon (Tal around Wal); `parent`
   * stays the planet, whose low orbit its Δv starts from.
   */
  readonly orbits?: string;
}

export type AstroBody = Planet | Satellite;

export interface HomePlanet extends Planet {
  readonly dvLE: number;
  /** Low orbit <-> keostationary orbit */
  readonly dvKeostat: number;
}

const image = (name: string, format = 'webp') =>
  `/planets/${name.toLowerCase()}.${format}`;

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

const eeloo = planets.find((planet) => planet.name === 'Eeloo');
const kerbol = planets.find((planet) => planet.name === 'Kerbol');

/**
 * The bodies of the Outer Planets Mod (OPM), from its Δv map
 * (svg/DvMap_OPM.svg). Their satellites are reached from the low orbit of
 * their planet. OPM also moves Eeloo around Sarnus.
 */
const sarnus: Planet = {
  name: 'Sarnus',
  isPlanet: true,
  hasAtmosphere: true,
  canLand: false,
  imageUrl: image('Sarnus', 'svg'),
  dvGL: 20000,
  dvLE: 1580,
  dvEI: 1660,
  dvK: 1390,
  dvPlaneChange: 350,
  color: '#ff0080',
  satellites: [
    {
      name: 'Hale',
      isPlanet: false,
      hasAtmosphere: false,
      canLand: true,
      imageUrl: image('Hale', 'svg'),
      parent: 'Sarnus',
      dvGL: 40,
      dvLI: 450,
      dvPL: 540,
      dvPlaneChange: 70,
      color: '#77073e',
    },
    {
      name: 'Ovok',
      isPlanet: false,
      hasAtmosphere: false,
      canLand: true,
      imageUrl: image('Ovok', 'svg'),
      parent: 'Sarnus',
      dvGL: 70,
      dvLI: 400,
      dvPL: 650,
      dvPlaneChange: 100,
      color: '#a20a55',
    },
    {
      name: 'Eeloo',
      isPlanet: false,
      hasAtmosphere: false,
      canLand: true,
      imageUrl: eeloo?.imageUrl ?? image('Eeloo'),
      parent: 'Sarnus',
      dvGL: 540,
      dvLI: 490,
      dvPL: 1120,
      dvPlaneChange: 160,
      color: '#e20e77',
    },
    {
      name: 'Slate',
      isPlanet: false,
      hasAtmosphere: false,
      canLand: true,
      imageUrl: image('Slate', 'svg'),
      parent: 'Sarnus',
      dvGL: 2150,
      dvLI: 890,
      dvPL: 1460,
      dvPlaneChange: 155,
      color: '#f33c96',
    },
    {
      name: 'Tekto',
      isPlanet: false,
      hasAtmosphere: true,
      canLand: true,
      imageUrl: image('Tekto', 'svg'),
      parent: 'Sarnus',
      dvGL: 2600,
      dvLI: 350,
      dvPL: 1540,
      dvPlaneChange: 630,
      color: '#f66bb0',
    },
  ],
};

const urlum: Planet = {
  name: 'Urlum',
  isPlanet: true,
  hasAtmosphere: true,
  canLand: false,
  imageUrl: image('Urlum', 'svg'),
  dvGL: 9000,
  dvLE: 940,
  dvEI: 1490,
  dvK: 1600,
  dvPlaneChange: 100,
  color: '#6bd2ca',
  satellites: [
    {
      name: 'Polta',
      isPlanet: false,
      hasAtmosphere: false,
      canLand: true,
      imageUrl: image('Polta', 'svg'),
      parent: 'Urlum',
      dvGL: 640,
      dvLI: 440,
      dvPL: 620,
      dvPlaneChange: 100,
      color: '#247973',
    },
    {
      name: 'Priax',
      isPlanet: false,
      hasAtmosphere: false,
      canLand: true,
      imageUrl: image('Priax', 'svg'),
      parent: 'Urlum',
      dvGL: 260,
      dvLI: 460,
      dvPL: 620,
      dvPlaneChange: 100,
      color: '#38bcb2',
    },
    {
      name: 'Wal',
      isPlanet: false,
      hasAtmosphere: false,
      canLand: true,
      imageUrl: image('Wal', 'svg'),
      parent: 'Urlum',
      dvGL: 1200,
      dvLI: 810,
      dvPL: 900,
      dvPlaneChange: 75,
      color: '#82d9d3',
    },
    {
      // Reached from Urlum low orbit through Wal low orbit (900 + 810 + 380).
      name: 'Tal',
      isPlanet: false,
      hasAtmosphere: false,
      canLand: true,
      imageUrl: image('Tal', 'svg'),
      parent: 'Urlum',
      orbits: 'Wal',
      dvGL: 100,
      dvLI: 150,
      dvPL: 2090,
      dvPlaneChange: 112,
      color: '#9de1dd',
    },
  ],
};

const neidon: Planet = {
  name: 'Neidon',
  isPlanet: true,
  hasAtmosphere: true,
  canLand: false,
  imageUrl: image('Neidon', 'svg'),
  dvGL: 9000,
  dvLE: 1040,
  dvEI: 1340,
  dvK: 1700,
  dvPlaneChange: 110,
  color: '#5f15e1',
  satellites: [
    {
      name: 'Thatmo',
      isPlanet: false,
      hasAtmosphere: true,
      canLand: true,
      imageUrl: image('Thatmo', 'svg'),
      parent: 'Neidon',
      dvGL: 950,
      dvLI: 450,
      dvPL: 930,
      dvPlaneChange: 0,
      color: '#9d6cf4',
    },
    {
      name: 'Nissee',
      isPlanet: false,
      hasAtmosphere: false,
      canLand: true,
      imageUrl: image('Nissee', 'svg'),
      parent: 'Neidon',
      dvGL: 850,
      dvLI: 360,
      dvPL: 1000,
      dvPlaneChange: 0,
      color: '#bf9ff8',
    },
  ],
};

const plock: Planet = {
  name: 'Plock',
  isPlanet: true,
  hasAtmosphere: false,
  canLand: true,
  imageUrl: image('Plock', 'svg'),
  dvGL: 480,
  dvLE: 210,
  dvEI: 900,
  // Along its eccentric orbit.
  dvK: 1900,
  dvKMax: 2700,
  dvPlaneChange: 500,
  color: '#333333',
  satellites: [],
};

/** The planets with the Outer Planets Mod, Eeloo moved around Sarnus. */
export const outerPlanets: readonly Planet[] = [
  ...planets.filter((planet) => planet !== eeloo && planet !== kerbol),
  sarnus,
  urlum,
  neidon,
  plock,
  ...(kerbol ? [kerbol] : []),
];

const withSatellites = (list: readonly Planet[]): readonly AstroBody[] =>
  list.flatMap((planet) => [planet, ...planet.satellites]);

/** Every body, each planet followed by its satellites. */
export const bodies: readonly AstroBody[] = withSatellites(planets);

/** Every body with the Outer Planets Mod. */
export const outerBodies: readonly AstroBody[] = withSatellites(outerPlanets);

export function bodiesOf(outerPlanetsMod: boolean): readonly AstroBody[] {
  return outerPlanetsMod ? outerBodies : bodies;
}

export function parentOf(satellite: Satellite): Planet {
  const parent = [...planets, ...outerPlanets].find(
    (planet) => planet.name === satellite.parent,
  );
  if (!parent) {
    throw new Error(`Unknown parent body ${satellite.parent}`);
  }
  return parent;
}

export function isKerbinSatellite(body: AstroBody): boolean {
  return !body.isPlanet && body.parent === kerbin.name;
}
