import { expect, test } from '@playwright/test';
import { calm, create, FEELING_LABEL, skipOnboarding } from './helpers';

test.beforeEach(async ({ page }) => {
  await calm(page);
});

test('composes a personal visualization from the person’s words, with a before/after comparison', async ({ page }) => {
  await page.clock.install(); // Lets the test skip through the 3 minutes.
  await skipOnboarding(page);
  await create(page, 'I’m anxious about my exam tomorrow. Take me to my grandma’s garden in Shimla');

  await expect(page.getByRole('heading', { name: 'Your grandma’s garden in Shimla' })).toBeFocused();
  await expect(page.getByText('Place: your grandma’s garden in Shimla')).toBeVisible();
  await expect(page.getByText('About: the exam')).toBeVisible();
  await expect(page.getByText(/Feeling: Fear \/ Anxiety/)).toBeVisible();
  await page.getByText('Read the script').click();
  await expect(page.getByText('You told me you’re feeling anxious about the exam', { exact: false })).toBeVisible();

  await page.getByRole('button', { name: '3 min' }).click();
  await page.getByLabel('Voice guide').uncheck();
  await page.getByLabel('Background sound').uncheck();
  await page.getByRole('button', { name: 'Begin' }).click();
  await expect(page.getByText(/You told me you’re feeling anxious about the exam/)).toBeVisible();
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.getByRole('button', { name: 'Resume' }).click();
  await page.clock.runFor('04:00');

  await expect(page.getByRole('heading', { name: 'Well done' })).toBeFocused();
  await expect(page.getByText(/Before, your anxiety was \d+ out of 100/)).toBeVisible();
  await page.getByRole('slider').press('Home');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Fear / Anxiety:' })).toContainText('→ 0');

  await page.getByRole('button', { name: 'Journal' }).click();
  await expect(page.getByRole('region', { name: 'Practice log' })).toContainText('Your grandma’s garden in Shimla · 3 min');
});

