import { expect, test } from '@playwright/test';
import { calm, create, expectNoA11yViolations, FEELING_LABEL, openApp, skipOnboarding } from './helpers';

// Every screen and dialog, in light, dark and high contrast.
for (const theme of ['light', 'dark', 'contrast'] as const) {
  test.describe(`accessibility: ${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await calm(page);
      await page.emulateMedia({ colorScheme: theme === 'dark' ? 'dark' : 'light', reducedMotion: 'reduce' });
      if (theme === 'contrast') {
        await page.addInitScript(() => localStorage.setItem('moodcanvas.theme', '"contrast"'));
      }
    });

    test('onboarding dialog', async ({ page }) => {
      await openApp(page);
      await expectNoA11yViolations(page, 'onboarding');
    });

    test('front page and a composed visualization', async ({ page }) => {
      await skipOnboarding(page);
      await page.getByRole('button', { name: 'Mountains', exact: true }).click();
      await page.getByText('Need an idea? Try one:').click();
      await expectNoA11yViolations(page, 'front page');
      await page.getByRole('button', { name: 'Mountains', exact: true }).click();
      await create(page, "I'm really anxious about tomorrow's exam. Take me to a quiet beach.");
      await page.getByText('Read the script').click();
      await expectNoA11yViolations(page, 'composed visualization');
    });

    test('journal with data', async ({ page }) => {
      await skipOnboarding(page);
      await create(page, 'So calm and relaxed after my workout');
      await create(page, 'Really anxious about work');
      await create(page, 'Calm and happy after yoga');
      await page.getByRole('button', { name: 'Journal' }).click();
      await page.getByRole('heading', { name: 'Mood calendar' }).waitFor();
      await page.getByText('Show as table').click();
      await expectNoA11yViolations(page, 'journal');
    });

    test('settings and AI consent dialog', async ({ page }) => {
      await skipOnboarding(page);
      await page.getByRole('button', { name: 'Settings' }).click();
      await page.getByRole('heading', { name: 'Reminders' }).waitFor();
      await expectNoA11yViolations(page, 'settings');
      await page.getByLabel(/Use AI to read my check-ins/).click();
      await page.getByRole('dialog', { name: 'Turn on smarter analysis?' }).waitFor();
      await expectNoA11yViolations(page, 'AI consent dialog');
    });

    test('library, playing and after-check', async ({ page }) => {
      await page.clock.install();
      await skipOnboarding(page);
      await page.getByRole('button', { name: 'Library', exact: true }).click();
      await page.getByRole('heading', { name: 'All practices' }).waitFor();
      await expectNoA11yViolations(page, 'library');
      await page.getByRole('button', { name: 'Start Clear Sky' }).click();
      await page.getByLabel('Voice guide').uncheck();
      await page.getByLabel('Background sound').uncheck();
      await page.getByRole('button', { name: 'Begin' }).click();
      await page.getByRole('button', { name: 'Pause' }).waitFor();
      await expectNoA11yViolations(page, 'practice playing');
      await page.getByRole('button', { name: 'End' }).click();
      await page.getByRole('button', { name: 'Better' }).waitFor();
      await expectNoA11yViolations(page, 'practice after');
    });

    test('privacy page and support lines', async ({ page }) => {
      await skipOnboarding(page);
      await page.getByRole('link', { name: 'Privacy' }).click();
      await page.getByRole('heading', { name: 'Privacy', level: 2 }).waitFor();
      await page.getByRole('button', { name: 'Get support now' }).click();
      await page.getByText('Support lines in other countries').click();
      await expectNoA11yViolations(page, 'privacy and support');
    });
  });
}

test('accessibility: Hindi', async ({ page }) => {
  await calm(page);
  await page.addInitScript(() => localStorage.setItem('moodcanvas.locale', '"hi"'));
  await openApp(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  await expectNoA11yViolations(page, 'Hindi onboarding');
  await page.getByRole('button', { name: 'छोड़ें' }).click();
  await page
    .getByLabel('मन में क्या चल रहा है, और आप किस चीज़ की कल्पना करना चाहते हैं?')
    .fill('कल की परीक्षा को लेकर बहुत घबराहट है, मुझे पहाड़ों पर ले चलो।');
  await expectNoA11yViolations(page, 'Hindi front page');
  await page.getByRole('button', { name: 'मेरा विज़ुअलाइज़ेशन बनाएँ' }).click();
  await expect(page.getByRole('heading', { name: 'पहाड़ की चोटी' })).toBeVisible();
  await expect(page.getByText('भावना: डर / चिंता')).toBeVisible();
  await expectNoA11yViolations(page, 'Hindi composed visualization');
  await page.getByRole('button', { name: 'लाइब्रेरी', exact: true }).click();
  await page.getByRole('heading', { name: 'सभी अभ्यास' }).waitFor();
  await expectNoA11yViolations(page, 'Hindi library');
});

test('accessibility: Spanish', async ({ page }) => {
  await calm(page);
  await page.addInitScript(() => localStorage.setItem('moodcanvas.locale', '"es"'));
  await openApp(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await page.getByRole('button', { name: 'Omitir' }).click();
  await page
    .getByLabel('¿Qué tienes en mente, y qué te gustaría imaginar?')
    .fill('Estoy muy ansiosa por el examen, llévame a una playa tranquila.');
  await page.getByRole('button', { name: 'Crear mi visualización' }).click();
  await expect(page.getByText(/Sentimiento: Miedo \/ Ansiedad/)).toBeVisible();
  await expect(page.getByText('Lugar: una playa tranquila')).toBeVisible();
  await expectNoA11yViolations(page, 'Spanish composed visualization');
});

// Keeps the label import honest if the front page wording changes.
test('the front page asks what to imagine', async ({ page }) => {
  await skipOnboarding(page);
  await expect(page.getByLabel(FEELING_LABEL)).toBeVisible();
});
