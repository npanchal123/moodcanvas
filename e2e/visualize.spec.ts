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

test('saved to My visualizations before starting, then made again with changes', async ({ page }) => {
  await skipOnboarding(page);
  await page.getByLabel(FEELING_LABEL).fill(MATCH);
  await page.getByRole('button', { name: 'Forest', exact: true }).click();
  await page.getByRole('button', { name: 'Create my visualization' }).click();
  await page.getByRole('button', { name: 'Save to My visualizations' }).click();
  await expect(page.getByText('Saved to My visualizations.')).toBeVisible();

  await page.getByRole('button', { name: 'Back' }).click();
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

test('ready-made visualizations, saved ones and the basics, all on the front page', async ({ page }) => {
  await skipOnboarding(page);
  const ready = page.getByRole('region', { name: 'Or start with a ready-made visualization' });
  await expect(ready.getByRole('button', { name: /^Start / })).toHaveCount(6);
  await expect(page.getByRole('region', { name: 'My visualizations' })).toBeHidden();
  // No Library tab any more: everything is here.
  await expect(page.getByRole('navigation').getByRole('button', { name: 'Library' })).toBeHidden();
  await expect(page.locator('summary', { hasText: 'What if I can’t see pictures?' })).toBeVisible();
  await expectNoA11yViolations(page, 'front page with ready-made visualizations');

  // Plays right here, without leaving Visualize.
  await ready.getByRole('button', { name: 'Start Clear Sky' }).click();
  await expect(page.getByRole('heading', { name: /Clear Sky/ })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Visualize' })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: 'Back' }).click();

  // A saved visualization shows up there too.
  await page.getByLabel(FEELING_LABEL).fill(MATCH);
  await page.getByRole('button', { name: 'Create my visualization' }).click();
  await page.getByRole('button', { name: 'Save to My visualizations' }).click();
  await expect(page.getByText('Saved to My visualizations.')).toBeVisible();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByRole('region', { name: 'My visualizations' })).toBeVisible();
});

test('the beginner’s path: five steps, ticked off as they’re done, then folded away', async ({ page }) => {
  await page.clock.install();
  await skipOnboarding(page);
  const path = page.getByRole('region', { name: 'Learn to visualize in 5 small steps' });
  await expect(path.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '0 of 5 done');
  await expectNoA11yViolations(page, 'beginner’s path');

  // The hero links straight to it.
  await page.getByRole('link', { name: /New here\? Start the beginner’s path/ }).click();
  await expect(path).toBeInViewport();

  // 1. The current step is open already: read, then mark it done.
  await expect(path.getByText(/You can still visualize by imagining sounds/).first()).toBeVisible();
  await path.getByRole('button', { name: 'Mark as done' }).click();
  await expect(path.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '1 of 5 done');

  // 2. The first try ticks itself once played.
  await path.getByRole('button', { name: 'Start (3 min)' }).click();
  await page.getByLabel('Voice guide').uncheck();
  await page.getByLabel('Background sound').uncheck();
  await page.getByRole('button', { name: 'Begin' }).click();
  await page.getByRole('button', { name: 'End', exact: true }).click();
  await page.getByRole('button', { name: 'Back to practices' }).click();
  await expect(path.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '2 of 5 done');

  // 3. The senses warm-up, now the current step, one prompt at a time.
  await expect(path.getByText(/See: picture a colour you love/)).toBeVisible();
  for (let i = 0; i < 4; i++) await path.getByRole('button', { name: 'Next' }).click();
  await expect(path.getByText(/Taste: imagine biting/)).toBeVisible();
  await expectNoA11yViolations(page, 'senses warm-up');
  await path.getByRole('button', { name: 'Finish' }).click();
  await expect(path.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '3 of 5 done');

  // 4. A full guided session.
  await path.getByRole('button', { name: 'Start Safe Place' }).click();
  await page.getByRole('button', { name: 'Begin' }).click();
  await page.getByRole('button', { name: 'End', exact: true }).click();
  await page.getByRole('button', { name: 'Back to practices' }).click();

  // 5. Make your own: it takes you to the box.
  await path.getByRole('button', { name: 'Write mine' }).click();
  await expect(page.getByLabel(FEELING_LABEL)).toBeFocused();
  await page.getByLabel(FEELING_LABEL).fill('Take me to a quiet beach');
  await page.getByRole('button', { name: 'Create my visualization' }).click();
  await page.getByRole('button', { name: 'Begin' }).click();
  await page.getByRole('button', { name: 'End', exact: true }).click();
  await page.getByRole('button', { name: 'Back to practices' }).click();

  // Done: folded into one line, and the hero link goes away.
  const done = page.getByRole('region', { name: 'Beginner’s path complete' });
  await expect(done).toBeVisible();
  await expect(page.getByRole('link', { name: /New here\?/ })).toBeHidden();
  await done.getByRole('button', { name: 'Revisit the path' }).click();
  await expect(page.getByRole('heading', { name: 'Tips for a good session' })).toBeVisible();
  await page.getByText('Is it okay to fall asleep?').click();
  await expect(page.getByText(/A calm session can lead to sleep/)).toBeVisible();
});
