import { expect, test } from '@playwright/test';

import { PlannerPage } from './pages/planner.page';

test.describe('Delta-V planner', () => {
  test('starts with Kerbin selected and no destination', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();

    await expect(planner.heading).toHaveText('Plan your trip');
    await expect(planner.from).toContainText('Kerbin');
    await expect(planner.to).toContainText('Select your destination');
    await expect(planner.steps).toHaveCount(0);
    await expect(page.getByText('Pick a destination')).toBeVisible();
    await expect(planner.landing).toBeEnabled();
    await expect(planner.aerobraking).toBeChecked();
    await expect(planner.return).toBeEnabled();
  });

  test('calculates a Kerbin to Mun transfer', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Mun');

    await expect(planner.steps).toHaveCount(2);
    await expect(planner.steps.nth(0)).toContainText('Take off from Kerbin');
    await expect(planner.steps.nth(0)).toContainText('3400 m/s');
    await expect(planner.steps.nth(1)).toContainText(
      'Transit from Kerbin low orbit to Mun low orbit',
    );
    await expect(planner.steps.nth(1)).toContainText('1170 m/s');
    await expect(planner.total).toContainText('4570 m/s');
  });

  test('calculates a Kerbin to Kerbin trip', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Kerbin');

    await expect(planner.steps).toHaveCount(3);
    await expect(planner.steps.nth(0)).toContainText('Take off from Kerbin');
    await expect(planner.steps.nth(0)).toContainText('3400 m/s');
    await expect(planner.steps.nth(1)).toContainText('Transit to Kerbin SOI');
    await expect(planner.steps.nth(1)).toContainText('950 m/s');
    await expect(planner.steps.nth(2)).toContainText(
      'Transit to Keostationary orbit',
    );
    await expect(planner.steps.nth(2)).toContainText('1115 m/s');
    await expect(planner.total).toHaveCount(0);
    await expect(planner.landing).toBeDisabled();
    await expect(planner.return).toBeDisabled();
  });

  test('reaches a moon of another planet', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Ike');

    await expect(planner.steps).toHaveCount(3);
    await expect(planner.steps.nth(1)).toContainText('Transit to Duna SOI');
    await expect(planner.steps.nth(1)).toContainText('1330 – 1340 m/s');
    await expect(planner.steps.nth(2)).toContainText(
      'Transit from Duna SOI to Ike low orbit',
    );
    await expect(planner.steps.nth(2)).toContainText('210 m/s');
    await expect(planner.total).toContainText('4940 – 4950 m/s');
  });

  test('supports landing and return options for an interplanetary trip', async ({
    page,
  }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Duna');

    await planner.landing.check();
    await expect(planner.steps.nth(2)).toContainText('Landing on Duna');
    await expect(planner.steps.nth(2)).toContainText('0 m/s');
    await expect(planner.steps.nth(2)).toContainText('Aerobraking is possible');

    await planner.return.check();
    await expect(planner.steps).toHaveCount(4);
    await expect(planner.steps.nth(3)).toContainText(
      'Return trip from Duna to Kerbin',
    );
    await expect(planner.steps.nth(3)).toContainText('3140 – 3150 m/s');
    await expect(planner.total).toContainText('8230 – 8250 m/s');
  });

  test('counts the landing burn without aerobraking', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Duna');

    await planner.landing.check();
    await planner.aerobraking.uncheck();

    await expect(planner.steps.nth(2).getByTestId('dv')).toHaveText('1450 m/s');
  });

  test('warns against landing on a gas giant', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Jool');
    await planner.landing.check();

    await expect(planner.steps.nth(2)).toContainText(
      'Landing here might not be a good idea',
    );
  });

  test('flies home from any body', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.from, 'Laythe');

    await expect(planner.to).toContainText('Kerbin');
    await expect(planner.steps.nth(0)).toContainText('Take off from Laythe');
    await expect(planner.steps.nth(1)).toContainText(
      'Transit from Laythe low orbit to Jool SOI',
    );
  });

  test('switches the selected from and to bodies', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Duna');

    await planner.reverseButton.click();
    await expect(planner.from).toContainText('Duna');
    await expect(planner.to).toContainText('Kerbin');
    await expect(planner.steps.first()).toContainText('Take off from Duna');
  });

  test('resets a selected path', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Duna');
    await planner.landing.check();

    await planner.resetButton.click();
    await expect(planner.from).toContainText('Kerbin');
    await expect(planner.to).toContainText('Select your destination');
    await expect(planner.steps).toHaveCount(0);
    await expect(planner.landing).not.toBeChecked();
  });

  test('picks a body with the keyboard', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();

    await planner.to.focus();
    await page.keyboard.press('ArrowDown');
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    await page.keyboard.type('ik');
    await expect(
      listbox.getByRole('option', { name: 'Ike', exact: true }),
    ).toHaveAttribute(
      'id',
      (await planner.to.getAttribute('aria-activedescendant')) as string,
    );
    await page.keyboard.press('Enter');

    await expect(listbox).toBeHidden();
    await expect(planner.to).toContainText('Ike');
    await expect(planner.to).toBeFocused();

    await page.keyboard.press('Space');
    await expect(listbox).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(listbox).toBeHidden();
    await expect(planner.to).toContainText('Ike');
  });

  test('closes the body list when clicking elsewhere', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();

    await planner.to.click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await planner.heading.click();
    await expect(page.getByRole('listbox')).toBeHidden();
  });
});

test.describe('Δv map', () => {
  test('highlights the planned path and the hovered step', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await expect(planner.map).toBeVisible();
    await expect(planner.mapElement('eeloo')).not.toHaveClass(/map-fade/);

    await planner.select(planner.to, 'Duna');
    await expect(planner.mapElement('eeloo')).toHaveClass(/map-fade/);
    await expect(planner.mapElement('duna-low')).not.toHaveClass(/map-fade/);

    await planner.steps.nth(0).hover();
    await expect(planner.mapElement('kerbin-ground')).not.toHaveClass(
      /fade-soft/,
    );
    await expect(planner.mapElement('duna-low')).toHaveClass(/fade-soft/);

    await planner.heading.hover();
    await expect(planner.mapElement('duna-low')).not.toHaveClass(/fade-soft/);
  });

  test('highlights a step on keyboard focus', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Duna');

    await planner.steps.nth(1).focus();
    await expect(planner.mapElement('kerbin-ground')).toHaveClass(/fade-soft/);
    await expect(planner.mapElement('duna-low')).not.toHaveClass(/fade-soft/);
  });

  test('is left out on narrow screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const planner = new PlannerPage(page);
    await planner.goto();

    await expect(planner.heading).toBeVisible();
    await expect(planner.from).toBeVisible();
    await expect(planner.map).toHaveCount(0);
  });
});
