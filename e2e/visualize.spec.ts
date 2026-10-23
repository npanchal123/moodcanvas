import { expect, test, type Page } from '@playwright/test';
import { calm, expectNoA11yViolations, FEELING_LABEL, skipOnboarding } from './helpers';

test.beforeEach(async ({ page }) => {
  await calm(page);
});

const MATCH = 'Help me prepare mentally for an important cricket match';

async function readScript(page: Page): Promise<string[]> {
  const details = page.locator('details').filter({ hasText: 'Read the script' });
  if (!(await details.evaluate((d) => (d as HTMLDetailsElement).open))) await details.locator('summary').click();
  return details.locator('li').allInnerTexts();
}

test('a session from words alone: a suggested mode, a personal script and a 5-minute default', async ({ page }) => {
  await skipOnboarding(page);
  await page.getByLabel(FEELING_LABEL).fill(MATCH);
  await expect(page.getByText('Suggested: Process visualization. You mentioned preparing for or practising something.')).toBeVisible();
  await expectNoA11yViolations(page, 'front page with a suggestion');
  await page.getByRole('button', { name: 'Create my visualization' }).click();

  await expect(page.getByText('Mode: Process visualization')).toBeVisible();
  await expect(page.getByRole('button', { name: '5 min', exact: true })).toHaveAttribute('aria-pressed', 'true');
  for (const m of ['2 min', '10 min', '15 min']) await expect(page.getByRole('button', { name: m, exact: true })).toBeVisible();
  await expect(page.getByText(/^About 5 min\. Timing is an estimate\./)).toBeVisible();

  const lines = await readScript(page);
  // About the game the person named, with a way in for people who don't picture things.
  expect(lines.join(' ')).toMatch(/the game/);
  expect(lines[1]).toMatch(/If you naturally picture scenes/);
  expect(lines.join(' ')).toMatch(/choose one action from this rehearsal/);
  await expectNoA11yViolations(page, 'session options');
});

test('modes can be chosen by hand; longer sessions have more to them; breathing can be left out', async ({ page }) => {
  await skipOnboarding(page);
  await page.getByLabel(FEELING_LABEL).fill('I’m nervous about my presentation tomorrow');
  await expect(page.getByText(/^Suggested: Obstacle rehearsal\./)).toBeVisible();
  await page.getByRole('button', { name: /Future vision/ }).click();
  await expect(page.getByRole('button', { name: /Future vision/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(/^Suggested:/)).toBeHidden();
  await page.getByRole('button', { name: 'Create my visualization' }).click();
  await expect(page.getByText('Mode: Future vision')).toBeVisible();

  await page.getByRole('button', { name: '2 min', exact: true }).click();
  const short = await readScript(page);
  await page.getByRole('button', { name: '15 min', exact: true }).click();
  await expect(page.getByText(/^About 15 min/)).toBeVisible();
  const long = await readScript(page);
  expect(long.length).toBeGreaterThan(short.length);
  expect(long.join(' ')).toMatch(/Breathe in slowly/);

  await page.getByLabel('Breathing cues').uncheck();
  expect((await readScript(page)).join(' ')).not.toMatch(/Breathe in slowly/);
});

test('saved to the Library before starting, then made again with changes', async ({ page }) => {
  await skipOnboarding(page);
  await page.getByLabel(FEELING_LABEL).fill(MATCH);
  await page.getByRole('button', { name: 'Forest', exact: true }).click();
  await page.getByRole('button', { name: 'Create my visualization' }).click();
  await page.getByRole('button', { name: 'Save to my Library' }).click();
  await expect(page.getByText('Saved to your Library.')).toBeVisible();

  await page.getByRole('navigation').getByRole('button', { name: 'Library' }).click();
  const saved = page.getByRole('region', { name: 'My visualizations' });
  await saved.getByRole('button', { name: 'Edit and create again' }).click();
  await expect(page.getByLabel(FEELING_LABEL)).toHaveValue(MATCH);
  await expect(page.getByRole('button', { name: 'Forest', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /Process visualization/ })).toHaveAttribute('aria-pressed', 'true');
  // Change the place and make it again.
  await page.getByRole('button', { name: 'River', exact: true }).click();
  await page.getByRole('button', { name: 'Create my visualization' }).click();
  await expect(page.getByText(/Place: /)).toContainText(/river/i);
});

test('an optional reflection afterwards, saved to the Journal, with a way to make it again', async ({ page }) => {
  await page.clock.install();
  await skipOnboarding(page);
  await page.getByLabel(FEELING_LABEL).fill('Take me to a quiet beach');
  await page.getByRole('button', { name: 'Create my visualization' }).click();
  await page.getByRole('button', { name: '2 min', exact: true }).click();
  await page.getByLabel('Voice guide').uncheck();
  await page.getByLabel('Background sound').uncheck();
  await page.getByRole('button', { name: 'Begin' }).click();
  await page.getByRole('button', { name: 'Restart' }).click();
  await page.clock.runFor('06:00');

  await expect(page.getByText('How are you feeling now?')).toBeVisible();
  await page.getByRole('button', { name: 'Calmer' }).click();
  await page.getByRole('button', { name: 'More focused' }).click();
  await expectNoA11yViolations(page, 'reflection');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Saved. You’ll find it in your Journal.')).toBeVisible();

  await page.getByRole('navigation').getByRole('button', { name: 'Journal' }).click();
  const log = page.getByRole('region', { name: 'Practice log' });
  await expect(log).toContainText('Calmer, More focused');
  await log.getByRole('button', { name: 'Create again' }).click();
  await expect(page.getByLabel(FEELING_LABEL)).toHaveValue('Take me to a quiet beach');
});

test('skipping the reflection is fine; long text is capped; the form survives a reload', async ({ page }) => {
  await skipOnboarding(page);
  await page.getByLabel(FEELING_LABEL).fill('x'.repeat(700));
  await expect(page.getByLabel(FEELING_LABEL)).toHaveValue('x'.repeat(500));

  await page.getByLabel(FEELING_LABEL).fill('Imagine my life five years from now');
  await page.getByRole('button', { name: /Obstacle rehearsal/ }).click();
  await page.reload();
  await expect(page.getByLabel(FEELING_LABEL)).toHaveValue('Imagine my life five years from now');
  await expect(page.getByRole('button', { name: /Obstacle rehearsal/ })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Create my visualization' }).click();
  await page.getByLabel('Voice guide').uncheck();
  await page.getByLabel('Background sound').uncheck();
  await page.getByRole('button', { name: 'Begin' }).click();
  await page.getByRole('button', { name: 'End', exact: true }).click();
  await page.getByRole('button', { name: 'Skip' }).click();
  await expect(page.getByText('How are you feeling now?')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Create again' })).toBeVisible();
});
