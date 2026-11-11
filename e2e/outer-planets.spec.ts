import { expect, test } from '@playwright/test';

import { PlannerPage } from './pages/planner.page';

test.describe('Outer Planets Mod', () => {
  test('is off by default, without its bodies', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();

    await expect(planner.outerPlanets).not.toBeChecked();
    await planner.to.click();
    const listbox = page.getByRole('listbox');
    await expect(listbox.getByRole('option', { name: 'Eeloo' })).toBeVisible();
    await expect(listbox.getByRole('option', { name: 'Sarnus' })).toHaveCount(
      0,
    );
  });

  test('adds its bodies and is remembered', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.outerPlanets.check();
    await planner.select(planner.to, 'Hale');
    await planner.aerobraking.uncheck();
    await planner.landing.check();

    await expect(planner.steps).toHaveCount(4);
    await expect(planner.steps.nth(1)).toContainText(
      'Transit to Sarnus low orbit',
    );
    await expect(planner.steps.nth(1)).toContainText('5580 – 5930 m/s');
    await expect(planner.steps.nth(2)).toContainText(
      'Transit from Sarnus low orbit to Hale low orbit',
    );
    // The total printed under Hale on the map.
    await expect(planner.total).toContainText('10010');

    await page.reload();
    await expect(planner.outerPlanets).toBeChecked();
  });

  test('keeps a trip to its bodies across a reload', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.outerPlanets.check();
    await planner.select(planner.to, 'Eeloo');

    await page.reload();
    await expect(planner.to).toContainText('Eeloo');
    // Still the moon of Sarnus, not the planet of the stock game.
    await expect(planner.steps.nth(1)).toContainText(
      'Transit to Sarnus low orbit',
    );

    await planner.select(planner.to, 'Hale');
    await page.reload();
    await expect(planner.to).toContainText('Hale');
  });

  test('moves Eeloo around Sarnus', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Eeloo');
    await planner.outerPlanets.check();

    // Eeloo stays the destination, as a moon of Sarnus now.
    await expect(planner.to).toContainText('Eeloo');
    await expect(planner.steps.nth(1)).toContainText(
      'Transit to Sarnus low orbit',
    );
  });

  test('drops its bodies from the trip when turned off', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.outerPlanets.check();
    await planner.select(planner.to, 'Neidon');
    await planner.outerPlanets.uncheck();

    await expect(planner.to).toContainText('Select…');
    await expect(planner.steps).toHaveCount(0);
  });

  test('highlights the trip on its map', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.outerPlanets.check();
    await expect(planner.map).toHaveAccessibleName(/Outer Planets Mod/);
    await planner.select(planner.to, 'Tal');

    // Tal is reached through Wal, which stays highlighted.
    await expect(planner.mapElements('tal-transit').first()).not.toHaveClass(
      /map-fade/,
    );
    await expect(planner.mapElements('wal-low').first()).not.toHaveClass(
      /map-fade/,
    );
    await expect(planner.mapElements('hale-transit').first()).toHaveClass(
      /map-fade/,
    );
    await expect(planner.mapElements('duna-transit').first()).toHaveClass(
      /map-fade/,
    );
    // The kraken fades too, like on the KSPedia map.
    await expect(planner.mapElement('g4600')).toHaveClass(/map-fade/);
  });

  test('highlights a moon transfer without the route to its planet', async ({
    page,
  }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.outerPlanets.check();
    await planner.select(planner.to, 'Thatmo');
    await planner.steps.nth(2).getByRole('button').click();

    await expect(planner.mapElements('thatmo-transit').first()).not.toHaveClass(
      /fade-soft/,
    );
    await expect(planner.mapElements('neidon-low').first()).not.toHaveClass(
      /fade-soft/,
    );
    await expect(planner.mapElements('neidon-transit').first()).toHaveClass(
      /fade-soft/,
    );
  });
});
