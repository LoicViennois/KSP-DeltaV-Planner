import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PanelComponent } from './panel.component';
import { AstroPathService } from '../../services/astro-path.service';
import { BodiesService } from '../../services/bodies.service';

describe('PanelComponent', () => {
  let component: PanelComponent;
  let astroPathService: AstroPathService;
  let bodiesService: BodiesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(PanelComponent);
    component = fixture.componentInstance;
    astroPathService = TestBed.inject(AstroPathService);
    bodiesService = TestBed.inject(BodiesService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('pathFromChanged', () => {
    it('should update path.from and set path.to to Kerbin when body is not Kerbin', () => {
      const dunaBody = bodiesService.bodies.find((b) => b.name === 'Duna')!;
      const spy = vi.spyOn(astroPathService, 'pathChanged');

      component.pathFromChanged(dunaBody);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          from: dunaBody,
          to: bodiesService.kerbin,
        })
      );
    });

    it('should update path.from to Kerbin and keep path.to unchanged when body is Kerbin', () => {
      const dunaBody = bodiesService.bodies.find((b) => b.name === 'Duna')!;
      astroPathService.pathChanged({ ...astroPathService.path(), to: dunaBody });

      const kerbinBody = bodiesService.kerbin;
      const spy = vi.spyOn(astroPathService, 'pathChanged');

      component.pathFromChanged(kerbinBody);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          from: kerbinBody,
          to: dunaBody,
        })
      );
    });
  });
});
