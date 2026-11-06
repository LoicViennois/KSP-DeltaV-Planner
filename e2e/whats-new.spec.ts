import { expect, type Page, test } from '@playwright/test';

import { PlannerPage } from './pages/planner.page';

const whatsNew = (page: Page) =>
  page.getByRole('region', { name: "What's new" });

test.describe("What's new", () => {
  for (const [screen, width, height] of [
    ['wide', 1280, 720],
    ['narrow', 390, 844],
  ] as const) {
    test(`opens the full screen map on ${screen} screens`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      const planner = new PlannerPage(page);
      await planner.goto();

      await whatsNew(page)
        .getByRole('button', { name: 'Open the map' })
        .click();

      await expect(page.getByRole('dialog', { name: 'Δv map' })).toBeVisible();
      await expect(whatsNew(page)).toBeHidden();
    });
  }

  test('stays closed once dismissed', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await expect(whatsNew(page)).toContainText('full screen');

    await whatsNew(page).getByRole('button', { name: 'Dismiss' }).click();

    await expect(whatsNew(page)).toBeHidden();
    await expect(planner.heading).toBeFocused();
    await page.reload();
    await expect(planner.heading).toBeVisible();
    await expect(whatsNew(page)).toBeHidden();
  });

  test('is no longer shown after January 2027', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2027-02-01T00:00:00Z'));
    const planner = new PlannerPage(page);
    await planner.goto();

    await expect(planner.heading).toBeVisible();
    await expect(whatsNew(page)).toBeHidden();
  });
});
