import { expect, test } from '@playwright/test';
import { calm, checkIn, skipOnboarding } from './helpers';

test.beforeEach(async ({ page }) => {
  await calm(page);
});

test('insights appear once a tag has enough check-ins', async ({ page }) => {
  await skipOnboarding(page);
  for (let i = 0; i < 3; i++) await checkIn(page, 'Calm and relaxed', 'exercise');
  for (let i = 0; i < 3; i++) await checkIn(page, 'Really anxious and stressed', 'work');
  await page.getByRole('button', { name: 'History' }).click();
  const insights = page.getByRole('region', { name: 'Patterns you might notice' });
  await expect(insights).toContainText('You tend to feel lighter on check-ins tagged “exercise”.');
  await expect(insights).toContainText('Check-ins tagged “work” tend to feel heavier than your others.');
});

test('a due reminder shows a banner that leads to a check-in', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('moodcanvas.reminder', JSON.stringify({ enabled: true, time: '00:00' })),
  );
  await skipOnboarding(page);
  const banner = page.getByText('It’s your check-in time');
  await expect(banner).toBeVisible();
  await page.getByRole('button', { name: 'Check in now' }).click();
  await expect(page.getByLabel('How are you feeling?')).toBeFocused();
  await expect(banner).toBeHidden();
});

test('the reminder calendar file downloads', async ({ page }) => {
  await skipOnboarding(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Add a daily reminder to my calendar' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('vizit-reminder.ics');
});

test('theme and language switch immediately and persist', async ({ page }) => {
  await skipOnboarding(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('High contrast').check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'contrast');
  await page.getByLabel('Language', { exact: true }).selectOption('es');
  await expect(page.getByRole('heading', { name: 'Pantalla e idioma' })).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'contrast');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});

test('older check-ins can be re-read with the current word list', async ({ page }) => {
  await skipOnboarding(page);
  // An entry saved by Phase 1's analyzer, which didn't know Spanish.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const req = indexedDB.open('moodcanvas');
        req.onsuccess = () => {
          const tx = req.result.transaction('entries', 'readwrite');
          const t = new Date(Date.now() - 86_400_000).toISOString();
          tx.objectStore('entries').put({
            id: 'old-1', createdAt: t, updatedAt: t, dirty: 0, text: 'Estoy muy triste hoy',
            emotions: [{ label: 'calm', intensity: 20 }], valence: 0, confidence: 0.2, userAdjusted: true,
            userRating: 6, tags: ['family'], analyzerVersion: 'lexicon-1.0',
          });
          tx.oncomplete = () => resolve();
        };
      }),
  );
  await page.reload();
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Update them' }).click();
  await expect(page.getByText('Updated 1 check-in.')).toBeVisible();
  await page.getByRole('button', { name: 'History' }).click();
  // Re-read as sadness; the user's own rating (6 → 60) and tag are kept.
  await expect(page.getByText('Sadness · 60/100 (your rating)')).toBeVisible();
});

test.describe('crisis support in India', () => {
  test.use({ timezoneId: 'Asia/Kolkata' });

  test('worrying words show the local helpline and emergency number', async ({ page }) => {
    await skipOnboarding(page);
    await page.getByLabel('How are you feeling?').fill('Some days I want to die');
    await page.getByRole('button', { name: 'Visualize' }).click();
    // Shown because of what was written, so it's announced as a status message.
    const banner = page.getByRole('status', { name: 'It sounds like you’re going through something really hard.' });
    await expect(banner.getByRole('link', { name: 'Call 14416' })).toHaveAttribute('href', 'tel:14416');
    await expect(banner.getByRole('link', { name: '112', exact: true })).toHaveAttribute('href', 'tel:112');
    await banner.getByRole('button', { name: 'Close' }).click();
    await expect(banner).toBeHidden();
  });
});

test('support lines are always one tap away', async ({ page }) => {
  await skipOnboarding(page);
  await page.getByRole('button', { name: 'Get support now' }).click();
  await expect(page.getByRole('heading', { name: 'Talk to someone now' })).toBeFocused();
  await page.getByText('Support lines in other countries').click();
  await expect(page.getByRole('link', { name: 'Call 116 123' }).first()).toBeVisible();
});

test('the privacy page has its own link and skips onboarding', async ({ page }) => {
  await page.goto('/#privacy');
  await expect(page.getByRole('heading', { name: 'Privacy', level: 2 })).toBeVisible();
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.getByRole('button', { name: 'History' }).click();
  await expect(page).not.toHaveURL(/#privacy/);
});

test('works offline once loaded (installable app)', async ({ page, context }) => {
  await skipOnboarding(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); // now controlled by the service worker
  await context.setOffline(true);
  await page.reload();
  await page.getByLabel('How are you feeling?').fill('Happy even offline');
  await page.getByRole('button', { name: 'Visualize' }).click();
  await expect(page.locator('#result-heading')).toContainText('joyful');
  const manifest = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifest).toBeTruthy();
});
