import { expect, test } from '@playwright/test';

import { PlannerPage } from './pages/planner.page';

test.describe('Navigation', () => {
  test('redirects unknown routes to the planner', async ({ page }) => {
    await page.goto('/unknown-page');

    await expect(page).toHaveURL('/');
    await expect(new PlannerPage(page).heading).toBeVisible();
  });

  test('links to the GitHub repository', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();

    await expect(planner.githubLink).toHaveAttribute(
      'href',
      'https://github.com/LoicViennois/KSP-DeltaV-Planner',
    );
  });

  test('shows the help dialog', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();

    await planner.helpButton.click();

    const dialog = page.getByRole('dialog', { name: 'Help' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('This is a Δv planner');

    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();
    await expect(planner.helpButton).toBeFocused();
  });

  test('shows the about dialog', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();

    await planner.aboutButton.click();

    const dialog = page.getByRole('dialog', { name: 'About' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId('commit-link')).toHaveAttribute(
      'href',
      /^https:\/\/github\.com\/LoicViennois\/KSP-DeltaV-Planner/,
    );
    await expect(dialog.getByTestId('commit-link')).toHaveText(
      /^([0-9a-f]{7}|dev)$/,
    );
    await expect(
      dialog.getByRole('link', { name: 'GNU General Public License v3' }),
    ).toHaveAttribute(
      'href',
      'https://github.com/LoicViennois/KSP-DeltaV-Planner/blob/master/LICENSE',
    );
    await expect(dialog).toContainText('CC BY-NC-SA 4.0');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(planner.aboutButton).toBeFocused();
  });

  test('switches theme and remembers it', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await planner.themeToggle.click();
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('Starfield', () => {
  test('adds a star where the background is tapped, not on controls', async ({
    page,
  }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    const added = page.getByTestId('added-stars').locator('circle');
    // The title is static: wait for the app to be running.
    await expect(planner.heading).toBeVisible();

    await page.mouse.click(8, 700);
    await expect(added).toHaveCount(1);

    await planner.reverseButton.click();
    await expect(added).toHaveCount(1);
  });
});
