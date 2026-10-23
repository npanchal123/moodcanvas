import { expect, test } from '@playwright/test';
import { calm, expectNoA11yViolations, skipOnboarding } from './helpers';

// Chromium's fake microphone: a steady tone, with permission already given.
test.use({
  launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] },
  permissions: ['microphone'],
});

test.beforeEach(async ({ page }) => {
  await calm(page);
});

test('record a whole visualization in your own voice, keep it, play it, delete it', async ({ page }) => {
  await skipOnboarding(page);
  const own = page.getByRole('region', { name: 'Record your own visualization' });
  await expect(own).toContainText('Recordings stay on this device.');
  await own.getByRole('button', { name: 'Start recording' }).click();
  await expect(own.getByText(/^Recording… 0:0\d/)).toBeVisible();
  await page.waitForTimeout(1500);
  await own.getByRole('button', { name: 'Stop' }).click();

  // Listen back, name it, keep it.
  await expect(own.locator('audio')).toHaveCount(1);
  await own.getByLabel('Name it').fill('My morning calm');
  await own.getByRole('button', { name: 'Save' }).click();
  await expect(own.getByText('Saved to My recordings.')).toBeVisible();
  await own.getByText('My recordings (1)').click();
  await expect(own.getByText('My morning calm')).toBeVisible();
  await expect(own.locator('audio[aria-label="My morning calm"]')).toHaveCount(1);
  await expectNoA11yViolations(page, 'own recordings');

  // Still there after a reload, then deleted for good.
  await page.reload();
  await own.getByText('My recordings (1)').click();
  await expect(own.getByText('My morning calm')).toBeVisible();
  page.once('dialog', (d) => void d.accept());
  await own.getByRole('button', { name: 'Delete: My morning calm' }).click();
  await expect(own.getByText('My morning calm')).toBeHidden();
});

test('read a visualization’s lines in your own voice, then play it with your voice', async ({ page }) => {
  await skipOnboarding(page);
  await page.getByRole('button', { name: 'Start Clear Sky' }).click();
  await page.getByRole('button', { name: '3 min' }).click();
  await expect(page.getByLabel('Use my recorded voice')).toBeHidden();
  await page.getByRole('button', { name: 'Record in my voice' }).click();

  await expect(page.getByRole('heading', { name: 'Record this visualization in your voice' })).toBeFocused();
  const progress = page.getByText(/lines recorded$/);
  await expect(progress).toHaveText(/^0 of \d+ lines recorded$/);
  await page.getByRole('button', { name: 'Record: Line 1' }).click();
  // Only one line records at a time.
  await expect(page.getByRole('button', { name: 'Record: Line 2' })).toBeDisabled();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Stop: Line 1' }).click();
  await expect(progress).toHaveText(/^1 of \d+ lines recorded$/);
  await expect(page.getByRole('button', { name: 'Play: Line 1' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Record again: Line 1' })).toBeVisible();
  await expectNoA11yViolations(page, 'line recorder');
  await page.getByRole('button', { name: 'Done' }).click();

  // Back on the start screen: your voice is used where you recorded.
  const mine = page.getByLabel('Use my recorded voice');
  await expect(mine).toBeChecked();
  await expect(page.getByText(/^1 of \d+ lines in your voice$/)).toBeVisible();
  await page.getByLabel('Background sound').uncheck();
  await page.getByRole('button', { name: 'Begin' }).click();
  await expect(page.getByText('Your own voice')).toBeVisible();
  await page.getByRole('button', { name: 'End', exact: true }).click();

  // The same words in another session reuse the recording; removing it takes it away everywhere.
  await page.getByRole('button', { name: 'Back to practices' }).click();
  await page.getByRole('button', { name: 'Start Clear Sky' }).click();
  await page.getByRole('button', { name: 'Record in my voice' }).click();
  await page.getByRole('button', { name: 'Remove: Line 1' }).click();
  await expect(progress).toHaveText(/^0 of \d+ lines recorded$/);
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByLabel('Use my recorded voice')).toBeHidden();
});
