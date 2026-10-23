import { expect, test, type Page } from '@playwright/test';
import { calm, expectNoA11yViolations, skipOnboarding } from './helpers';

test.beforeEach(async ({ page }) => {
  await calm(page);
});

async function openBreaker(page: Page) {
  await page.getByRole('button', { name: 'Unstuck' }).click();
  await page.getByRole('heading', { name: 'What are you putting off today?' }).waitFor();
}

async function enterTask(page: Page, task: string) {
  await page.getByLabel('The task you’re putting off').fill(task);
  await page.getByRole('button', { name: 'Help me get started' }).click();
}

test('from a task that keeps being put off to a finished first step, in two screens', async ({ page }) => {
  await page.clock.install();
  await skipOnboarding(page);
  await openBreaker(page);

  // Nothing typed yet.
  await page.getByRole('button', { name: 'Help me get started' }).click();
  await expect(page.getByRole('alert')).toHaveText('Write a few words about the task first.');

  // What makes it hard is optional, and on the same screen as the task.
  await page.getByLabel('The task you’re putting off').fill('I’m avoiding learning Python');
  await page.getByRole('button', { name: 'The task feels too big.' }).click();
  await page.getByRole('button', { name: 'I’m distracted by my phone or other things.' }).click();
  await expect(page.getByRole('button', { name: 'The task feels too big.' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Help me get started' }).click();

  // The first step fits a big task: about two minutes. It can be made smaller or swapped.
  await expect(page.getByRole('heading', { name: 'Let’s make the first step easier.' })).toBeFocused();
  await expect(page.getByText(/put your phone out of reach/)).toBeVisible();
  const step = page.getByLabel('Your tiny next step');
  await expect(step).toHaveValue('Open your code editor and run one simple print statement.');
  await page.getByRole('button', { name: 'Make it smaller' }).click();
  await expect(step).toHaveValue('Open your code editor or the course page.');
  await expect(page.getByRole('button', { name: 'Make it smaller' })).toBeDisabled();
  await page.getByRole('button', { name: 'Show another' }).click();
  await step.fill('Run print("hello") in Python');

  // Going back keeps every answer.
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByLabel('The task you’re putting off')).toHaveValue('I’m avoiding learning Python');
  await page.getByRole('button', { name: 'Help me get started' }).click();
  await expect(step).toHaveValue('Run print("hello") in Python');

  // An empty step can't be started. Two minutes is the default.
  await step.fill('');
  await page.getByRole('button', { name: 'Start now' }).click();
  await expect(page.getByRole('alert')).toHaveText('Write a small step first.');
  await step.fill('Run print("hello") in Python');
  await expect(page.getByRole('button', { name: '2-minute start' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Start now' }).click();

  // Timer.
  await expect(page.getByRole('heading', { name: 'Run print("hello") in Python' })).toBeFocused();
  await expect(page.getByRole('timer')).toContainText('2:00');
  await page.clock.runFor(30_000);
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.clock.runFor(60_000);
  await expect(page.getByRole('timer')).toContainText('1:30');
  await page.getByRole('button', { name: 'Resume' }).click();
  await page.clock.runFor(100_000);
  await expect(page.getByText('Time’s up. Take a breath.')).toBeVisible();

  // Done is saved in one tap.
  await page.getByRole('button', { name: 'I did it' }).click();
  await expect(page.getByRole('heading', { name: 'Nicely done.' })).toBeFocused();
  await expect(page.getByText('A good next step')).toBeVisible();

  // My progress shows the saved session and counts from it.
  await page.getByRole('button', { name: 'My progress' }).click();
  const stats = page.locator('dl').first();
  await expect(stats).toContainText('Sessions1');
  await expect(stats).toContainText('Actions completed1');
  await expect(stats).toContainText('Focus time2 min');
  await expect(page.getByRole('heading', { name: 'I’m avoiding learning Python' })).toBeVisible();
  await page.getByRole('button', { name: 'Partial progress' }).click();
  await expect(page.getByText('No sessions like this yet.')).toBeVisible();
  await page.getByRole('button', { name: 'All sessions' }).click();

  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('No sessions yet.', { exact: false })).toBeVisible();
});

test('a running session survives switching pages and reloading', async ({ page }) => {
  await skipOnboarding(page);
  await openBreaker(page);
  // No obstacle chosen: straight to a two-minute step.
  await enterTask(page, 'Clean my room');
  await expect(page.getByLabel('Your tiny next step')).toHaveValue('Put away five things that are out of place.');
  await page.getByRole('button', { name: '10-minute focus' }).click();
  await page.getByRole('button', { name: 'Start now' }).click();
  await page.getByRole('timer').waitFor();

  await page.getByRole('button', { name: 'Journal' }).click();
  await page.reload();
  await openBreaker(page);
  await expect(page.getByText('You have a focus session open.')).toBeVisible();
  await page.getByRole('button', { name: 'Back to my session' }).click();
  await expect(page.getByRole('timer')).toBeVisible();

  // Stopping early still records progress, in one tap.
  await page.getByRole('button', { name: 'Stop' }).click();
  await page.getByRole('button', { name: 'I made some progress.' }).click();
  await expect(page.getByRole('heading', { name: 'Progress counts.' })).toBeVisible();
  await page.getByRole('button', { name: 'Pause for now' }).click();
  await expect(page.getByRole('heading', { name: 'Pick up where you left off' })).toBeVisible();
});

test('resting and rescheduling, then picking the task back up', async ({ page }) => {
  await skipOnboarding(page);
  await openBreaker(page);
  await page.getByLabel('The task you’re putting off').fill('Go to the gym');
  await page.getByRole('button', { name: 'I’m tired or low on energy.' }).click();
  await page.getByRole('button', { name: 'Help me get started' }).click();
  await expect(page.getByLabel('Your tiny next step')).toHaveValue('Put on your workout clothes and prepare your exercise space.');
  await page.getByRole('button', { name: 'Rest now and plan it for later' }).click();

  await expect(page.getByRole('button', { name: 'I decided to reschedule.' })).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('alert')).toHaveText('Choose a date and time.');
  await page.getByLabel('When will you come back to it?').fill('2030-01-15T09:30');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('heading', { name: 'It’s in your plan.' })).toBeVisible();
  await page.getByRole('button', { name: 'Finish for now' }).click();

  const open = page.getByRole('region', { name: 'Pick up where you left off' });
  await expect(open).toContainText('Go to the gym');
  await expect(open).toContainText('Planned for');
  await open.getByRole('button', { name: 'Pick this up again' }).click();

  // Straight back to the step, ready to start.
  await expect(page.getByLabel('Your tiny next step')).toHaveValue('Put on your workout clothes and prepare your exercise space.');
  await page.getByRole('button', { name: 'Start now' }).click();
  await page.getByRole('button', { name: 'I did it' }).click();
  await expect(page.getByRole('heading', { name: 'Nicely done.' })).toBeVisible();

  await page.getByRole('button', { name: 'My progress' }).click();
  await expect(page.locator('dl').first()).toContainText('Picked up after postponing1');
});

for (const scheme of ['light', 'dark'] as const) {
  test(`Procrastination Breaker is accessible (${scheme})`, async ({ page }) => {
    test.setTimeout(60_000); // Five full accessibility scans.
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    await skipOnboarding(page);
    await openBreaker(page);
    await page.getByLabel('The task you’re putting off').fill('Study for my exam');
    await page.getByRole('button', { name: 'I don’t know where to start.' }).click();
    await page.getByRole('button', { name: 'I’m tired or low on energy.' }).click();
    await expectNoA11yViolations(page, 'entry');
    await page.getByRole('button', { name: 'Help me get started' }).click();
    await expectNoA11yViolations(page, 'first step');
    await page.getByRole('button', { name: 'Start now' }).click();
    await page.getByRole('timer').waitFor();
    await expectNoA11yViolations(page, 'timer');
    await page.getByRole('button', { name: 'Stop' }).click();
    await page.getByRole('button', { name: 'I decided to reschedule.' }).click();
    await expectNoA11yViolations(page, 'reflection');
    await page.getByLabel('When will you come back to it?').fill('2030-01-15T09:30');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'My progress' }).click();
    await expectNoA11yViolations(page, 'progress');
  });
}

test('works in Hindi, with steps for the kind of task', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('moodcanvas.locale', '"hi"');
    localStorage.setItem('moodcanvas.onboarded', 'true');
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'शुरुआत' }).click();
  await page.getByLabel('वह काम जिसे आप टाल रहे हैं').fill('नौकरी के लिए आवेदन करना है');
  await page.getByRole('button', { name: 'समझ नहीं आ रहा कहाँ से शुरू करूँ।' }).click();
  await page.getByRole('button', { name: 'शुरू करने में मेरी मदद करें' }).click();
  await expect(page.getByLabel('आपका छोटा अगला कदम')).toHaveValue('एक सही नौकरी की वैकेंसी ढूँढें और उसका लिंक सेव करें।');
});
