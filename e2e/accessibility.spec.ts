import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

import { PlannerPage } from './pages/planner.page';

async function expectNoViolations(page: Page): Promise<void> {
  // Let entrance animations settle before checking contrast.
  await expect
    .poll(() =>
      page.evaluate(`document
        .getAnimations()
        .filter((animation) => animation.playState === 'running')
        .length`),
    )
    .toBe(0);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(results.violations).toEqual([]);
}

for (const theme of ['dark', 'light'] as const) {
  test.describe(`Accessibility (${theme} theme)`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((value) => {
        localStorage.setItem('ksp_theme', JSON.stringify(value));
      }, theme);
    });

    test('empty planner', async ({ page }) => {
      const planner = new PlannerPage(page);
      await planner.goto();
      await expect(planner.map).toBeVisible();

      await expectNoViolations(page);
    });

    test('planned trip', async ({ page }) => {
      const planner = new PlannerPage(page);
      await planner.goto();
      await planner.select(planner.to, 'Jool');
      await planner.landing.check();
      await planner.return.check();
      await expect(planner.total).toBeVisible();

      await expectNoViolations(page);
    });

    test('Kerbin trip, with disabled options', async ({ page }) => {
      const planner = new PlannerPage(page);
      await planner.goto();
      await planner.select(planner.to, 'Kerbin');

      await expectNoViolations(page);
    });

    test('open body list', async ({ page }) => {
      const planner = new PlannerPage(page);
      await planner.goto();
      await planner.to.click();
      await expect(page.getByRole('listbox')).toBeVisible();

      await expectNoViolations(page);
    });

    test('mobile layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      const planner = new PlannerPage(page);
      await planner.goto();
      await planner.select(planner.to, 'Duna');

      await expectNoViolations(page);
    });

    test('full screen map', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const planner = new PlannerPage(page);
      await planner.goto();
      await planner.select(planner.to, 'Duna');
      await page.getByRole('button', { name: 'Map', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Δv map' });
      await dialog.getByRole('button', { name: /Take off · Kerbin/ }).click();

      await expectNoViolations(page);
    });

    test('about dialog', async ({ page }) => {
      const planner = new PlannerPage(page);
      await planner.goto();
      await planner.aboutButton.click();
      await expect(page.getByRole('dialog', { name: 'About' })).toBeVisible();

      await expectNoViolations(page);
    });
  });
}
