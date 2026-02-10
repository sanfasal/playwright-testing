import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  // Setup: Sign in before each test
  test.beforeEach(async ({ page }) => {

    await page.goto('/signin');
    await page.getByRole('textbox', { name: /email/i }).fill('sanfasal70@gmail.com');
    await page.getByRole('textbox', { name: /password/i }).fill('Sal@2025');
    await page.getByRole('button', { name: /signin|login/i }).click();

    // Wait for dashboard to load
    await page.waitForURL(/dashboard/);
  });

  test('Dashboard page loads successfully', async ({ page }) => {
    // Verify we're on the dashboard
    await expect(page).toHaveURL(/dashboard/);
    // Verify page title
    await expect(page).toHaveTitle(/Dashboard/i);
  });

});
