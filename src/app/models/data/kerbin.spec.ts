import { Kerbin } from './kerbin';
import { Planet } from '../planet.model';

describe('Kerbin Model', () => {
  let kerbin: Kerbin;

  beforeEach(() => {
    kerbin = new Kerbin();
  });

  it('should create an instance of Kerbin with default properties', () => {
    expect(kerbin).toBeTruthy();
    expect(kerbin.name).toBe('Kerbin');
    expect(kerbin.isPlanet).toBe(true);
    expect(kerbin.hasAtmosphere).toBe(true);
    expect(kerbin.canLand).toBe(true);
    expect(kerbin.imageUrl).toBe('assets/planets/kerbin.webp');
    expect(kerbin.dvGL).toBe(3400);
    expect(kerbin.dvLE).toBe(950);
    expect(kerbin.dvK).toBeNull();
    expect(kerbin.dvPlaneChange).toBeNull();
    expect(kerbin.dvKeostat).toBe(1115);
    expect(kerbin.color).toBe('#2A7EFE');
    expect(kerbin.satellites.length).toBe(2);
    expect(kerbin.satellites[0].name).toBe('Mun');
    expect(kerbin.satellites[1].name).toBe('Minmus');
  });

  describe('transitToLowOrbit', () => {
    it('should calculate dv correctly when target planet has dvLI', () => {
      const mockPlanet = {
        name: 'MockPlanet',
        isPlanet: true,
        hasAtmosphere: false,
        canLand: true,
        imageUrl: '',
        dvGL: 1000,
        dvK: 100,
        dvLE: 200,
        dvEI: 300,
        dvLI: 400, // This should take precedence over dvLE + dvEI
        dvPlaneChange: 0,
        color: '',
        satellites: []
      } as Planet;

      // kerbin.dvLE (950) + dvK (100) + dvLI (400) = 1450
      expect(kerbin.transitToLowOrbit(mockPlanet)).toBe(1450);
    });

    it('should calculate dv correctly when target planet does NOT have dvLI', () => {
      const mockPlanet = {
        name: 'MockPlanet',
        isPlanet: true,
        hasAtmosphere: false,
        canLand: true,
        imageUrl: '',
        dvGL: 1000,
        dvK: 100,
        dvLE: 200,
        dvEI: 300,
        dvPlaneChange: 0,
        color: '',
        satellites: []
      } as Planet;

      // kerbin.dvLE (950) + dvK (100) + (dvLE (200) + dvEI (300)) = 1550
      expect(kerbin.transitToLowOrbit(mockPlanet)).toBe(1550);
    });

    it('should handle missing optional properties gracefully (defaulting to 0)', () => {
      const mockPlanet = {
        name: 'MockPlanet',
        isPlanet: true,
        hasAtmosphere: false,
        canLand: true,
        imageUrl: '',
        dvGL: 1000,
        dvPlaneChange: 0,
        color: '',
        satellites: []
      } as any as Planet; // Force missing dvK, dvLE, dvEI

      // kerbin.dvLE (950) + 0 + (0 + 0) = 950
      expect(kerbin.transitToLowOrbit(mockPlanet)).toBe(950);
    });
  });

  describe('transitToSOI', () => {
    it('should calculate dv correctly with dvK and dvEI', () => {
      const mockPlanet = {
        name: 'MockPlanet',
        isPlanet: true,
        hasAtmosphere: false,
        canLand: true,
        imageUrl: '',
        dvGL: 1000,
        dvK: 130,
        dvEI: 270,
        dvPlaneChange: 0,
        color: '',
        satellites: []
      } as Planet;

      // kerbin.dvLE (950) + dvK (130) + dvEI (270) = 1350
      expect(kerbin.transitToSOI(mockPlanet)).toBe(1350);
    });

    it('should handle missing optional properties gracefully (defaulting to 0)', () => {
      const mockPlanet = {
        name: 'MockPlanet',
        isPlanet: true,
        hasAtmosphere: false,
        canLand: true,
        imageUrl: '',
        dvGL: 1000,
        dvPlaneChange: 0,
        color: '',
        satellites: []
      } as any as Planet;

      // kerbin.dvLE (950) + 0 + 0 = 950
      expect(kerbin.transitToSOI(mockPlanet)).toBe(950);
    });
  });
});
