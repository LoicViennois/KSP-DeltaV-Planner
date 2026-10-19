import { expect, type Locator, type Page } from '@playwright/test';

const MOON_PARENTS: Record<string, string> = {
  Mun: 'Kerbin',
  Minmus: 'Kerbin',
  Gilly: 'Eve',
  Ike: 'Duna',
  Laythe: 'Jool',
  Vall: 'Jool',
  Tylo: 'Jool',
  Bop: 'Jool',
  Pol: 'Jool',
};

export class PlannerPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly from: Locator;
  readonly to: Locator;
  readonly landing: Locator;
  readonly aerobraking: Locator;
  readonly return: Locator;
  readonly reverseButton: Locator;
  readonly resetButton: Locator;
  readonly steps: Locator;
  readonly total: Locator;
  readonly map: Locator;
  readonly githubLink: Locator;
  readonly aboutButton: Locator;
  readonly themeToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 });
    this.from = page.getByRole('button', { name: /^From\b/ });
    this.to = page.getByRole('button', { name: /^To\b/ });
    this.landing = page.getByRole('checkbox', { name: 'Landing' });
    this.aerobraking = page.getByRole('checkbox', { name: 'Aerobraking' });
    this.return = page.getByRole('checkbox', { name: 'Return' });
    this.reverseButton = page.getByRole('button', { name: 'Reverse path' });
    this.resetButton = page.getByRole('button', { name: 'Reset path' });
    this.steps = page
      .getByRole('list', { name: 'Trip steps' })
      .getByRole('listitem');
    this.total = page.getByTestId('total');
    this.map = page.getByRole('img', { name: 'Δv map of the Kerbol system' });
    const banner = page.getByRole('banner');
    this.githubLink = banner.getByRole('link', { name: 'GitHub repository' });
    this.aboutButton = banner.getByRole('button', { name: 'About' });
    this.themeToggle = banner.getByRole('button', {
      name: /Switch to (light|dark) theme/,
    });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page).toHaveTitle('KSP Delta-V Planner');
  }

  /** Sets an end of the trip, through the planet first for a moon. */
  async select(end: Locator, body: string): Promise<void> {
    await end.click();
    const parent = MOON_PARENTS[body];
    if (parent) {
      await this.body(parent).click();
    }
    await this.body(body).click();
    await expect(end).toContainText(body);
  }

  /** A planet, or a moon of the planet shown, to tap. */
  body(name: string): Locator {
    return this.page.getByRole('button', {
      name: new RegExp(`^${name}(,|$)`),
    });
  }

  /** A map element, by its id in the SVG. */
  mapElement(id: string): Locator {
    return this.map.locator(`[id="${id}"]`);
  }
}
