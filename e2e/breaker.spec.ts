import { expect, test, type Page } from '@playwright/test';
import { calm, expectNoA11yViolations, skipOnboarding } from './helpers';

test.beforeEach(async ({ page }) => {
  await calm(page);
});

const WHATS_ON_MIND = 'What has been on your mind lately?';
const VIDEO = 'I want to start my YouTube channel, but I keep delaying my first video because I don’t know how to edit.';

async function openUnstuck(page: Page) {
  await page.getByRole('button', { name: 'Unstuck' }).click();
  await page.getByRole('heading', { name: 'What’s keeping you stuck?' }).waitFor();
}

/** Habits is its own section now; the day's to-do list lives there too. */
async function openHabits(page: Page) {
  await page.getByRole('navigation').getByRole('button', { name: 'Habits' }).click();
}

async function openTodo(page: Page) {
  await openHabits(page);
  await page.getByRole('button', { name: 'To-do list' }).click();
}

/** Plays the visualization at its shortest length, silently, to the end (or ends it early). */
async function playVisualization(page: Page, finish: 'end' | 'early' = 'end') {
  await page.locator('#session-heading').waitFor();
  await page.getByRole('button', { name: '2 min' }).click();
  await page.getByLabel('Voice guide').uncheck();
  await page.getByLabel('Background sound').uncheck();
  await page.getByRole('button', { name: 'Begin' }).click();
  if (finish === 'early') {
    await page.getByRole('button', { name: 'End', exact: true }).click();
  } else {
    await page.clock.runFor('06:00');
  }
  await page.getByRole('heading', { name: 'What’s one small thing you can do now?' }).waitFor();
}

