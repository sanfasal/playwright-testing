import { test, expect } from '@playwright/test';

test.describe('Sign Up', () => {
  
  test('User can sign up successfully', async ({ page }) => {
    await page.goto('/signup');

    // Wait for page to load
    await expect(page).toHaveTitle(/Sign Up/i);

    // Use accessible selectors
    await page.getByRole('textbox', { name: /first name/i }).fill('sal');
    await page.getByRole('textbox', { name: /last name/i }).fill('san');
    await page.getByRole('textbox', { name: /company/i }).fill('seksaa');
    await page.getByRole('textbox', { name: /email/i }).fill('nanasiku2005@gmail.com');
    await page.getByRole('textbox', { name: /^password$/i }).fill('Password@123');
    await page.getByRole('textbox', { name: /confirm password/i }).fill('Password@123');

    await page.getByRole('button', { name: /sign up/i }).click();
    await page.waitForURL(/signup-verify/i, { timeout: 50000 });

    await page.pause();
  });

  test('Sign up fails with existing email', async ({ page }) => {

    await page.goto('/signup');
    await page.getByRole('textbox', { name: /first name/i }).fill('sal');
    await page.getByRole('textbox', { name: /last name/i }).fill('san');
    await page.getByRole('textbox', { name: /company/i }).fill('seksaa');
    await page.getByRole('textbox', { name: /email/i }).fill('sanfasal70@gmail.com');
    await page.getByRole('textbox', { name: /^password$/i }).fill('Password@123');
    await page.getByRole('textbox', { name: /confirm password/i }).fill('Password@123');

    await page.getByRole('button', { name: /sign up/i }).click();

    // Verify error message (adjust text to match your app)
    await expect(
      page.getByText(/email already exists/i)
    ).toBeVisible({ timeout: 9000 });
  });

  test('Sign up fails with passwords do not match', async ({ page }) => {

    await page.goto('/signup');

    // Fill in all required fields
    await page.getByRole('textbox', { name: /first name/i }).fill('sal');
    await page.getByRole('textbox', { name: /last name/i }).fill('san');
    await page.getByRole('textbox', { name: /company/i }).fill('seksaa');
    await page.getByRole('textbox', { name: /email/i }).fill("sanfasal70@gmail.com");
    
    await page.getByRole('textbox', { name: /^password$/i }).fill('Password@123');
    await page.getByRole('textbox', { name: /confirm password/i }).fill('DifferentPassword@456');

    await page.pause();
  });
});
