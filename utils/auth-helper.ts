import { Page } from '@playwright/test';
import { addCursorTracking } from './cursor-helper';
import { fillFieldWithDelay } from './form-helper';

import * as fs from 'fs';
import * as path from 'path';
import { addUser } from './data-store';

export async function login(page: Page, email?: string, password?: string) {
  await addCursorTracking(page);
  
  // Read user data dynamically if credentials are not provided
  if (!email || !password) {
    const userDataPath = path.resolve(__dirname, '..', 'user-data.json');
    
    try {
      if (fs.existsSync(userDataPath)) {
        const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf-8'));
        let firstUser = { email: userData.signupEmail, password: userData.signupPassword };
        if (userData.users && Array.isArray(userData.users) && userData.users.length > 0) {
            firstUser = userData.users[userData.users.length - 1];
        }
        if (!email) email = firstUser.email;
        if (!password) password = firstUser.password;
      }
    } catch (e) {
      console.error('Error reading user-data.json in login:', e);
    }
  }

  if (!email || !password) {
      console.warn('No user credentials found for login.');
  }

  await page.goto('/signin');
  await page.waitForTimeout(50); 
  
  const emailField = page.getByRole('textbox', { name: /email/i });
  await fillFieldWithDelay(emailField, email || '');
    // await fillFieldWithDelay(emailField, 'sanfasal.its@gmail.com');

  
  const passwordField = page.getByRole('textbox', { name: /password/i });
  await fillFieldWithDelay(passwordField, password || '');
    // await fillFieldWithDelay(passwordField, 'Sal@2026');

  
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

/**
 * Performs a complete signup flow including OTP verification
 * @param page - Playwright page object
 * @param apiKey - Testmail API key
 * @param namespace - Testmail namespace
 * @param userData - Optional user data (firstName, lastName, company)
 * @returns Object containing email, password, and timestamp
 */
export async function performSignup(
  page: Page,
  apiKey: string,
  namespace: string,
  userData?: { firstName?: string; lastName?: string; company?: string }
) {
  const { getOTPFromEmail } = await import('./email-helper');
  const { getGeneratedEmail } = await import('./data-store');
  const { generateRandomPassword } = await import('./email-helper2');
  
  // Get the pre-generated email from generated-emails.json at index 0
  const email = getGeneratedEmail(0);
  
  if (!email) {
    throw new Error("No email found at index 0 in generated-emails.json. Please ensure the file contains at least one email.");
  }
  
  console.log(`Using pre-generated email from index 0: ${email}`);
  
  // Extract timestamp from the email format: namespace.timestamp@inbox.testmail.app
  const emailParts = email.split('@')[0].split('.');
  const timestamp = emailParts[emailParts.length - 1]; // Get the last part which is the timestamp
  console.log(`Extracted timestamp for signup: ${timestamp}`);
  
  // Generate a random password
  const password = generateRandomPassword(12);

  await page.goto('/signup');
  await page.waitForTimeout(50);

  // Fill form with provided or default data
  await fillFieldWithDelay(
    page.getByRole('textbox', { name: /first name/i }),
    userData?.firstName || 'Test'
  );
  await fillFieldWithDelay(
    page.getByRole('textbox', { name: /last name/i }),
    userData?.lastName || 'User'
  );
  await fillFieldWithDelay(
    page.getByRole('textbox', { name: /company/i }),
    userData?.company || 'TestCompany'
  );
  await fillFieldWithDelay(
    page.getByRole('textbox', { name: /email/i }),
    email
  );
  await fillFieldWithDelay(
    page.getByRole('textbox', { name: /^password$/i }),
    password
  );
  await fillFieldWithDelay(
    page.getByRole('textbox', { name: /confirm password/i }),
    password
  );

  await page.getByRole('button', { name: /sign up/i }).click();
  await page.waitForURL(/signup-verify/i, { timeout: 50000 });

  // Get OTP and verify
  const otp = await getOTPFromEmail({
    apiKey,
    namespace,
    timestamp: timestamp,
  });
  
  await fillFieldWithDelay(
    page.getByRole('textbox', { name: /code/i }),
    otp,
    { typingDelay: 50, afterTypingDelay: 50 }
  );
  
  await page.getByRole('button', { name: /verify|submit|confirm/i }).click();
  await page.waitForURL(/dashboard/, { timeout: 15000 });

  // Save user data
  addUser({ 
    email, 
    password, 
    signupTimestamp: timestamp 
  });

  console.log(`Signup completed for ${email}`);
  return { email, password, timestamp };
}

