import { expect, test } from '@playwright/test';

import { PlannerPage } from './pages/planner.page';

test.describe('Delta-V planner', () => {
  test('starts with Kerbin selected and no destination', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();

    await expect(planner.heading).toHaveText('Plan your trip');
    await expect(planner.from).toContainText('Kerbin');
    await expect(planner.to).toContainText('Select…');
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
    await expect(planner.to).toContainText('Select…');
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

  for (const width of [320, 390, 1280]) {
    test(`lays from and to out as an itinerary on a ${width}px screen`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      const planner = new PlannerPage(page);
      await planner.goto();
      const fits = (field: typeof planner.from) =>
        field
          .getByTestId('body-name')
          .evaluate((el) => el.scrollWidth <= el.clientWidth);
      // The placeholder fits too.
      expect(await fits(planner.to)).toBe(true);
      await planner.select(planner.from, 'Minmus');
      await planner.select(planner.to, 'Laythe');

      // One under the other, like an itinerary, as wide as each other, with
      // Reverse over their right end, between them.
      const [from, to, reverse] = await Promise.all([
        planner.from.boundingBox(),
        planner.to.boundingBox(),
        planner.reverseButton.boundingBox(),
      ]);
      expect(from?.x).toBe(to?.x);
      expect((from?.y ?? 0) + (from?.height ?? 0)).toBeLessThanOrEqual(
        to?.y ?? 0,
      );
      expect(from?.width).toBe(to?.width);
      expect((reverse?.x ?? 0) + (reverse?.width ?? 0)).toBeLessThan(
        (from?.x ?? 0) + (from?.width ?? 0),
      );
      expect(reverse?.x ?? 0).toBeGreaterThan(
        (from?.x ?? 0) + (from?.width ?? 0) - 72,
      );
      expect(
        Math.abs((reverse?.y ?? 0) + (reverse?.height ?? 0) / 2 - (to?.y ?? 0)),
      ).toBeLessThan(2);
      // The longest names fit, without being cut.
      for (const field of [planner.from, planner.to]) {
        expect(await fits(field)).toBe(true);
      }
      expect(await page.evaluate('document.documentElement.scrollWidth')).toBe(
        width,
      );

      // The body list stays on the screen.
      await planner.to.click();
      const list = await page.getByRole('listbox').boundingBox();
      expect(list?.x ?? -1).toBeGreaterThanOrEqual(0);
      expect((list?.x ?? 0) + (list?.width ?? 0)).toBeLessThanOrEqual(width);
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
  test('highlights the planned path and the picked step', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await expect(planner.map).toBeVisible();
    await expect(planner.mapElement('eeloo')).not.toHaveClass(/map-fade/);

    await planner.select(planner.to, 'Duna');
    await expect(planner.mapElement('eeloo')).toHaveClass(/map-fade/);
    await expect(planner.mapElement('duna-low')).not.toHaveClass(/map-fade/);

    // Hovering a step is not enough.
    const takeOff = planner.steps.nth(0).getByRole('button');
    await takeOff.hover();
    await expect(planner.mapElement('duna-low')).not.toHaveClass(/fade-soft/);

    await takeOff.click();
    await expect(planner.mapElement('kerbin-ground')).not.toHaveClass(
      /fade-soft/,
    );
    await expect(planner.mapElement('duna-low')).toHaveClass(/fade-soft/);
  });

  test('shows the picked step, the total by default', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Duna');
    const takeOff = planner.steps.nth(0).getByRole('button');
    await expect(planner.total).toHaveAttribute('aria-pressed', 'true');
    await expect(takeOff).toHaveAttribute('aria-pressed', 'false');

    // Picked, the step stays on the map once the pointer leaves it.
    await takeOff.click();
    await expect(takeOff).toHaveAttribute('aria-pressed', 'true');
    await expect(planner.total).toHaveAttribute('aria-pressed', 'false');
    await planner.heading.hover();
    await expect(planner.mapElement('duna-low')).toHaveClass(/fade-soft/);

    // Picked again, it gives way to the total.
    await takeOff.click();
    await expect(planner.total).toHaveAttribute('aria-pressed', 'true');
    await planner.heading.hover();
    await expect(planner.mapElement('duna-low')).not.toHaveClass(/fade-soft/);

    // A new trip starts on its total.
    await planner.steps.nth(1).getByRole('button').click();
    await planner.select(planner.to, 'Eve');
    await expect(planner.total).toHaveAttribute('aria-pressed', 'true');
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

  test('highlights a step picked with the keyboard', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Duna');

    // Focusing the step is not enough.
    await planner.steps.nth(1).getByRole('button').focus();
    await expect(planner.mapElement('kerbin-ground')).not.toHaveClass(
      /fade-soft/,
    );
    await page.keyboard.press('Enter');
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

  test('takes the whole narrow screen and closes from the top', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Duna');

    await page.getByRole('button', { name: 'Map', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Δv map' });
    await expect(dialog.getByRole('heading', { name: 'Δv map' })).toBeHidden();

    // The steps are a row of pills, with their Δv only, at the bottom; close
    // is in the top right corner.
    const steps = dialog.getByRole('list', { name: 'Show a step on the map' });
    const takeOff = steps.getByRole('button', { name: /Take off · Kerbin/ });
    await expect(takeOff).toHaveText('3400');
    const total = steps.getByRole('button', { name: /Total/ });
    const close = dialog.getByRole('button', { name: 'Close' });
    // Measured once the dialog has finished growing in.
    await expect
      .poll(async () => {
        const [first, last, button] = await Promise.all([
          takeOff.boundingBox(),
          total.boundingBox(),
          close.boundingBox(),
        ]);
        return (
          !!first &&
          !!last &&
          !!button &&
          last.x > first.x &&
          Math.abs(last.y - first.y) < 1 &&
          first.y + first.height > 796 &&
          button.x + button.width > 358 &&
          button.y < 24
        );
      })
      .toBe(true);

    // Reset, on the left of close, empties the trip as the panel's does,
    // and zooms back out.
    const reset = dialog.getByRole('button', { name: 'Reset path' });
    await expect
      .poll(async () => {
        const [left, right] = await Promise.all([
          reset.boundingBox(),
          close.boundingBox(),
        ]);
        return (
          !!left &&
          !!right &&
          left.x + left.width < right.x &&
          Math.abs(left.y - right.y) < 1
        );
      })
      .toBe(true);
    const content = dialog.getByTestId('map-content');
    await expect(content).not.toHaveAttribute('data-scale', '1.00');
    await takeOff.click();
    await dialog.getByRole('button', { name: 'Zoom in' }).click();
    await reset.click();
    await expect(steps).toHaveCount(0);
    await expect(dialog).toContainText(
      'Pick a destination to see your trip on the map.',
    );
    await expect(content).toHaveAttribute('data-scale', '1.00');

    await close.click();
    await expect(dialog).toBeHidden();
    await expect(planner.to).toContainText('Select…');
  });

  test('scrolls a step cut by the edge into view, with a hint of the next', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Duna');
    await planner.landing.check();
    await planner.return.check();
    await page.getByRole('button', { name: 'Map', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Δv map' });
    const steps = dialog.getByRole('list', { name: 'Show a step on the map' });
    const ret = steps.getByRole('button', { name: /^Return/ });

    // Tap the part of the step still on the screen, as a finger would.
    await expect
      .poll(async () => (await ret.boundingBox())?.x ?? 0)
      .toBeLessThan(390);
    const list = await steps.boundingBox();
    const cut = await ret.boundingBox();
    expect((cut?.x ?? 0) + (cut?.width ?? 0)).toBeGreaterThan(390);
    await page.mouse.click(
      ((cut?.x ?? 0) + (list?.x ?? 0) + (list?.width ?? 0)) / 2,
      (cut?.y ?? 0) + (cut?.height ?? 0) / 2,
    );
    await expect(ret).toHaveAttribute('aria-pressed', 'true');
    // Shown in full, with a bit of the next step as a hint.
    const total = steps.getByRole('button', { name: /^Total/ });
    const shown = async () => {
      const [box, after] = await Promise.all([
        ret.boundingBox(),
        total.boundingBox(),
      ]);
      return (
        (box?.x ?? 0) >= 16 - 1 &&
        (box?.x ?? 0) + (box?.width ?? 0) <= 390 - 16 + 1 &&
        (after?.x ?? 390) <= 390 - 16 - 24
      );
    };
    await expect.poll(shown).toBe(true);

    // Opened again, the map still shows it that way.
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();
    await page.getByRole('button', { name: 'Map', exact: true }).click();
    await expect(ret).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(shown).toBe(true);

    // The last step stays on the right, and nothing else moves.
    const close = dialog.getByRole('button', { name: 'Close' });
    const end = await total.boundingBox();
    await page.mouse.click(
      ((end?.x ?? 0) + 390) / 2,
      (end?.y ?? 0) + (end?.height ?? 0) / 2,
    );
    await expect(total).toHaveAttribute('aria-pressed', 'true');
    await expect
      .poll(async () => {
        const box = await total.boundingBox();
        return Math.round((box?.x ?? 0) + (box?.width ?? 0));
      })
      .toBe(390 - 16);
    const corner = await close.boundingBox();
    expect(Math.round((corner?.x ?? 0) + (corner?.width ?? 0))).toBe(390 - 16);
    expect(Math.round(corner?.y ?? 0)).toBe(16);
  });

  test('pans the map clear of the steps and the buttons', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.select(planner.to, 'Duna');
    await page.getByRole('button', { name: 'Map', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Δv map' });
    const steps = dialog.getByRole('list', { name: 'Show a step on the map' });
    await steps.getByRole('button', { name: /Low orbit · Duna/ }).click();

    // Drag the map up and left, as far as it goes.
    const content = dialog.getByTestId('map-content');
    await expect(content).not.toHaveAttribute('data-scale', '1.00');
    for (let i = 0; i < 4; i++) {
      await page.mouse.move(300, 600);
      await page.mouse.down();
      await page.mouse.move(20, 100, { steps: 5 });
      await page.mouse.up();
      // Too soon, the next drag would be a double tap.
      await page.waitForTimeout(350);
    }
    const [map, bar, zoom] = await Promise.all([
      content.boundingBox(),
      steps.boundingBox(),
      dialog.getByRole('button', { name: 'Zoom in' }).boundingBox(),
    ]);
    expect((map?.y ?? 0) + (map?.height ?? 0)).toBeLessThanOrEqual(
      (bar?.y ?? 0) + 1,
    );
    expect((map?.x ?? 0) + (map?.width ?? 0)).toBeLessThanOrEqual(
      (zoom?.x ?? 0) + 1,
    );
  });

  for (const [width, height] of [
    [1280, 720],
    [1107, 887],
  ] as const) {
    test(`stacks the steps under the buttons on a ${width}x${height} screen`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      const planner = new PlannerPage(page);
      await planner.goto();
      await planner.select(planner.to, 'Duna');
      await planner.return.check();
      await page
        .getByRole('button', { name: 'Open the map in full screen' })
        .click();
      const dialog = page.getByRole('dialog', { name: 'Δv map' });
      const steps = dialog.getByRole('list', {
        name: 'Show a step on the map',
      });
      const buttons = steps.getByRole('button');
      await buttons.filter({ hasText: /./ }).first().waitFor();
      await steps.getByRole('button', { name: /^Return/ }).click();

      // A column at the bottom right, under the zoom buttons.
      const fit = dialog.getByRole('button', { name: 'Zoom to the trip' });
      await expect
        .poll(async () => {
          const [list, last, zoom] = await Promise.all([
            steps.boundingBox(),
            steps.getByRole('button', { name: /^Total/ }).boundingBox(),
            fit.boundingBox(),
          ]);
          return (
            !!list &&
            !!last &&
            !!zoom &&
            list.y > zoom.y + zoom.height &&
            Math.abs(last.x + last.width - (zoom.x + zoom.width)) < 1 &&
            last.y + last.height > height - 32
          );
        })
        .toBe(true);
      const boxes = await buttons.evaluateAll((all) =>
        all.map((b) => b.getBoundingClientRect()),
      );
      expect(new Set(boxes.map((r) => Math.round(r.right))).size).toBe(1);

      // Drag the map left, as far as it goes, without zooming.
      const content = dialog.getByTestId('map-content');
      await page.waitForTimeout(400);
      const scale = (await content.getAttribute('data-scale')) ?? '';
      for (let i = 0; i < 3; i++) {
        await page.mouse.move(width - 300, height / 2);
        await page.mouse.down();
        await page.mouse.move(50, height / 2, { steps: 5 });
        await page.mouse.up();
        // Too soon, the next drag would be a double tap.
        await page.waitForTimeout(350);
      }
      await expect(content).toHaveAttribute('data-scale', scale);
      const [map, list] = await Promise.all([
        content.boundingBox(),
        steps.boundingBox(),
      ]);
      expect((map?.x ?? 0) + (map?.width ?? 0)).toBeLessThanOrEqual(
        (list?.x ?? 0) + 1,
      );
    });
  }

  for (const [name, width, height, open] of [
    ['narrow', 390, 844, 'Map'],
    ['wide', 1280, 720, 'Open the map in full screen'],
  ] as const) {
    test(`picks steps as the panel does on ${name} screens`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      const planner = new PlannerPage(page);
      await planner.goto();
      await planner.select(planner.to, 'Duna');
      const openMap = page.getByRole('button', { name: open, exact: true });
      await openMap.click();
      const dialog = page.getByRole('dialog', { name: 'Δv map' });
      const steps = dialog.getByRole('list', {
        name: 'Show a step on the map',
      });
      const total = steps.getByRole('button', { name: /^Total/ });
      const takeOff = steps.getByRole('button', { name: /^Take off/ });

      // The total is picked by default.
      await expect(total).toHaveAttribute('aria-pressed', 'true');
      await takeOff.click();
      await expect(takeOff).toHaveAttribute('aria-pressed', 'true');
      await expect(total).toHaveAttribute('aria-pressed', 'false');

      // The pick holds when the map is opened again.
      await page.keyboard.press('Escape');
      await openMap.click();
      await expect(takeOff).toHaveAttribute('aria-pressed', 'true');

      // Picked again, the step gives way to the total.
      await takeOff.click();
      await expect(total).toHaveAttribute('aria-pressed', 'true');
      await expect(takeOff).toHaveAttribute('aria-pressed', 'false');

      // A new trip starts on its total.
      await takeOff.click();
      await page.keyboard.press('Escape');
      await planner.select(planner.to, 'Eve');
      await openMap.click();
      await expect(total).toHaveAttribute('aria-pressed', 'true');
    });
  }

  test('closes from the top right corner on wide screens', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();

    await page
      .getByRole('button', { name: 'Open the map in full screen' })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Δv map' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading')).toHaveCount(0);
    // Reset stays in the panel on wide screens.
    await expect(
      dialog.getByRole('button', { name: 'Reset path' }),
    ).toBeHidden();

    const close = dialog.getByRole('button', { name: 'Close' });
    const notes = dialog.getByRole('button', { name: 'Reading the numbers' });
    const viewport = page.viewportSize();
    // Measured once the dialog has finished growing in.
    await expect
      .poll(async () => {
        const [button, below] = await Promise.all([
          close.boundingBox(),
          notes.boundingBox(),
        ]);
        return (
          !!button &&
          !!below &&
          button.y < 24 &&
          button.x + button.width > (viewport?.width ?? 0) - 24 &&
          Math.abs(below.x - button.x) < 1 &&
          below.y > button.y + button.height
        );
      })
      .toBe(true);

    await close.click();
    await expect(dialog).toBeHidden();
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

test.describe('Reading the numbers', () => {
  test('opens from below the full screen button', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    const fullScreen = page.getByRole('button', {
      name: 'Open the map in full screen',
    });
    const button = page.getByRole('button', { name: 'Reading the numbers' });
    const [above, below] = await Promise.all([
      fullScreen.boundingBox(),
      button.boundingBox(),
    ]);
    expect(Math.abs((below?.x ?? 0) - (above?.x ?? 0))).toBeLessThan(1);
    expect(below?.y ?? 0).toBeGreaterThan(
      (above?.y ?? 0) + (above?.height ?? 0),
    );

    await button.click();
    const dialog = page.getByRole('dialog', { name: 'Reading the numbers' });
    await expect(dialog).toContainText('All values are vacuum Δv, in m/s.');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
  });

  for (const [name, width, height, open] of [
    ['wide', 1280, 720, 'Open the map in full screen'],
    ['narrow', 390, 844, 'Map'],
  ] as const) {
    test(`opens over the full screen map on ${name} screens`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      const planner = new PlannerPage(page);
      await planner.goto();
      await page.getByRole('button', { name: open, exact: true }).click();
      const map = page.getByRole('dialog', { name: 'Δv map' });

      await map.getByRole('button', { name: 'Reading the numbers' }).click();
      const dialog = page.getByRole('dialog', { name: 'Reading the numbers' });
      await expect(dialog).toContainText('All values are vacuum Δv, in m/s.');

      // Escape closes the notes only, back to the map.
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(map).toBeVisible();
      await expect(
        map.getByRole('button', { name: 'Reading the numbers' }),
      ).toBeFocused();
    });
  }
});
