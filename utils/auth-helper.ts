import { Page } from '@playwright/test';
import { addCursorTracking } from './cursor-helper';
import { fillFieldWithDelay } from './form-helper';

import * as fs from 'fs';
import * as path from 'path';

const userDataPath = path.resolve(__dirname, '..', 'user-data.json');
const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf-8'));

// Get the first user from the list or fallback to the single user fields
let firstUser = { email: userData.signupEmail, password: userData.signupPassword };

if (userData.users && Array.isArray(userData.users) && userData.users.length > 0) {
    firstUser = userData.users[0];
}

const TEST_EMAIL = firstUser.email;
const TEST_PASSWORD = firstUser.password;

export async function login(page: Page) {
  await addCursorTracking(page);
  
  await page.goto('/signin');
  await page.waitForTimeout(50); 
  
  const emailField = page.getByRole('textbox', { name: /email/i });
  await fillFieldWithDelay(emailField, TEST_EMAIL);
  
  const passwordField = page.getByRole('textbox', { name: /password/i });
  await fillFieldWithDelay(passwordField, TEST_PASSWORD);
  
  // Toggle password visibility - show password
  const eyeOffIcon = page.locator('.lucide-eye-off');
  if (await eyeOffIcon.isVisible({ timeout: 100 }).catch(() => false)) {
    await eyeOffIcon.click();
    await page.waitForTimeout(50);
  }
  
  // Toggle password visibility - hide password
  const eyeIcon = page.locator('.lucide-eye');
  if (await eyeIcon.isVisible({ timeout: 100 }).catch(() => false)) {
    await eyeIcon.click();
    await page.waitForTimeout(50);
  }
  
  await page.getByRole('button', { name: /signin|login/i }).click();
  await page.waitForURL(/dashboard/, { timeout: 15000 });
}
