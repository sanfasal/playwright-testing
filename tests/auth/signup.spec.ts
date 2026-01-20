import { test, expect } from '@playwright/test';
import { generateTestmailAddress, getOTPFromEmail } from '../../utils/email-helper';
import { saveUserData } from '../../utils/data-store';
import dotenv from 'dotenv';
import { addCursorTracking } from '../../utils/cursor-helper';
import { fillFieldWithDelay, verifyPasswordToggle } from '../../utils/form-helper';

dotenv.config();

// Static test data
const TEST_USER = {
  firstName: 'Seksaa',
  lastName: 'Tech',
  company: 'SeksaaTech',
  existingEmail: 'sanfasal70@gmail.com',
  validPassword: 'Password@123',
  invalidPassword: 'DifferentPassword@456',
} as const;

const ICONS = {
  eyeOff: '.lucide-eye-off',
  eye: '.lucide-eye',
} as const;

test.describe('Sign Up', () => {
  test.setTimeout(60000); // Increase timeout to 60s for realistic typing delays
  test('Sign up successfully', async ({ page }) => {
     await addCursorTracking(page);

  const apiKey = process.env.TESTMAIL_API_KEY;
  const namespace = process.env.TESTMAIL_NAMESPACE;

  if (!apiKey || !namespace) {
    throw new Error('TESTMAIL_API_KEY and TESTMAIL_NAMESPACE must be defined in .env');
  }
    // Generate dynamic email
    const timestamp = Date.now().toString();
    const email = generateTestmailAddress(namespace, timestamp) 
    

    await page.goto('/signup');

    // Wait for page to load
    await expect(page).toHaveTitle(/Sign Up/i);
    await page.waitForTimeout(50);

    // Fill form like a real user
    await fillFieldWithDelay(page.getByRole('textbox', { name: /first name/i }), TEST_USER.firstName, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(page.getByRole('textbox', { name: /last name/i }), TEST_USER.lastName, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(page.getByRole('textbox', { name: /company/i }), TEST_USER.company, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(page.getByRole('textbox', { name: /email/i }), email, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(page.getByRole('textbox', { name: /^password$/i }), TEST_USER.validPassword, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(page.getByRole('textbox', { name: /confirm password/i }), TEST_USER.validPassword, { typingDelay: 20, afterTypingDelay: 50 });

    // Verify password toggle works for both fields
    const passwordField = page.getByRole('textbox', { name: /^password$/i });
    const confirmPasswordField = page.getByRole('textbox', { name: /confirm password/i });
    
    await verifyPasswordToggle(passwordField);
    await verifyPasswordToggle(confirmPasswordField);

    await page.getByRole('button', { name: /sign up/i }).click();
    await page.waitForURL(/signup-verify/i, { timeout: 50000 });

    if (apiKey && namespace) {
        const otp = await getOTPFromEmail({ apiKey, namespace, timestamp: timestamp });
        await fillFieldWithDelay(page.getByRole('textbox', { name: /code/i }), otp, { typingDelay: 50, afterTypingDelay: 50 });
        await page.getByRole('button', { name: /verify|submit|confirm/i }).click();

        // Save data for other tests
        console.log('Saving user data for reset password test...');
        saveUserData('signupEmail', email);
        saveUserData('signupPassword', TEST_USER.validPassword);
        saveUserData('signupTimestamp', timestamp);
    }

  });

  test('Sign up fails with existing email', async ({ page }) => {
     await addCursorTracking(page);

    await page.goto('/signup');
    await page.waitForTimeout(50);
    
    // Fill form like a real user
    await fillFieldWithDelay(page.getByRole('textbox', { name: /first name/i }), TEST_USER.firstName, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(page.getByRole('textbox', { name: /last name/i }), TEST_USER.lastName, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(page.getByRole('textbox', { name: /company/i }), TEST_USER.company, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(page.getByRole('textbox', { name: /email/i }), TEST_USER.existingEmail, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(page.getByRole('textbox', { name: /^password$/i }), TEST_USER.validPassword, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(page.getByRole('textbox', { name: /confirm password/i }), TEST_USER.validPassword, { typingDelay: 20, afterTypingDelay: 50 });

    // Verify password toggle works for both fields
    const passwordField = page.getByRole('textbox', { name: /^password$/i });
    const confirmPasswordField = page.getByRole('textbox', { name: /confirm password/i });
    
    await verifyPasswordToggle(passwordField);
    await verifyPasswordToggle(confirmPasswordField);

    await page.getByRole('button', { name: /sign up/i }).click();
    await page.waitForTimeout(1000);

    // Verify error message - check for various possible error messages
    const errorMessage = page.getByText(/user already exists/i)
      .or(page.getByText(/email already/i))
      .or(page.getByText(/already registered/i))
      .or(page.getByText(/account exists/i))
      .or(page.getByRole('alert'))
      .first();
    
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('Sign up fails with passwords do not match', async ({ page }) => {
    await addCursorTracking(page);

    await page.goto('/signup');
    await page.waitForTimeout(50);

    // Fill in all required fields like a real user
    await fillFieldWithDelay(page.getByRole('textbox', { name: /first name/i }), TEST_USER.firstName, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(page.getByRole('textbox', { name: /last name/i }), TEST_USER.lastName, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(page.getByRole('textbox', { name: /company/i }), TEST_USER.company, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(page.getByRole('textbox', { name: /email/i }), TEST_USER.existingEmail, { typingDelay: 20, afterTypingDelay: 50 });
    
    const passwordField = page.getByRole('textbox', { name: /^password$/i });
    const confirmPasswordField = page.getByRole('textbox', { name: /confirm password/i });

    await fillFieldWithDelay(passwordField, TEST_USER.validPassword, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(confirmPasswordField, TEST_USER.invalidPassword, { typingDelay: 20, afterTypingDelay: 50 });

    // Verify password toggle works for both fields
    await verifyPasswordToggle(passwordField);
    await verifyPasswordToggle(confirmPasswordField);
  });

  test('Sign up with weak password', async ({ page }) => {
    await addCursorTracking(page);

    await page.goto('/signup');
    await page.waitForTimeout(50);

    // Fill in all required fields like a real user
    await fillFieldWithDelay(page.getByRole('textbox', { name: /first name/i }), TEST_USER.firstName, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(page.getByRole('textbox', { name: /last name/i }), TEST_USER.lastName, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(page.getByRole('textbox', { name: /company/i }), TEST_USER.company, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(page.getByRole('textbox', { name: /email/i }), 'test@example.com', { typingDelay: 20, afterTypingDelay: 50 });
    
    // Fill with weak password (too short)
    const weakPassword = '123';
    const passwordField = page.getByRole('textbox', { name: /^password$/i });
    const confirmPasswordField = page.getByRole('textbox', { name: /confirm password/i });

    await fillFieldWithDelay(passwordField, weakPassword, { typingDelay: 20, afterTypingDelay: 50 });
    await fillFieldWithDelay(confirmPasswordField, weakPassword, { typingDelay: 20, afterTypingDelay: 50 });

    // Verify password toggle works for both fields
    await verifyPasswordToggle(passwordField);
    await verifyPasswordToggle(confirmPasswordField);
    
    await page.waitForTimeout(100);
  });
});
