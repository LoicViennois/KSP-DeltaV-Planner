import { TestBed } from '@angular/core/testing';
import { AstroPathService } from './astro-path.service';
import { BodiesService } from './bodies.service';
import { AstroBody } from '../models/planet.model';

describe('AstroPathService', () => {
  let service: AstroPathService;
  let bodiesService: BodiesService;
  let kerbin: AstroBody;
  let eve: AstroBody;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AstroPathService, BodiesService],
    });
    service = TestBed.inject(AstroPathService);
    bodiesService = TestBed.inject(BodiesService);
    kerbin = bodiesService.bodies.find(b => b.name === 'Kerbin')!;
    eve = bodiesService.bodies.find(b => b.name === 'Eve')!;
  });

  describe('isKerbinTrip', () => {
    it('should return false when "to" is null', () => {
      service.pathChanged({
        ...service.path(),
        from: kerbin,
        to: null
      });
      expect(service.isKerbinTrip()).toBe(false);
    });

    it('should return false when "from" is null', () => {
      service.pathChanged({
        ...service.path(),
        from: null,
        to: kerbin
      });
      expect(service.isKerbinTrip()).toBe(false);
    });

    it('should return true when both "from" and "to" are Kerbin', () => {
      service.pathChanged({
        ...service.path(),
        from: kerbin,
        to: kerbin
      });
      expect(service.isKerbinTrip()).toBe(true);
    });

    it('should return false when "from" is Kerbin and "to" is not Kerbin', () => {
      service.pathChanged({
        ...service.path(),
        from: kerbin,
        to: eve
      });
      expect(service.isKerbinTrip()).toBe(false);
    });

    it('should return false when "from" is not Kerbin and "to" is Kerbin', () => {
      service.pathChanged({
        ...service.path(),
        from: eve,
        to: kerbin
      });
      expect(service.isKerbinTrip()).toBe(false);
    });

    it('should return false when both "from" and "to" are not Kerbin', () => {
      service.pathChanged({
        ...service.path(),
        from: eve,
        to: eve
      });
      expect(service.isKerbinTrip()).toBe(false);
    });
  });
});
