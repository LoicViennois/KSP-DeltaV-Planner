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

  it('should render build info in the bottom right corner with commit link', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const buildInfo = compiled.querySelector('.build-info');
    const commitLink = buildInfo?.querySelector('a') as HTMLAnchorElement;

    expect(buildInfo).toBeTruthy();
    expect(buildInfo?.textContent).toContain('Build');
    expect(commitLink).toBeTruthy();
    expect(commitLink.textContent?.trim()).toBe(fixture.componentInstance.shortSha);
    expect(commitLink.href).toBe(`https://github.com/LoicViennois/KSP-DeltaV-Planner/commit/${fixture.componentInstance.commitSha}`);
    expect(commitLink.getAttribute('title')).toBe(fixture.componentInstance.commitSha);
  });
});
