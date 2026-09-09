import { describe, it, expect, beforeEach } from 'vitest';
import { Kerbin } from './kerbin';
import { Planet } from '../planet.model';

describe('Kerbin', () => {
  let kerbin: Kerbin;

  beforeEach(() => {
    kerbin = new Kerbin();
  });

  it('should create an instance with correct initial properties', () => {
    expect(kerbin.name).toBe('Kerbin');
    expect(kerbin.isPlanet).toBe(true);
    expect(kerbin.hasAtmosphere).toBe(true);
    expect(kerbin.canLand).toBe(true);
    expect(kerbin.dvLE).toBe(950);
    expect(kerbin.dvGL).toBe(3400);
    expect(kerbin.satellites).toHaveLength(2);
    expect(kerbin.satellites.map((s) => s.name)).toEqual(['Mun', 'Minmus']);
  });

  describe('transitToSOI', () => {
    it('should calculate transit delta-V to SOI with target planet dvK and dvEI', () => {
      const mockPlanet: Planet = {
        name: 'Duna',
        isPlanet: true,
        hasAtmosphere: true,
        canLand: true,
        imageUrl: '',
        dvGL: 1450,
        dvK: 130,
        dvEI: 250,
        dvPlaneChange: 10,
        color: '#FF0000',
        satellites: [],
      };

      // kerbin.dvLE (950) + planet.dvK (130) + planet.dvEI (250) = 1330
      expect(kerbin.transitToSOI(mockPlanet)).toBe(1330);
    });

    it('should fall back to 0 when dvK or dvEI are null or undefined', () => {
      const mockPlanet: Planet = {
        name: 'TestPlanet',
        isPlanet: true,
        hasAtmosphere: false,
        canLand: false,
        imageUrl: '',
        dvGL: 1000,
        dvK: null,
        dvEI: undefined,
        dvPlaneChange: 0,
        color: '#FFFFFF',
        satellites: [],
      };

      // kerbin.dvLE (950) + 0 + 0 = 950
      expect(kerbin.transitToSOI(mockPlanet)).toBe(950);
    });
  });

  describe('transitToLowOrbit', () => {
    it('should calculate transit delta-V using planet dvLI when present', () => {
      const mockPlanet: Planet = {
        name: 'Eve',
        isPlanet: true,
        hasAtmosphere: true,
        canLand: true,
        imageUrl: '',
        dvGL: 8000,
        dvLI: 410,
        dvK: 80,
        dvEI: 80,
        dvPlaneChange: 430,
        color: '#AA00AA',
        satellites: [],
      };

      // kerbin.dvLE (950) + planet.dvK (80) + planet.dvLI (410) = 1440
      expect(kerbin.transitToLowOrbit(mockPlanet)).toBe(1440);
    });

    it('should fall back to dvLE + dvEI when dvLI is not provided', () => {
      const mockPlanet: Planet = {
        name: 'Jool',
        isPlanet: true,
        hasAtmosphere: true,
        canLand: false,
        imageUrl: '',
        dvGL: 0,
        dvLE: 2800,
        dvEI: 160,
        dvK: 980,
        dvPlaneChange: 270,
        color: '#00FF00',
        satellites: [],
      };

      // kerbin.dvLE (950) + planet.dvK (980) + (planet.dvLE (2800) + planet.dvEI (160)) = 4890
      expect(kerbin.transitToLowOrbit(mockPlanet)).toBe(4890);
    });

    it('should fall back to 0 for missing target planet properties', () => {
      const mockPlanet: Planet = {
        name: 'EmptyPlanet',
        isPlanet: true,
        hasAtmosphere: false,
        canLand: false,
        imageUrl: '',
        dvGL: 0,
        dvK: null,
        dvPlaneChange: null,
        color: '#000000',
        satellites: [],
      };

      // kerbin.dvLE (950) + 0 + (0 + 0) = 950
      expect(kerbin.transitToLowOrbit(mockPlanet)).toBe(950);
    });
  });
});
