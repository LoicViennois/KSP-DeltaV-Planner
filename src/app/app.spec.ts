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
    expect(commitLink.href).toBe(fixture.componentInstance.commitUrl);
    expect(commitLink.getAttribute('title')).toBe(fixture.componentInstance.commitSha);
  });

  it('should compute commitUrl as repository link when commitSha is dev', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.commitUrl).toBe(
      app.commitSha && app.commitSha !== 'dev'
        ? `https://github.com/LoicViennois/KSP-DeltaV-Planner/commit/${app.commitSha}`
        : 'https://github.com/LoicViennois/KSP-DeltaV-Planner'
    );
  });
});
