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
    expect(commitLink.href).toBe(`https://github.com/LoicViennois/KSP-DeltaV-Planner/commit/${fixture.componentInstance.commitSha}`);
  });
});