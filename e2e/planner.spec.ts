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

  for (const width of [320, 390]) {
    test(`keeps the options on one row on a ${width}px screen`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      const planner = new PlannerPage(page);
      await planner.goto();

      const boxes = await Promise.all(
        [planner.landing, planner.aerobraking, planner.return].map((option) =>
          option.locator('..').boundingBox(),
        ),
      );
      expect(new Set(boxes.map((box) => box?.y)).size).toBe(1);
      // Wide enough for its label, which never overflows the button.
      for (const option of [planner.landing, planner.aerobraking]) {
        const label = option.locator('..');
        expect(
          await label.evaluate((el) => el.scrollWidth <= el.clientWidth),
        ).toBe(true);
      }
    });
  }

  test('centres the options on wide screens', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    const group = await page.locator('fieldset > div').boundingBox();
    const first = await planner.landing.locator('..').boundingBox();
    const last = await planner.return.locator('..').boundingBox();

    const left = (first?.x ?? 0) - (group?.x ?? 0);
    const right =
      (group?.x ?? 0) +
      (group?.width ?? 0) -
      ((last?.x ?? 0) + (last?.width ?? 0));
    expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
    expect(left).toBeGreaterThan(0);
  });

  test('toggles an option from anywhere on its button', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Duna');

    const button = planner.return.locator('..');
    const box = await button.boundingBox();
    await page.mouse.click((box?.x ?? 0) + 4, (box?.y ?? 0) + 4);
    await expect(planner.return).toBeChecked();

    await planner.return.focus();
    await page.keyboard.press('Space');
    await expect(planner.return).not.toBeChecked();
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

  test('follows the theme', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await expect(planner.map).toBeVisible();
    // A legend label, and a Δv value on its coloured route.
    const label = planner.mapElement('text4974');
    // Its sky lets the starfield of the page show through.
    const sky = planner.mapElement('rect4931');
    const dvOnRoute = planner.mapElement('text4935');

    await expect(label).toHaveCSS('fill', 'rgb(241, 240, 245)');
    await expect(sky).toHaveCSS('fill', 'none');
    for (const total of ['tspan5876', 'tspan5852', 'tspan5850']) {
      await expect(planner.mapElement(total)).toHaveCSS(
        'fill',
        'rgb(241, 240, 245)',
      );
    }
    await expect(dvOnRoute).toHaveCSS('fill', 'rgb(255, 255, 255)');

    await planner.themeToggle.click();
    await expect(label).toHaveCSS('fill', 'rgb(27, 24, 38)');
    await expect(sky).toHaveCSS('fill', 'none');
    await expect(dvOnRoute).toHaveCSS('fill', 'rgb(255, 255, 255)');
    // Every body's total Δv reads like Mun's, below its name.
    for (const total of ['tspan5876', 'tspan5852', 'tspan5850']) {
      await expect(planner.mapElement(total)).toHaveCSS(
        'fill',
        'rgb(27, 24, 38)',
      );
    }
    // The rays of Kerbol, the first one and its copies, all turn dark.
    for (const ray of ['path4989', 'use4991', 'use5011']) {
      await expect(planner.mapElement(ray)).toHaveCSS(
        'stroke',
        'rgb(27, 24, 38)',
      );
    }
  });

  test('highlights a step on keyboard focus', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Duna');

    await planner.steps.nth(1).focus();
    await expect(planner.mapElement('kerbin-ground')).toHaveClass(/fade-soft/);
    await expect(planner.mapElement('duna-low')).not.toHaveClass(/fade-soft/);
  });

  for (const [width, height] of [
    [1280, 720],
    [1440, 900],
    [1920, 1080],
    [2560, 1440],
  ] as const) {
    test(`fits a ${width}x${height} screen without scrolling`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      const planner = new PlannerPage(page);
      await planner.goto();
      await expect(planner.map).toBeVisible();

      const scrollHeight = await page.evaluate(
        'document.documentElement.scrollHeight',
      );
      expect(scrollHeight).toBe(height);
    });
  }

  test('never makes a short screen scroll by itself', async ({ page }) => {
    // The planner panel is taller than this screen, the map is not.
    await page.setViewportSize({ width: 1024, height: 600 });
    const planner = new PlannerPage(page);
    await planner.goto();
    await expect(planner.map).toBeVisible();

    const map = await planner.map.boundingBox();
    expect((map?.y ?? 0) + (map?.height ?? 0)).toBeLessThanOrEqual(600);
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

test.describe('Full screen map', () => {
  test('opens from the map button on narrow screens', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Duna');

    await page.getByRole('button', { name: 'Map', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Δv map' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('img', { name: /Δv map/ })).toBeVisible();

    // It starts zoomed on the trip, then zooms on the tapped step.
    const content = dialog.getByTestId('map-content');
    await expect(content).not.toHaveAttribute('data-scale', '1.00');
    await expect(planner.mapElement('eeloo')).toHaveClass(/map-fade/);
    const takeOff = dialog.getByRole('button', { name: /Take off · Kerbin/ });
    await takeOff.click();
    await expect(takeOff).toHaveAttribute('aria-pressed', 'true');
    await expect(planner.mapElement('kerbin-ground')).not.toHaveClass(
      /fade-soft/,
    );
    await expect(planner.mapElement('duna-low')).toHaveClass(/fade-soft/);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('takes the whole narrow screen and closes from the bottom', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Duna');

    await page.getByRole('button', { name: 'Map', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Δv map' });
    await expect(dialog.getByRole('heading', { name: 'Δv map' })).toBeHidden();

    // The steps are stacked on the right, with their Δv only.
    const steps = dialog.getByRole('list', { name: 'Show a step on the map' });
    const takeOff = steps.getByRole('button', { name: /Take off · Kerbin/ });
    await expect(takeOff).toHaveText('3400');
    const total = steps.getByRole('button', { name: /Total/ });
    const takeOffBox = await takeOff.boundingBox();
    const totalBox = await total.boundingBox();
    expect(totalBox?.y).toBeGreaterThan(takeOffBox?.y ?? Infinity);
    expect(
      (totalBox?.x ?? 0) +
        (totalBox?.width ?? 0) -
        ((takeOffBox?.x ?? 0) + (takeOffBox?.width ?? 0)),
      // A few pixels while the dialog grows in.
    ).toBeCloseTo(0, -1);

    const close = dialog.getByRole('button', { name: 'Close' });
    const closeBox = await close.boundingBox();
    expect((closeBox?.x ?? 0) + (closeBox?.width ?? 0)).toBeGreaterThan(358);
    expect((closeBox?.y ?? 0) + (closeBox?.height ?? 0)).toBeGreaterThan(796);
    await close.click();
    await expect(dialog).toBeHidden();
  });

  test('has a header as high as the page header', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    const pageHeader = await page.getByRole('banner').boundingBox();

    await page
      .getByRole('button', { name: 'Open the map in full screen' })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Δv map' });
    const title = dialog.getByRole('heading', { name: 'Δv map' });
    // Measured once the dialog has finished growing in.
    await expect
      .poll(async () => (await title.locator('..').boundingBox())?.height)
      .toBe(pageHeader?.height);
  });

  test('zooms with the buttons', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const planner = new PlannerPage(page);
    await planner.goto();
    await page.getByRole('button', { name: 'Map', exact: true }).click();

    const dialog = page.getByRole('dialog', { name: 'Δv map' });
    const content = dialog.getByTestId('map-content');
    await expect(content).toHaveAttribute('data-scale', '1.00');
    await expect(
      dialog.getByRole('button', { name: 'Zoom out' }),
    ).toBeDisabled();

    await dialog.getByRole('button', { name: 'Zoom in' }).click();
    await expect(content).toHaveAttribute('data-scale', '1.60');
    await dialog.getByRole('button', { name: 'Zoom out' }).click();
    await expect(content).toHaveAttribute('data-scale', '1.00');
  });

  test('opens from the map on wide screens', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await expect(
      page.getByRole('button', { name: 'Map', exact: true }),
    ).toBeHidden();

    await page
      .getByRole('button', { name: 'Open the map in full screen' })
      .click();
    await expect(page.getByRole('dialog', { name: 'Δv map' })).toBeVisible();
  });

  test('grows the map with the screen, not the panel', async ({ page }) => {
    const planner = new PlannerPage(page);
    const panel = page.getByRole('region', { name: 'Plan your trip' });

    await page.setViewportSize({ width: 1280, height: 720 });
    await planner.goto();
    await expect(planner.map).toBeVisible();
    const small = await planner.map.boundingBox();
    const panelSmall = await panel.boundingBox();

    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect
      .poll(async () => (await planner.map.boundingBox())?.width)
      .toBeGreaterThan((small?.width ?? 0) * 1.3);
    // The whole map fits under the header.
    const large = await planner.map.boundingBox();
    expect((large?.y ?? 0) + (large?.height ?? 0)).toBeLessThanOrEqual(1080);
    expect((await panel.boundingBox())?.width).toBe(panelSmall?.width);
  });
});
