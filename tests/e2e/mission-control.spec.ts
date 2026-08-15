import { test, expect } from '@playwright/test';

test('canonical purchase request reaches proposal', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Mission Control' })).toBeVisible();
  await page.getByRole('button', { name: 'Ask Agent to Find It' }).click();
  await expect(page.getByText('Koh Kae Thai Peanut Snack')).toBeVisible();
  await expect(page.getByText('VERIFIED')).toBeVisible();
});

test('transaction above S$6 requires human authorization', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ask Agent to Find It' }).click();
  await page.getByLabel('Demo amount (cents)').fill('601');
  await page.getByRole('button', { name: 'Continue to Payment' }).click();
  await expect(page.getByText('Explicit authorization required')).toBeVisible();
});

test('exactly S$6 can proceed autonomously', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ask Agent to Find It' }).click();
  await page.getByLabel('Demo amount (cents)').fill('600');
  await expect(page.getByText('ALLOW')).toBeVisible();
});