test('places and goals can be picked without writing anything', async ({ page }) => {
  await skipOnboarding(page);
  await page.getByRole('button', { name: 'Create my visualization' }).click();
  await expect(page.getByRole('alert')).toHaveText(
    'Tell me a little about how you feel, or pick a place or what would help.',
  );
  await page.getByRole('button', { name: 'Mountains', exact: true }).click();
  await page.getByRole('button', { name: 'Confidence', exact: true }).click();
  await page.getByRole('button', { name: 'Create my visualization' }).click();
  await expect(page.getByRole('heading', { name: 'Mountain View' })).toBeVisible();
  await expect(page.getByText('Focus: Confidence')).toBeVisible();
  // Back keeps what was chosen.
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByRole('button', { name: 'Mountains', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('the site name leads back to the front page', async ({ page }) => {
  await skipOnboarding(page);
  await create(page, 'Take me to the beach');
  await page.getByRole('link', { name: /^viz it/ }).click();
  await expect(page.getByLabel(FEELING_LABEL)).toBeVisible();
  await page.getByRole('button', { name: 'Journal' }).click();
  await page.getByRole('link', { name: /^viz it/ }).click();
  await expect(page.getByRole('button', { name: 'Visualize' })).toHaveAttribute('aria-current', 'page');
});

test('an example fills the box', async ({ page }) => {
  await skipOnboarding(page);
  await page.getByText('Need an idea? Try one:').click();
  await page.getByRole('button', { name: /I can’t sleep, my mind keeps racing about work/ }).click();
  await expect(page.getByLabel(FEELING_LABEL)).toHaveValue('I can’t sleep, my mind keeps racing about work.');
  await page.getByRole('button', { name: 'Create my visualization' }).click();
  await expect(page.getByText('Focus: Sleep')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Starry Night' })).toBeVisible();
});

test('insights appear once a topic has enough check-ins', async ({ page }) => {
  await skipOnboarding(page);
  for (let i = 0; i < 3; i++) await create(page, 'Calm and relaxed after my workout');
  for (let i = 0; i < 3; i++) await create(page, 'Really anxious and stressed about work');
  await page.getByRole('button', { name: 'Journal' }).click();
  const insights = page.getByRole('region', { name: 'Patterns you might notice' });
  await expect(insights).toContainText('You tend to feel lighter on check-ins tagged “exercise”.');
  await expect(insights).toContainText('Check-ins tagged “work” tend to feel heavier than your others.');
});

test('a due reminder shows a banner that leads to the front page', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('moodcanvas.reminder', JSON.stringify({ enabled: true, time: '00:00' })),
  );
  await skipOnboarding(page);
  const banner = page.getByText('It’s your check-in time');
  await expect(banner).toBeVisible();
  await page.getByRole('button', { name: 'Check in now' }).click();
  await expect(page.getByLabel(FEELING_LABEL)).toBeFocused();
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
  await page.getByRole('button', { name: 'Journal' }).click();
  // Re-read as sadness; the user's own rating (6 → 60) and tag are kept.
  await expect(page.getByText('Sadness · 60/100 (your rating)')).toBeVisible();
});

test.describe('crisis support in India', () => {
  test.use({ timezoneId: 'Asia/Kolkata' });

  test('worrying words show the local helpline instead of a visualization', async ({ page }) => {
    await skipOnboarding(page);
    await page.getByLabel(FEELING_LABEL).fill('Some days I want to die');
    await page.getByRole('button', { name: 'Create my visualization' }).click();
    // Shown because of what was written, so it's announced as a status message.
    const banner = page.getByRole('status', { name: 'It sounds like you’re going through something really hard.' });
    await expect(banner.getByRole('link', { name: 'Call 14416' })).toHaveAttribute('href', 'tel:14416');
    await expect(banner.getByRole('link', { name: '112', exact: true })).toHaveAttribute('href', 'tel:112');
    await expect(page.locator('#session-heading')).toBeHidden();
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
  await page.getByRole('button', { name: 'Journal' }).click();
  await expect(page).not.toHaveURL(/#privacy/);
});

test('beginners can learn the basics and try a first practice', async ({ page }) => {
  await skipOnboarding(page);
  await page.getByRole('button', { name: 'Try a 3-minute first visualization' }).click();
  await expect(page.getByRole('heading', { name: 'Your first visualization' })).toBeVisible();
  // It has one length, so there's no length choice.
  await expect(page.getByText('How long?')).toBeHidden();
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('button', { name: 'Library', exact: true }).click();
  await page.getByText('What if I can’t see pictures?').click();
  await expect(page.getByText(/That’s very common/)).toBeVisible();
});

test('Hindi: a Hinglish request becomes a visualization spoken in Hindi', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => localStorage.setItem('moodcanvas.locale', '"hi"'));
  await page.goto('/');
  await page.getByRole('button', { name: 'छोड़ें' }).click();
  await page
    .getByLabel('मन में क्या चल रहा है, और आप किस चीज़ की कल्पना करना चाहते हैं?')
    .fill('neend nahi aa rahi, kaam ki tension hai, baarish wali feeling chahiye');
  await page.getByRole('button', { name: 'मेरा विज़ुअलाइज़ेशन बनाएँ' }).click();
  await expect(page.getByRole('heading', { name: 'बारिश का सुकून' })).toBeVisible();
  await expect(page.getByText('मकसद: नींद')).toBeVisible();
  await page.getByLabel('आवाज़ से मार्गदर्शन').uncheck();
  await page.getByLabel('पीछे हल्की आवाज़').uncheck();
  await page.getByRole('button', { name: 'शुरू करें', exact: true }).click();
  await expect(page.getByText(/आपने बताया कि आप चिंतित महसूस कर रहे हैं, काम को लेकर/)).toBeVisible();
  await page.getByRole('button', { name: 'खत्म करें' }).click();
  await expect(page.getByRole('heading', { name: 'अभ्यास खत्म' })).toBeVisible();
});

test('Arabic reads right to left and composes in Arabic', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('moodcanvas.locale', '"ar"'));
  await page.goto('/');
  await page.getByRole('button', { name: 'تخطٍّ' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByLabel('ما الذي في بالك، وما الذي تودّ تخيّله؟').fill('أنا قلق من الامتحان، خذني إلى حديقة جدتي');
  await page.getByRole('button', { name: 'إنشاء تخيّلي' }).click();
  await expect(page.getByText('المكان: حديقة جدتك')).toBeVisible();
  await page.getByText('قراءة النص').click();
  await expect(page.getByText('القلق بشأن الامتحان شعور مفهوم تمامًا', { exact: false })).toBeVisible();
});

test('works offline once loaded (installable app)', async ({ page, context }) => {
  await skipOnboarding(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); // now controlled by the service worker
  await context.setOffline(true);
  await page.reload();
  await create(page, 'Happy even offline, take me to a garden');
  await expect(page.getByText(/Feeling: Joy/)).toBeVisible();
  const manifest = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifest).toBeTruthy();
});
