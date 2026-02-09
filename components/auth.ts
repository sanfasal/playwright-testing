import { Page, expect } from '@playwright/test';
import { FileInput, verifyPasswordToggle } from '../utils/form-helper';
import { getOTPFromEmail } from '../utils/email-helper';
import { addUser } from '../utils/data-store';
import dotenv from 'dotenv';

dotenv.config();

const ICONS = {
  eyeOff: '.lucide-eye-off',
  eye: '.lucide-eye',
} as const;

/**
 * Signs up a new user.
 * @param page - Playwright Page object
 * @param testUser - Object containing user profile data
 * @param email - Email to sign up with
 * @param password - Password to sign up with
 * @param timestamp - Timestamp used in email generation (for OTP)
 * @param apiKey - Testmail API key for OTP
 * @param namespace - Testmail namespace for OTP
 */
export async function signUp(page: Page, testUser: any, email: string, password: string, timestamp: string, apiKey?: string, namespace?: string) {
    await page.goto("/signup");

    // Wait for page to load
    await expect(page).toHaveTitle(/Sign Up/i);
    await page.waitForTimeout(50);

    // Fill form like a real user
    await FileInput(
      page.getByRole("textbox", { name: /first name/i }),
      testUser.firstName
    );
    await FileInput(
      page.getByRole("textbox", { name: /last name/i }),
      testUser.lastName
    );
    await FileInput(
      page.getByRole("textbox", { name: /company/i }),
      testUser.company
    );
    await FileInput(
      page.getByRole("textbox", { name: /email/i }),
      email
    );
    await FileInput(
      page.getByRole("textbox", { name: /^password$/i }),
      password
    );
    await FileInput(
      page.getByRole("textbox", { name: /confirm password/i }),
      password
    );

    // Verify password toggle works for both fields
    const passwordField = page.getByRole("textbox", { name: /^password$/i });
    const confirmPasswordField = page.getByRole("textbox", {
      name: /confirm password/i,
    });

    await verifyPasswordToggle(passwordField);
    await verifyPasswordToggle(confirmPasswordField);

    await page.getByRole("button", { name: /sign up/i }).click();
    await page.waitForURL(/signup-verify/i, { timeout: 50000 });

    if (apiKey && namespace) {
      const otp = await getOTPFromEmail({
        apiKey,
        namespace,
        timestamp: timestamp,
      });
      await FileInput(
        page.getByRole("textbox", { name: /code/i }),
        otp,
        { typingDelay: 50, afterTypingDelay: 50 }
      );
      await page
        .getByRole("button", { name: /verify|submit|confirm/i })
        .click();

      // Save data for other tests
      addUser({ 
        email, 
        password, 
        signupTimestamp: timestamp 
      });
    }
}

/**
 * Signs in a user.
 * @param page - Playwright Page object
 * @param email - Email to sign in with
 * @param password - Password to sign in with
 */
export async function signIn(page: Page, email: string, password: string) {
      await page.goto('/signin');
      await expect(page).toHaveTitle(/signin|login/i);
      await page.waitForTimeout(50);
      
      const emailField = page.getByRole('textbox', { name: /email/i });
      await FileInput(emailField, email);
      const passwordField = page.getByRole('textbox', { name: /password/i });
      await FileInput(passwordField, password);
      
      // Verify eye icon toggle (optional visual check)
      await page.locator(ICONS.eyeOff).click();
      await page.waitForTimeout(50);
      await page.locator(ICONS.eye).click();
      await page.waitForTimeout(50);
      
      await page.getByRole('button', { name: /signin|login/i }).click();
      await page.waitForURL(/dashboard/i);
      await expect(page).toHaveURL(/dashboard/i);
      await page.waitForTimeout(1000);
}