test('the whole journey: understand, visualize, act, reflect, and find it in the Journal and My visualizations', async ({ page }) => {
  test.setTimeout(90_000); // The longest journey in the suite.
  await page.clock.install();
  await skipOnboarding(page);
  await openUnstuck(page);

  // Welcome: nothing chosen yet gets a gentle prompt.
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('alert')).toHaveText('Choose a card or write a few words, whichever is easier.');
  await page.getByRole('button', { name: 'I’m procrastinating.' }).click();
  await page.getByLabel(WHATS_ON_MIND).fill(VIDEO);
  await page.getByRole('button', { name: 'Continue' }).click();

  // Understand: a short reflection and a possible obstacle, offered, not claimed.
  await expect(page.getByRole('heading', { name: 'Here’s what I’m hearing' })).toBeFocused();
  await expect(page.getByText(/It sounds like you want to get started/)).toBeVisible();
  await expect(page.getByText('Part of it might be this: I don’t know where to start.')).toBeVisible();
  await page.getByRole('button', { name: 'The whole task feels too big.' }).click();
  await page.getByRole('button', { name: /Ready to take action/ }).click();
  await page.getByRole('button', { name: /^Confident/ }).click();
  await expect(page.getByRole('button', { name: /Ready to take action/ })).toContainText('Main');
  await page.getByRole('button', { name: 'Forest', exact: true }).click();
  await page.getByRole('button', { name: 'Create my visualization' }).click();

  // The visualization: works for people who don't picture things, and rehearses a small start.
  await page.locator('#session-heading').waitFor();
  await page.getByText('Read the script').click();
  await expect(page.getByText(/If not, simply follow the words/)).toBeVisible();
  await playVisualization(page);

  // Act: a step that fits a video, made smaller, then edited.
  await expect(page.getByText('You finished the visualization.')).toBeVisible();
  const step = page.getByLabel('Your small step');
  await expect(step).toHaveValue('Write three rough ideas for your next piece.');
  await page.getByRole('button', { name: 'Make it smaller' }).click();
  await expect(step).toHaveValue('Open a blank page and give it a working title.');
  await step.fill('Watch one 5-minute editing tutorial');
  await page.getByRole('button', { name: 'Start now' }).click();
  await expect(page.getByRole('button', { name: '2 minutes' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '5 minutes' }).click();
  await page.getByRole('button', { name: 'Start', exact: true }).click();

  // Focus timer: pause, resume, restart, finish early.
  await expect(page.getByRole('heading', { name: 'Watch one 5-minute editing tutorial' })).toBeFocused();
  // Real seconds can slip by on a slow machine, so the timer checks allow a few.
  await expect(page.getByRole('timer')).toContainText(/5:00|4:[45]\d/);
  await page.clock.runFor(60_000);
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.clock.runFor(60_000);
  await expect(page.getByRole('timer')).toContainText(/4:00|3:[45]\d/);
  await page.getByRole('button', { name: 'Resume' }).click();
  await page.getByRole('button', { name: 'Restart' }).click();
  await expect(page.getByRole('timer')).toContainText(/5:00|4:[45]\d/);
  await page.clock.runFor(120_000);
  await page.getByRole('button', { name: 'Finish early' }).click();

  // How it went, in one tap, then a supportive next step and an optional reflection.
  await expect(page.getByRole('heading', { name: 'How did it go?' })).toBeFocused();
  await page.getByRole('button', { name: 'I made some progress.' }).click();
  await expect(page.getByRole('heading', { name: 'Progress counts.' })).toBeFocused();
  await expect(page.getByText('Progress counts, even when the task isn’t finished.')).toBeVisible();
  await page.getByRole('textbox', { name: 'What did you notice?' }).fill('Starting was easier than expected');
  await page.getByLabel('What’s one thing you’d like to do next?').fill('Edit the intro');
  await page.getByLabel(/Also keep the visualization’s words/).check();
  await page.getByRole('button', { name: 'Save session' }).click();
  await expect(page.getByText('Saved to your Journal.')).toBeVisible();
  await page.getByRole('button', { name: 'Save to My visualizations' }).click();
  await expect(page.getByText('Saved to My visualizations.')).toBeVisible();

  // Journal: the session, its reflection and its visualization.
  await page.getByRole('button', { name: 'Journal', exact: true }).click();
  const journal = page.getByRole('region', { name: 'Unstuck sessions' });
  await expect(journal).toContainText(VIDEO);
  await expect(journal).toContainText('Ready to take action · Confident');
  await expect(journal).toContainText('Watch one 5-minute editing tutorial');
  await expect(journal).toContainText('Visualization: Played to the end');
  await journal.getByText('Details').click();
  await expect(journal).toContainText('Starting was easier than expected');
  await journal.getByText('Read the visualization').click();
  await expect(journal.getByText(/If you naturally picture scenes/)).toBeVisible();

  // Edit the reflection.
  await journal.getByRole('button', { name: 'Edit reflection' }).click();
  await journal.getByLabel('What did you notice?').fill('Starting was easy once the phone was away');
  await journal.getByRole('button', { name: 'Save', exact: true }).click();
  await journal.getByText('Details').click();
  await expect(journal).toContainText('Starting was easy once the phone was away');

  // My visualizations, on the front page: the saved one, as a favorite, played again.
  await page.getByRole('navigation').getByRole('button', { name: 'Visualize' }).click();
  const saved = page.getByRole('region', { name: 'My visualizations' });
  await expect(saved).toContainText('Small step: Watch one 5-minute editing tutorial');
  const favorite = saved.getByRole('button', { name: /^Favorite/ });
  await favorite.click();
  await expect(favorite).toHaveAttribute('aria-pressed', 'true');
  await saved.getByLabel('Favorites only').check();
  await expect(saved.getByRole('listitem')).toHaveCount(1);
  await saved.getByRole('button', { name: 'Play' }).click();
  await expect(page.locator('#session-heading')).toBeFocused();
  await page.getByRole('button', { name: 'Back' }).click();

  // Reuse the saved step in Unstuck.
  await saved.getByRole('button', { name: 'Use this step in Unstuck' }).click();
  await expect(page.getByLabel('Your small step')).toHaveValue('Watch one 5-minute editing tutorial');

  // Deleting removes it from storage, not only from the screen.
  await page.getByRole('button', { name: 'Journal', exact: true }).click();
  page.once('dialog', (dialog) => void dialog.accept());
  await journal.getByRole('button', { name: 'Delete' }).click();
  await expect(journal).toContainText('No Unstuck sessions yet.');
  const left = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const open = indexedDB.open('moodcanvas');
        open.onsuccess = () => {
          const count = open.result.transaction('breakerSessions').objectStore('breakerSessions').count();
          count.onsuccess = () => resolve(count.result);
        };
      }),
  );
  expect(left).toBe(0);
});

