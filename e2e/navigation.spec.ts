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

test('switches the theme without the text flickering', async ({ page }) => {
  const planner = new PlannerPage(page);
  await planner.goto();
  await expect(planner.heading).toBeVisible();

  // Colours of a few panel texts before, then on each frame after, the switch.
  const frames: string[] = await page.evaluate(`(async () => {
    const texts = ['h1', '[role=combobox] span', 'fieldset label', 'fieldset legend'].map(
      (selector) => document.querySelector(selector),
    );
    const read = () => texts.map((el) => getComputedStyle(el).color).join();
    const colors = [read()];
    document.querySelector('[aria-label^="Switch to"]').click();
    for (let i = 0; i < 20; i++) {
      await new Promise(requestAnimationFrame);
      colors.push(read());
    }
    return colors;
  })()`);

  // The texts go straight from their old colours to their new ones, and stay.
  const [before, ...after] = frames;
  const changed = after.filter((colors) => colors !== before);
  expect(changed.length).toBeGreaterThan(0);
  expect(new Set(changed).size).toBe(1);
  expect(after.slice(after.indexOf(changed[0] ?? ''))).toEqual(changed);
  await expect(page.locator('html')).not.toHaveAttribute(
    'data-theme-switching',
  );
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
