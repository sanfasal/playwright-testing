import { test, expect } from '@playwright/test';

test.describe('Reset Password', () => {

  test ("Reset password with valid Code", async ({ page }) => {
    await page.goto('/signin');
    await page.getByRole('link', { name: /forgot password|reset password/i }).click();
    
    // Wait for reset password page to load
    await page.waitForURL(/reset|forgot/i);
    await expect(page).toHaveTitle(/reset|forgot/i);
    await page.getByRole('textbox', { name: /email/i }).fill('sanfasal70@gmail.com');
    await page.getByRole('button', { name: /send code/i }).click();
    
    // Wait for redirect to save-reset-password page
    await page.waitForURL(/save-reset-password/i, { timeout: 1000 });
    await page.pause();
  })


    test ("Reset password with invalid Code", async ({ page }) => {
    // Navigate to signin page
    await page.goto('/signin');
    
    // Click on "Forgot Password" or "Reset Password" link
    await page.getByRole('link', { name: /forgot password|reset password/i }).click();
    
    // Wait for reset password page to load
    await page.waitForURL(/reset|forgot/i);
    await expect(page).toHaveTitle(/reset|forgot/i);
    await page.getByRole('textbox', { name: /email/i }).fill('sanfasal709@gmail.com');
    await page.getByRole('button', { name: /send code/i }).click();
    
    // Wait for redirect to save-reset-password page
    await page.waitForURL(/save-reset-password/i, { timeout: 1000 });
    await page.pause();
  })


});
