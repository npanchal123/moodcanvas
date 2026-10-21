import { expect, test } from '@playwright/test';
import { calm, checkIn, expectNoA11yViolations, openApp, skipOnboarding } from './helpers';

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

    test('check in, result and share dialog', async ({ page }) => {
      await skipOnboarding(page);
      await expectNoA11yViolations(page, 'empty check-in');
      await checkIn(page, "I'm really anxious about tomorrow's exam but kind of excited too.", 'school');
      await expectNoA11yViolations(page, 'result');
      await page.getByRole('button', { name: 'Share or save image…' }).click();
      await page.getByRole('dialog', { name: 'Share or save' }).waitFor();
      await expectNoA11yViolations(page, 'share dialog');
    });

    test('history with data', async ({ page }) => {
      await skipOnboarding(page);
      await checkIn(page, 'So calm and relaxed after my walk', 'exercise');
      await checkIn(page, 'Really anxious about work', 'work');
      await checkIn(page, 'Calm and happy', 'exercise');
      await page.getByRole('button', { name: 'History' }).click();
      await page.getByRole('heading', { name: 'Mood calendar' }).waitFor();
      await page.getByText('Show as table').click();
      await expectNoA11yViolations(page, 'history');
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

    test('practice tab, session and after-check', async ({ page }) => {
      await page.clock.install();
      await skipOnboarding(page);
      await page.getByRole('button', { name: 'Practice', exact: true }).click();
      await page.getByRole('heading', { name: 'All practices' }).waitFor();
      await expectNoA11yViolations(page, 'practice tab');
      await page.getByRole('button', { name: 'Start Clear Sky' }).click();
      await page.getByRole('button', { name: 'Begin' }).waitFor();
      await expectNoA11yViolations(page, 'practice start');
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
  await page.getByLabel('आप कैसा महसूस कर रहे हैं?').fill('कल के एग्ज़ाम को लेकर बहुत चिंता है, पर थोड़ी खुशी भी है।');
  await page.getByRole('button', { name: 'दिखाएँ' }).click();
  await expect(page.locator('#result-heading')).toContainText('ज़्यादातर चिंतित');
  await expectNoA11yViolations(page, 'Hindi result');
  await page.getByRole('button', { name: 'अभ्यास', exact: true }).click();
  await page.getByRole('heading', { name: 'सभी अभ्यास' }).waitFor();
  await expectNoA11yViolations(page, 'Hindi practice tab');
});

test('accessibility: Spanish', async ({ page }) => {
  await calm(page);
  await page.addInitScript(() => localStorage.setItem('moodcanvas.locale', '"es"'));
  await openApp(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await page.getByRole('button', { name: 'Omitir' }).click();
  await page.getByLabel('¿Cómo te sientes?').fill('Estoy muy ansiosa por el examen, pero un poco emocionada.');
  await page.getByRole('button', { name: 'Visualizar' }).click();
  await expect(page.locator('#result-heading')).toHaveText('Sobre todo ansioso/a · 75 de 100, con algo de alegría');
  await expectNoA11yViolations(page, 'Spanish result');
});
