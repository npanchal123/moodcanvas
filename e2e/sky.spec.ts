import { expect, test } from '@playwright/test';
import { calm, skipOnboarding } from './helpers';

test.beforeEach(async ({ page }) => {
  await calm(page);
});

test('drag the sun across the background; it stays there until the sky is reset', async ({ page }) => {
  await skipOnboarding(page);
  const sun = page.locator('[data-friend="sun"]');
  const box = (await sun.boundingBox())!;
  const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const before = await sun.getAttribute('style');

  await page.mouse.move(from.x, from.y);
  await expect(page.locator('html')).toHaveClass(/sky-grab/);
  await page.mouse.down();
  await page.mouse.move(from.x - 40, from.y + 200, { steps: 8 });
  await page.mouse.up();
  const after = await sun.getAttribute('style');
  expect(after).not.toBe(before);
  const moved = (await sun.boundingBox())!;
  expect(Math.round(moved.y - box.y)).toBeGreaterThan(150);

  // Remembered after a reload.
  await page.reload();
  await expect(sun).toHaveAttribute('style', after!);

  // Buttons don't start a drag: clicking one still works.
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Reset the sky' }).click();
  await expect(page.getByText('The sky is back to how it started.')).toBeVisible();
  await expect(sun).toHaveAttribute('style', before!);
});
