import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('should render build info in the bottom right corner', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const buildInfo = compiled.querySelector('.build-info');

    expect(buildInfo).toBeTruthy();
    expect(buildInfo?.textContent).toContain(`build ${fixture.componentInstance.shortSha}`);
    expect(buildInfo?.getAttribute('title')).toBe(fixture.componentInstance.commitSha);
  });
});
