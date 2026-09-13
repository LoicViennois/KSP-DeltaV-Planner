import { TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [NgbActiveModal]
    }).compileComponents();
  });

  it('should create the about component', () => {
    const fixture = TestBed.createComponent(AboutComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should display git sha build link', () => {
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const commitLink = compiled.querySelector('a[aria-label="commit"]') as HTMLAnchorElement;

    expect(commitLink).toBeTruthy();
    expect(commitLink.textContent?.trim()).toBe(fixture.componentInstance.shortSha);
    expect(commitLink.href).toBe(fixture.componentInstance.commitUrl);
  });

  it('should compute commitUrl as repository link when commitSha is dev', () => {
    const fixture = TestBed.createComponent(AboutComponent);
    const component = fixture.componentInstance;
    expect(component.commitUrl).toBe(
      component.commitSha && component.commitSha !== 'dev'
        ? `https://github.com/LoicViennois/KSP-DeltaV-Planner/commit/${component.commitSha}`
        : 'https://github.com/LoicViennois/KSP-DeltaV-Planner'
    );
  });
});