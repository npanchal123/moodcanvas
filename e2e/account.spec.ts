import { expect, test } from '@playwright/test';
import { calm, skipOnboarding } from './helpers';

test.beforeEach(async ({ page }) => {
  await calm(page);
});

test('Sign in in the header opens the account card at the top of Settings', async ({ page }) => {
  await skipOnboarding(page);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  const account = page.locator('#account');
  await expect(account.getByRole('heading', { name: 'Sign in or create an account' })).toBeVisible();
  // It's the first card in Settings.
  await expect(page.locator('main section').first()).toHaveAttribute('id', 'account');

  // These builds have no account server: the choices are shown, switched off, with a note.
  await expect(account.getByText('Accounts are coming soon.')).toBeVisible();
  await expect(account.getByRole('button', { name: 'Continue with Google' })).toBeDisabled();
  await expect(account.getByLabel('Email')).toBeDisabled();
  await expect(account.getByRole('button', { name: 'Email me a code' })).toBeDisabled();
});
