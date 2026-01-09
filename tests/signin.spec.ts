import { test, expect } from '@playwright/test';

test.describe('Sign In', () => {
  test('User sign in with valid credentials', async ({ page }) => {
    // Start at the signin page
    await page.goto('/signin');

    // Wait for signin page to load
    await expect(page).toHaveTitle(/signin|login/i);

    // Fill in credentials
    await page.getByRole('textbox', { name: /email/i }).fill('sanfasal70@gmail.com');
    await page.getByRole('textbox', { name: /password/i }).fill('Sal@2025');

    // Click submit button
    await page.getByRole('button', { name: /signin|login/i }).click();
    
    // Wait for redirect to dashboard (takes 3-5 seconds)
    await page.waitForURL(/dashboard/);

    await expect(page).toHaveURL(/dashboard/);
    
    await page.pause();
  });

    test('User sign in with invalid credentials', async ({ page }) => {
    await page.goto('/signin');

    await page.getByRole('textbox', { name: /email/i }).fill('sanfasal70@gmail.com');
    await page.getByRole('textbox', { name: /password/i }).fill('Sal@12345');

    await page.getByRole('button', { name: /signin|login/i }).click();
    // Verify error message "Incorrect username or password" appears
    await expect(page.getByText(/incorrect username or password/i)).toBeVisible({ timeout: 5000 });
    
    // Verify we're still on signin page (should not redirect on error)
    await expect(page).toHaveURL(/signin/);
  });

  test('Sign in fails with invalid email format', async ({ page }) => {
    // Start at the signin page
    await page.goto('/signin');

    // Wait for signin page to load
    await expect(page).toHaveTitle(/signin|login/i);

    // Fill in credentials with INVALID email (missing @)
    await page.getByRole('textbox', { name: /email/i }).fill('sanfasal70gmail.com');
    await page.getByRole('textbox', { name: /password/i }).fill('Sal');

    // Click submit button
    await page.getByRole('button', { name: /signin|login/i }).click();

    // Wait a moment for any response
    await page.waitForTimeout(2000);

    // Verify we're still on signin page (invalid email should prevent login)
    await expect(page).toHaveURL(/signin/);
  });




})