test('works with minimal input, leaving the visualization early and skipping the action', async ({ page }) => {
  await skipOnboarding(page);
  await openUnstuck(page);
  await page.getByRole('button', { name: 'I can’t stop overthinking.' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  // Nothing else is required.
  await page.getByRole('button', { name: 'Create my visualization' }).click();
  await playVisualization(page, 'early');

  // Leaving early is said honestly; the step fits overthinking, not a generic task.
  await expect(page.getByText('You left the visualization early. That’s fine.')).toBeVisible();
  await expect(page.getByLabel('Your small step')).toHaveValue(
    'Write down the decision you need to make and the next piece of information you need.',
  );
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await expect(page.getByRole('heading', { name: 'That’s okay.' })).toBeFocused();
  await page.getByRole('button', { name: 'Save session' }).click();
  await expect(page.getByText('Saved to your Journal.')).toBeVisible();

  await page.getByRole('button', { name: 'Journal', exact: true }).click();
  const journal = page.getByRole('region', { name: 'Unstuck sessions' });
  await expect(journal).toContainText('I can’t stop overthinking.');
  await expect(journal).toContainText('No action this time');
  await expect(journal).toContainText('Visualization: Left early');
});

test('someone who may be in danger is shown support instead of carrying on', async ({ page }) => {
  await skipOnboarding(page);
  await openUnstuck(page);
  await page.getByLabel(WHATS_ON_MIND).fill('I feel stuck in life and I want to end my life');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('#crisis-heading')).toBeFocused();
  // Still on the first screen, with their words kept.
  await expect(page.getByLabel(WHATS_ON_MIND)).toHaveValue('I feel stuck in life and I want to end my life');
});

test('answers survive a reload; a running timer survives switching pages', async ({ page }) => {
  await skipOnboarding(page);
  await openUnstuck(page);
  await page.getByRole('button', { name: 'I’m feeling overwhelmed.' }).click();
  await page.getByLabel(WHATS_ON_MIND).fill('Too many assignments this week');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: /Less overwhelmed/ }).click();

  await page.reload();
  await page.getByRole('button', { name: 'Unstuck' }).click();
  await expect(page.getByRole('heading', { name: 'Here’s what I’m hearing' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Less overwhelmed/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Create my visualization' }).click();
  await playVisualization(page, 'early');
  await page.getByRole('button', { name: 'Start now' }).click();
  await page.getByRole('button', { name: '10 minutes' }).click();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.getByRole('timer').waitFor();

  await page.getByRole('button', { name: 'Journal', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Unstuck' }).click();
  await expect(page.getByText('You have a focus session open.')).toBeVisible();
  await page.getByRole('button', { name: 'Back to my session' }).click();
  await expect(page.getByRole('timer')).toBeVisible();
  await page.getByRole('button', { name: 'Finish early' }).click();
  await page.getByRole('button', { name: 'I got stuck again.' }).click();
  await expect(page.getByText('That’s useful information. Let’s make the next step clearer or smaller.')).toBeVisible();
  await page.getByRole('button', { name: 'Try the smaller step' }).click();
  await expect(page.getByLabel('Your small step')).toBeVisible();
});

test('scheduling for later, then a returning welcome that picks it back up', async ({ page }) => {
  await skipOnboarding(page);
  await openUnstuck(page);
  await page.getByLabel(WHATS_ON_MIND).fill('Go to the gym');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create my visualization' }).click();
  await playVisualization(page, 'early');
  await expect(page.getByLabel('Your small step')).toHaveValue('Put on your workout clothes and prepare your exercise space.');
  await page.getByRole('button', { name: 'Schedule for later' }).click();

  await expect(page.getByRole('heading', { name: 'Schedule for later' })).toBeFocused();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Choose a date and time.');
  await page.getByLabel('When will you come back to it?').fill('2030-01-15T09:30');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'It’s in your plan.' })).toBeVisible();
  await page.getByRole('button', { name: 'Finish for now' }).click();

  // Back on the welcome screen, with a small personal welcome built from saved sessions only.
  const welcome = page.getByRole('region', { name: 'Welcome back. What would help you most today?' });
  await expect(welcome).toContainText('Last time: Go to the gym');
  await welcome.getByRole('button', { name: 'Continue where I left off' }).click();
  await expect(page.getByLabel('Your small step')).toHaveValue('Put on your workout clothes and prepare your exercise space.');
  await page.getByRole('button', { name: 'Start now' }).click();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.getByRole('button', { name: 'I did it' }).click();
  await expect(page.getByRole('heading', { name: 'Nicely done.' })).toBeVisible();
  await expect(page.getByText('Nice work. You followed through on a step that mattered to you.')).toBeVisible();

  await page.getByRole('button', { name: 'Journal', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Unstuck sessions' }).locator('dl').first()).toContainText(
    'Picked up after postponing1',
  );

  // "Start fresh" dismisses the welcome.
  await page.getByRole('button', { name: 'Unstuck' }).click();
  await page.getByRole('button', { name: 'Start fresh' }).click();
  await expect(page.getByRole('region', { name: /Welcome back/ })).toBeHidden();
});

test('daily commitments: a quick checklist, up to three, sized by energy, with a week of recorded counts', async ({ page }) => {
  await skipOnboarding(page);
  await openTodo(page);
  await page.getByRole('button', { name: /Low/ }).click();
  await expect(page.getByText(/Low-energy days count too/)).toBeVisible();

  // Add by typing and pressing Enter; an empty line gets a gentle prompt.
  const input = page.getByLabel('Add a commitment');
  await input.press('Enter');
  await expect(page.getByRole('alert')).toHaveText('Write a few words first.');
  await input.fill('Reply to the bank email');
  await input.press('Enter');
  await expect(page.getByRole('checkbox', { name: 'Reply to the bank email' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'About how long? 5 min' })).toBeVisible();
  await page.getByLabel('Add a commitment').fill('Study chapter 3');
  await page.getByRole('button', { name: 'Add', exact: true }).click();

  // Or by tapping an idea.
  await page.getByRole('button', { name: 'Drink a glass of water' }).click();
  await expect(page.getByRole('checkbox')).toHaveCount(3);
  await expect(page.getByLabel('Add a commitment')).toBeHidden();
  await expect(page.getByRole('region', { name: 'Today’s commitments' }).getByText('Need ideas? Tap one')).toBeHidden();

  // Tick one off; the ring and the line under it follow.
  const bank = page.getByRole('checkbox', { name: 'Reply to the bank email' });
  await bank.click();
  await expect(bank).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByText('1 of 3 done')).toBeVisible();
  await expect(page.getByText('You’re moving. Keep it light.')).toBeVisible();

  // Less common choices live behind "More options".
  await page.getByRole('button', { name: 'More options: Reply to the bank email' }).click();
  await page.getByLabel('Reflection (optional)').fill('Easier than it looked');
  await page.getByRole('button', { name: 'Save reflection' }).click();
  await expect(page.getByText('Saved.')).toBeVisible();
  await page.getByRole('button', { name: 'More options: Study chapter 3' }).click();
  await page.getByRole('group', { name: 'Status: Study chapter 3' }).getByRole('button', { name: 'Partially completed' }).click();
  await page.getByRole('button', { name: 'Make it smaller' }).click();
  await expect(page.getByRole('checkbox', { name: 'Open the relevant chapter and read the first page.' })).toBeVisible();

  // Ticking a second one, and the length can be changed with a tap.
  await page.getByRole('checkbox', { name: 'Drink a glass of water' }).click();
  await page.getByRole('checkbox', { name: 'Open the relevant chapter and read the first page.' }).click();
  await expect(page.getByText('All done. That’s real follow-through ✨')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Drink a glass of water' }).click();
  await expect(page.getByText('2 of 3 done')).toBeVisible();

  const week = page.getByRole('region', { name: /^In / });
  await expect(week).toContainText('Commitments made3');
  await expect(week).toContainText('Completed2');
  await expect(week).toContainText('Days you took action1');

  // The month view: today shows its progress, another day has its own list.
  const today = page.locator('button[aria-current="date"]');
  await expect(today).toHaveAttribute('aria-label', /2 of 3 done$/);
  await expect(today).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Next month' }).click();
  const label = await page.getByRole('button', { name: /: Nothing planned$/ }).nth(14).getAttribute('aria-label');
  const nextMonthDay = page.getByRole('button', { name: new RegExp(`^${label!.split(':')[0]}:`) });
  await nextMonthDay.click();
  await expect(nextMonthDay).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await page.getByLabel('Add a commitment').fill('Plan the weekend');
  await page.getByLabel('Add a commitment').press('Enter');
  await expect(nextMonthDay).toHaveAttribute('aria-label', /0 of 1 done$/);
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await expect(page.getByRole('checkbox')).toHaveCount(3);

  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'More options: Drink a glass of water' }).click();
  await page.getByRole('button', { name: 'Remove: Drink a glass of water' }).click();
  await expect(page.getByLabel('Add a commitment')).toBeVisible();
});

