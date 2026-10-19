import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/** WCAG 2.2 A and AA, the target in the project plan. */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export async function expectNoA11yViolations(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.map((n) => n.target.join(' ')).join('\n    ')}`,
  );
  expect(summary, `axe violations on ${label}`).toEqual([]);
}

export async function openApp(page: Page) {
  await page.goto('/');
  await page.getByRole('dialog').waitFor();
}

export async function skipOnboarding(page: Page) {
  await openApp(page);
  await page.getByRole('button', { name: 'Skip' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
}

export async function checkIn(page: Page, text: string, tag?: string) {
  await page.getByRole('button', { name: 'Check in', exact: true }).click();
  await page.getByLabel('How are you feeling?').fill(text);
  await page.getByRole('button', { name: 'Visualize' }).click();
  await page.locator('#result-heading').waitFor();
  if (tag) await page.getByRole('button', { name: tag, exact: true }).click();
}

/** Turn off animation so screenshots and axe see final states. */
export async function calm(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
}
