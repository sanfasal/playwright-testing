import { test, expect } from '@playwright/test';
import { addCursorTracking } from '../../utils/cursor-helper';
import { FileInput } from '../../utils/form-helper';
import dotenv from 'dotenv';
import { createAndSaveSignupCredentials } from '../../utils/email-helper';
import { getUserData, saveUserData } from '../../utils/data-store';
import { signIn } from '../../components/auth';
dotenv.config();

// Dynamic accessor for test data (reads latest values from user-data.json)
function getSigninUser() {
  return {
    email: getUserData('signupEmail') || 'sanfasal.its@gmail.com',
    validPassword: getUserData('signupPassword') || 'Sal@2025',
    invalidPassword: 'Sal@12345',
  } as const;
}

const ICONS = {
  eyeOff: '.lucide-eye-off',
  eye: '.lucide-eye',
} as const;



test.describe('Sign In', () => {
  test.beforeAll(async () => {
    const namespace = process.env.TESTMAIL_NAMESPACE;
    let email = getUserData('signupEmail');
    let password = getUserData('signupPassword');
    const timestamp = getUserData('signupTimestamp') || Date.now().toString();

    if (!email || !password) {
      const creds = createAndSaveSignupCredentials(namespace || 'test', timestamp, 12);
      email = creds.email;
      password = creds.password;
      saveUserData('signupEmail', email);
      saveUserData('signupPassword', password);
      saveUserData('signupTimestamp', timestamp);
      console.log('Created fallback signup credentials for signin tests.');
    }
  });
  
  test('Sign in with valid credentials', async ({ page }) => {
    await addCursorTracking(page);
    const SIGNIN_USER = getSigninUser();
    await signIn(page, {
        email: SIGNIN_USER.email,
        password: SIGNIN_USER.validPassword
    });
  });
  
  test('User sign in with invalid credentials', async ({ page }) => {
    await addCursorTracking(page);
    await page.goto('/signin');
    await expect(page).toHaveTitle(/signin|login/i);
    await page.waitForTimeout(50);

    const SIGNIN_USER = getSigninUser();
    const emailField = page.getByRole('textbox', { name: /email/i });
    await FileInput(emailField, SIGNIN_USER.email);
  
    const passwordField = page.getByRole('textbox', { name: /password/i });
    await FileInput(passwordField, SIGNIN_USER.invalidPassword);
    await page.locator(ICONS.eyeOff).click();
    await page.waitForTimeout(50);
    await page.locator(ICONS.eye).click();
    await page.waitForTimeout(50);

    await page.getByRole('button', { name: /signin|login/i }).click();
    await page.waitForTimeout(100);

    await expect(page).toHaveURL(/signin/i);
  });
  //sign in with invalid password
  test('User sign in with invalid password', async ({ page }) => {
    await addCursorTracking(page);
    await page.goto('/signin');
    await expect(page).toHaveTitle(/signin|login/i);
    await page.waitForTimeout(50);

    const SIGNIN_USER = getSigninUser();
    const emailField = page.getByRole('textbox', { name: /email/i });
    await FileInput(emailField, SIGNIN_USER.email);
  
    const passwordField = page.getByRole('textbox', { name: /password/i });
    await FileInput(passwordField, 'Sal@12345##');
    await page.locator(ICONS.eyeOff).click();
    await page.waitForTimeout(50);
    await page.locator(ICONS.eye).click();
    await page.waitForTimeout(50);

    await page.getByRole('button', { name: /signin|login/i }).click();
    await page.waitForTimeout(100);

    await expect(page).toHaveURL(/signin/i);
    await page.waitForTimeout(2000);
  });

})