test('habits: add one, tick today, tick past days in three views, edit and delete', async ({ page }) => {
  test.setTimeout(90_000); // Several accessibility scans.
  await page.clock.install({ time: new Date(2026, 9, 23, 12, 0) });
  await skipOnboarding(page);
  await openHabits(page);
  await expect(page.getByText('No habits yet.', { exact: false })).toBeVisible();

  // Create one with a name, description, colour and icon.
  await page.getByRole('button', { name: 'New habit' }).click();
  const dialog = page.getByRole('dialog', { name: 'New habit' });
  await dialog.getByRole('button', { name: 'Create habit' }).click();
  await expect(dialog.getByRole('alert')).toHaveText('Give it a name first.');
  await dialog.getByLabel('Name').fill('Analysis and Trade');
  await dialog.getByLabel('Description (optional)').fill('Analyse the chart every day');
  await dialog.getByLabel('Green').check();
  await dialog.getByLabel('📈').check();
  await expectNoA11yViolations(page, 'new habit dialog');
  await dialog.getByRole('button', { name: 'Create habit' }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole('button', { name: 'New habit' }).click();
  await page.getByRole('dialog').getByLabel('Name').fill('Book Read');
  await page.getByRole('dialog').getByRole('button', { name: 'Create habit' }).click();

  // Overview: tick today with the big button.
  const today = page.getByRole('checkbox', { name: 'Analysis and Trade: done today' });
  await today.click();
  await expect(today).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByText('1 days in the last 20 weeks')).toBeAttached();
  await expectNoA11yViolations(page, 'overview');

  // Last 5 days: a table to tick each day.
  await page.getByRole('button', { name: 'Last 5 days' }).click();
  await expect(page.getByRole('columnheader', { name: '2 habits' })).toBeVisible();
  const wednesday = page.getByRole('checkbox', { name: 'Book Read, Wednesday, October 21' });
  await wednesday.click();
  await expect(wednesday).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('checkbox', { name: 'Analysis and Trade, Friday, October 23' })).toHaveAttribute('aria-checked', 'true');
  await expectNoA11yViolations(page, 'last 5 days');

  // Month cards; open one to tick any past day of any month.
  await page.getByRole('button', { name: 'Month', exact: true }).click();
  await expectNoA11yViolations(page, 'month cards');
  await page.getByRole('button', { name: 'Book Read', exact: true }).click();
  const month = page.getByRole('dialog', { name: 'Book Read' });
  await expect(month).toContainText('1 of 23 days');
  await month.getByRole('checkbox', { name: 'Book Read, Thursday, October 1', exact: true }).click();
  await expect(month).toContainText('2 of 23 days');
  await expect(month.getByRole('checkbox', { name: 'Book Read, Saturday, October 24' })).toBeDisabled();
  await month.getByRole('button', { name: 'Previous month' }).click();
  await expect(month).toContainText('0 of 30 days');
  await expectNoA11yViolations(page, 'month dialog');

  // Edit from there, then delete.
  await month.getByRole('button', { name: 'Edit' }).click();
  const edit = page.getByRole('dialog', { name: 'Edit habit' });
  await edit.getByLabel('Name').fill('Read 10 pages');
  await edit.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('heading', { name: 'Read 10 pages' })).toBeVisible();

  // The chosen view and the ticks are kept after a reload.
  await page.reload();
  await openHabits(page);
  await expect(page.getByRole('button', { name: 'Month', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Last 5 days' }).click();
  await expect(page.getByRole('checkbox', { name: 'Read 10 pages, Wednesday, October 21' })).toHaveAttribute('aria-checked', 'true');

  await page.getByRole('button', { name: 'Read 10 pages', exact: true }).click();
  await page.getByRole('button', { name: 'Edit' }).click();
  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'Delete habit' }).click();
  await expect(page.getByRole('button', { name: 'Read 10 pages', exact: true })).toBeHidden();
});

