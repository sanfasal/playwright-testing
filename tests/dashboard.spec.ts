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
    
    // Keep browser open on dashboard page
    await page.pause();
    
    // Dashboard loaded successfully - no need to check for specific heading
    // since different dashboards have different structures
  });

  test('User can signout from dashboard', async ({ page }) => {
    // Wait for dashboard to fully load
    await page.waitForLoadState('networkidle');
    
    // Click on profile image to open dropdown
    await page.locator('img[alt*="profile" i], img[alt*="avatar" i], img[alt*="user" i]').first().click();
    
    // Wait for dropdown to appear
    await page.waitForTimeout(500);
    
    // Click logout button
    await page.getByRole('button', { name: /logout|sign out/i }).click();
    
    // Verify redirect to signin page
    await page.waitForURL(/signin|login/);
    await expect(page).toHaveURL(/signin|login/);
  });


});
