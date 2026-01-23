import { Page } from '@playwright/test';
import { addCursorTracking } from './cursor-helper';
import { fillFieldWithDelay } from './form-helper';

import * as fs from 'fs';
import * as path from 'path';

// Remove top-level data reading which caches old data
// const userDataPath = path.resolve(__dirname, '..', 'user-data.json');
// const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf-8'));

export async function login(page: Page) {
  await addCursorTracking(page);
  
  // Read user data dynamically
  const userDataPath = path.resolve(__dirname, '..', 'user-data.json');
  let email = '';
  let password = '';
  
  try {
    if (fs.existsSync(userDataPath)) {
      const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf-8'));
      let firstUser = { email: userData.signupEmail, password: userData.signupPassword };
      if (userData.users && Array.isArray(userData.users) && userData.users.length > 0) {
          firstUser = userData.users[0];
      }
      email = firstUser.email;
      password = firstUser.password;
    }
  } catch (e) {
    console.error('Error reading user-data.json in login:', e);
  }

  if (!email || !password) {
      console.warn('No user credentials found for login.');
  }

  await page.goto('/signin');
  await page.waitForTimeout(50); 
  
  const emailField = page.getByRole('textbox', { name: /email/i });
  await fillFieldWithDelay(emailField, email);
  
  const passwordField = page.getByRole('textbox', { name: /password/i });
  await fillFieldWithDelay(passwordField, password);
  
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