test('a commitment reminder pops up at the chosen time, on any page, and can be snoozed or done', async ({ page, context }) => {
  await context.grantPermissions(['notifications']);
  await page.clock.install({ time: new Date(2026, 9, 23, 18, 0) });
  await skipOnboarding(page);
  await openTodo(page);
  await page.getByLabel('Add a commitment').fill('Reply to the bank email');
  await page.getByLabel('Add a commitment').press('Enter');

  await page.getByRole('button', { name: 'Remind me at: Reply to the bank email' }).click();
  await page.getByRole('button', { name: 'Set reminder' }).click();
  await expect(page.getByText('Choose a time first.')).toBeVisible();
  await page.getByLabel('Remind me at', { exact: true }).fill('18:02');
  await page.getByRole('button', { name: 'Set reminder' }).click();
  await expect(page.getByText('Reminder set.')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Remind me at: Reply to the bank email 6:02/ })).toBeVisible();

  // A calendar event, for when Viz it is closed.
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Add to calendar' }).click();
  expect((await download).suggestedFilename()).toBe('vizit-commitment.ics');

  // It pops up on whatever page is open.
  await page.getByRole('navigation').getByRole('button', { name: 'Journal' }).click();
  const pop = page.getByRole('region', { name: 'Reminder: your commitment' });
  await expect(pop).toBeHidden();
  await page.clock.runFor('02:30');
  await expect(pop).toContainText('Time for: Reply to the bank email');
  await expectNoA11yViolations(page, 'reminder pop-up');
  await page.screenshot({ path: 'test-results/reminder-pop.png' });
  await pop.getByRole('button', { name: 'Snooze 10 min' }).click();
  await expect(pop).toBeHidden();
  await page.clock.runFor('10:30');
  await expect(pop).toBeVisible();
  await pop.getByRole('button', { name: 'Mark done' }).click();
  await expect(pop).toBeHidden();

  await openTodo(page);
  await expect(page.getByRole('checkbox', { name: 'Reply to the bank email' })).toHaveAttribute('aria-checked', 'true');
});

