import { expect, test, type Page } from '@playwright/test';

async function openPlanner(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('ksp-panel')).toBeVisible();
}

async function selectBody(page: Page, selector: '#fromBody' | '#toBody', body: string): Promise<void> {
  await page.locator(selector).click();
  const menu = page.locator('.dropdown-menu.show');
  await expect(menu).toBeVisible();
  await menu.locator('button').filter({ hasText: body }).click();
}

test.describe('Delta-V planner', () => {
  test('starts with Kerbin selected and no destination', async ({ page }) => {
    await openPlanner(page);

    await expect(page.locator('#fromBody')).toContainText('Kerbin');
    await expect(page.locator('#toBody')).toContainText('Select your destination');
    await expect(page.locator('li')).toHaveCount(0);
    await expect(page.locator('#landingCheck')).toBeEnabled();
    await expect(page.locator('#aerobrakingCheck')).toBeChecked();
    await expect(page.locator('#returnCheck')).toBeEnabled();
  });

  test('calculates a Kerbin to Mun transfer', async ({ page }) => {
    await openPlanner(page);
    await selectBody(page, '#toBody', 'Mun');

    const steps = page.locator('li');
    await expect(page.locator('#toBody')).toContainText('Mun');
    await expect(steps).toHaveCount(3);
    await expect(steps.nth(0)).toContainText('TakeOff from Kerbin');
    await expect(steps.nth(0)).toContainText('3400 m/s');
    await expect(steps.nth(1)).toContainText('Transit from Kerbin low orbit to Mun low orbit');
    await expect(steps.nth(1)).toContainText('1170 m/s');
    await expect(steps.nth(2)).toContainText('Total');
    await expect(steps.nth(2)).toContainText('4570 m/s');
  });

  test('calculates a Kerbin to Kerbin trip', async ({ page }) => {
    await openPlanner(page);
    await selectBody(page, '#toBody', 'Kerbin');

    const steps = page.locator('li');
    await expect(page.locator('#fromBody')).toContainText('Kerbin');
    await expect(page.locator('#toBody')).toContainText('Kerbin');
    await expect(steps).toHaveCount(3);
    await expect(steps.nth(0)).toContainText('TakeOff from Kerbin');
    await expect(steps.nth(0)).toContainText('3400 m/s');
    await expect(steps.nth(1)).toContainText('Transit to Kerbin SOI');
    await expect(steps.nth(1)).toContainText('950 m/s');
    await expect(steps.nth(2)).toContainText('Transit to Keostationary orbit');
    await expect(steps.nth(2)).toContainText('1115 m/s');
    await expect(page.locator('#landingCheck')).toBeDisabled();
    await expect(page.locator('#returnCheck')).toBeDisabled();
  });

  test('supports landing and return options for an interplanetary trip', async ({ page }) => {
    await openPlanner(page);
    await selectBody(page, '#toBody', 'Duna');

    await page.locator('#landingCheck').check();
    await expect(page.locator('li').nth(2)).toContainText('Landing on Duna');
    await expect(page.locator('li').nth(2)).toContainText('0 m/s');

    await page.locator('#returnCheck').check();

    const steps = page.locator('li');
    await expect(page.locator('#landingCheck')).toBeChecked();
    await expect(page.locator('#returnCheck')).toBeChecked();
    await expect(steps).toHaveCount(5);
    await expect(steps.nth(3)).toContainText('Return trip from Duna to Kerbin');
    await expect(steps.nth(3)).toContainText('3140 - 3150 m/s');
    await expect(steps.nth(4)).toContainText('Total');
    await expect(steps.nth(4)).toContainText('8230 - 8250 m/s');
  });

  test('switches the selected from and to bodies', async ({ page }) => {
    await openPlanner(page);
    await selectBody(page, '#toBody', 'Duna');

    await page.getByRole('button', { name: 'Reverse path' }).click();
    await expect(page.locator('#fromBody')).toContainText('Duna');
    await expect(page.locator('#toBody')).toContainText('Kerbin');
    await expect(page.locator('li').first()).toContainText('TakeOff from Duna');
  });

  test('resets a selected path', async ({ page }) => {
    await openPlanner(page);
    await selectBody(page, '#toBody', 'Duna');

    await page.getByRole('button', { name: 'Reset path' }).click();
    await expect(page.locator('#fromBody')).toContainText('Kerbin');
    await expect(page.locator('#toBody')).toContainText('Select your destination');
    await expect(page.locator('li')).toHaveCount(0);
  });

  test('opens and closes the help and about modals', async ({ page }) => {
    await openPlanner(page);

    await page.getByRole('link', { name: 'help' }).click();
    const modal = page.locator('ngb-modal-window');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('This is a Δv planner');
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).toHaveCount(0);

    await page.getByRole('link', { name: 'about' }).click();
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('KSP Delta-V Planner');
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).toHaveCount(0);
  });

  test('keeps the responsive layout for narrow screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openPlanner(page);

    await expect(page.locator('ksp-map')).toBeHidden();
    await expect(page.getByRole('heading', { name: 'KSP Delta-V Planner' })).toBeVisible();
    await expect(page.locator('ksp-panel')).toBeVisible();
  });
});
