import { test, expect } from '@playwright/test';
import { addCursorTracking } from '../utils/cursor-helper';
import { fillFieldWithDelay } from '../utils/form-helper';

// Static test data
const SIGNIN_USER = {
  email: 'sanfasal.its@gmail.com',
  validPassword: 'Sal@2025',
  invalidPassword: 'Sal@12345',
} as const;

const ICONS = {
  eyeOff: '.lucide-eye-off',
  eye: '.lucide-eye',
} as const;



test.describe('Sign In', () => {
  
  test('User sign in with valid credentials', async ({ page }) => {
    await addCursorTracking(page);
    await page.goto('/signin');
    await expect(page).toHaveTitle(/signin|login/i);
    await page.waitForTimeout(800);
    const emailField = page.getByRole('textbox', { name: /email/i });
    await fillFieldWithDelay(emailField, SIGNIN_USER.email);
    const passwordField = page.getByRole('textbox', { name: /password/i });
    await fillFieldWithDelay(passwordField, SIGNIN_USER.validPassword, {
      typingDelay: 100,
      afterTypingDelay: 600
    });
    await page.locator(ICONS.eyeOff).click();
    await page.waitForTimeout(800);
    await page.locator(ICONS.eye).click();
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /signin|login/i }).click();
    await page.waitForURL(/dashboard/i);
    await expect(page).toHaveURL(/dashboard/i);
    await page.waitForTimeout(1000);
  });

  test('User sign in with invalid credentials', async ({ page }) => {
    await addCursorTracking(page);
    await page.goto('/signin');
    await expect(page).toHaveTitle(/signin|login/i);
    await page.waitForTimeout(800);

    const emailField = page.getByRole('textbox', { name: /email/i });
    await fillFieldWithDelay(emailField, SIGNIN_USER.email);
  
    const passwordField = page.getByRole('textbox', { name: /password/i });
    await fillFieldWithDelay(passwordField, SIGNIN_USER.invalidPassword, {
      typingDelay: 100,
      afterTypingDelay: 600
    });
    await page.locator(ICONS.eyeOff).click();
    await page.waitForTimeout(800);
    await page.locator(ICONS.eye).click();
    await page.waitForTimeout(800);

    await page.getByRole('button', { name: /signin|login/i }).click();
    await page.waitForTimeout(800);

    await expect(page).toHaveURL(/signin/i);
  });

})