for (const scheme of ['light', 'dark'] as const) {
  test(`Unstuck is accessible (${scheme})`, async ({ page }) => {
    test.setTimeout(120_000); // Many full accessibility scans.
    await page.clock.install();
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    await skipOnboarding(page);
    await openUnstuck(page);
    await page.getByRole('button', { name: 'I’m afraid of failing.' }).click();
    await expectNoA11yViolations(page, 'welcome');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: /Calm and relaxed/ }).click();
    await expectNoA11yViolations(page, 'understand');
    await page.getByRole('button', { name: 'Create my visualization' }).click();
    await playVisualization(page);
    await page.getByRole('button', { name: 'Start now' }).click();
    await page.getByRole('button', { name: 'Other', exact: true }).click();
    await expectNoA11yViolations(page, 'action');
    await page.getByRole('button', { name: '2 minutes' }).click();
    await page.getByRole('button', { name: 'Start', exact: true }).click();
    await page.getByRole('timer').waitFor();
    await expectNoA11yViolations(page, 'timer');
    await page.getByRole('button', { name: 'Finish early' }).click();
    await expectNoA11yViolations(page, 'how it went');
    await page.getByRole('button', { name: 'I chose to stop for now.' }).click();
    await expect(page.getByText('You can pause without judging yourself.', { exact: false })).toBeVisible();
    await expectNoA11yViolations(page, 'after');
    await openTodo(page);
    await page.getByLabel('Add a commitment').fill('Reply to one email');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Reply to one email' }).click();
    await page.getByRole('button', { name: 'More options: Reply to one email' }).click();
    await expectNoA11yViolations(page, 'commitments');
    await page.getByRole('button', { name: 'Journal', exact: true }).click();
    await expectNoA11yViolations(page, 'journal');
  });
}

test('works in Hindi, with steps for the kind of task', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    localStorage.setItem('moodcanvas.locale', '"hi"');
    localStorage.setItem('moodcanvas.onboarded', 'true');
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'शुरुआत' }).click();
  await page.getByRole('button', { name: 'काम टलता जा रहा है।' }).click();
  await page.getByLabel('आजकल मन में क्या चल रहा है?').fill('नौकरी के लिए आवेदन करना है');
  await page.getByRole('button', { name: 'आगे', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'जो मुझे समझ आया' })).toBeFocused();
  await page.getByRole('button', { name: 'समझ नहीं आ रहा कहाँ से शुरू करूँ।' }).click();
  await page.getByRole('button', { name: 'मेरा विज़ुअलाइज़ेशन बनाएँ' }).click();
  await page.locator('#session-heading').waitFor();
  await page.getByLabel('आवाज़ से मार्गदर्शन').uncheck();
  await page.getByLabel('पीछे हल्की आवाज़').uncheck();
  await page.getByRole('button', { name: 'शुरू करें', exact: true }).click();
  await page.getByRole('button', { name: 'खत्म करें' }).click();
  // A step for a job search, not a generic one.
  await expect(page.getByLabel('आपका छोटा कदम')).toHaveValue('एक सही नौकरी की वैकेंसी ढूँढें और उसका लिंक सेव करें।');
});
