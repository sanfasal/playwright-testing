import { test, expect } from '@playwright/test';
import { generateTestmailAddress, getOTPFromEmail, generateRandomPassword } from '../../utils/email-helper';
import { getUserData, updateUserPassword } from '../../utils/data-store';
import dotenv from 'dotenv';
import { addCursorTracking } from '../../utils/cursor-helper';


dotenv.config();

test.describe('Reset Password', () => {
  const apiKey = process.env.TESTMAIL_API_KEY;
  const namespace = process.env.TESTMAIL_NAMESPACE;

  if (!apiKey || !namespace) {
    throw new Error('TESTMAIL_API_KEY and TESTMAIL_NAMESPACE must be defined in .env');
  }

  test('Reset password with OTP', async ({ page }) => {
    await addCursorTracking(page);

    const storedTimestamp = getUserData('signupTimestamp');
    const storedEmail = getUserData('signupEmail');
    
    let timestamp = Date.now().toString();
    let testEmail = generateTestmailAddress(namespace, timestamp);

    if (storedTimestamp && storedEmail) {
      console.log(`Using existing signup email: ${storedEmail}`);
      timestamp = storedTimestamp;
      testEmail = storedEmail;
    } else {
      console.log(`Generating new email for reset password: ${testEmail}`);
    }
    
    // Navigate to reset password page
    await page.goto('/signin');
    await page.getByRole('link', { name: /forgot password|reset password/i }).click();
    await page.waitForURL(/reset|forgot/i);
    
    // Request OTP
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await emailInput.fill(testEmail);
    
    const sendCodeButton = page.getByRole('button', { name: /send code|send|get code/i });
    await expect(sendCodeButton).toBeEnabled({ timeout: 5000 });
    
    // Capture time before requesting OTP to filter out old emails
    const startTime = Date.now();
    await sendCodeButton.click();
    
    // Get OTP from email
    const otp = await getOTPFromEmail({ 
        timestamp: timestamp, 
        apiKey: apiKey, 
        namespace: namespace 
    }, undefined, 30000, startTime);
    await page.getByRole('textbox', { name: /code/i }).fill(otp);
    
    // Wait for password fields to appear (they might be on the same page or appear after OTP validation)
    await page.waitForTimeout(2000);
    
    // Fill password fields - password inputs need getByLabel or getByPlaceholder (not getByRole('textbox'))
    const passwordField = page.getByLabel(/password/i).or(page.getByPlaceholder(/New Password/i));
    const confirmPasswordField = page.getByLabel(/confirmPassword/i).or(page.getByPlaceholder(/Confirm Password/i));
    
    const newPassword = generateRandomPassword(12);

    await expect(passwordField).toBeVisible({ timeout: 10000 });
    await passwordField.fill(newPassword);
    
    await expect(confirmPasswordField).toBeVisible({ timeout: 5000 });
    await confirmPasswordField.fill(newPassword);
    
    await page.waitForTimeout(1000);
    
    // Submit form
    const submitButton = page.getByRole('button', { 
      name: /reset password|submit|confirm|save|update|next|continue/i 
    });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();
    await page.waitForTimeout(2000);
    
    // Handle save-reset-password page if it appears
    const currentUrl = page.url();
    if (currentUrl.includes('save-reset-password') || currentUrl.includes('save') || currentUrl.includes('confirm')) {
      const saveButton = page.getByRole('button', { name: /save|confirm|finish|complete|done/i }).first();
      
      if (await saveButton.isVisible().catch(() => false)) {
        await saveButton.click();
      }
    }
    
    // Update the password in user-data.json
    updateUserPassword(testEmail, newPassword);
  });

  test('Reset password with invalid OTP and attempt password input', async ({ page }) => {
    await addCursorTracking(page);

    const storedTimestamp = getUserData('signupTimestamp');
    const storedEmail = getUserData('signupEmail');
    
    let timestamp = Date.now().toString();
    let testEmail = generateTestmailAddress(namespace, timestamp);

    if (storedTimestamp && storedEmail) {
      console.log(`Using existing signup email: ${storedEmail}`);
      timestamp = storedTimestamp;
      testEmail = storedEmail;
    } else {
      console.log(`Generating new email for reset password: ${testEmail}`);
    }
    
    // Navigate to reset password page
    await page.goto('/signin');
    await page.getByRole('link', { name: /forgot password|reset password/i }).click();
    await page.waitForURL(/reset|forgot/i);
    
    // Request OTP
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await emailInput.fill(testEmail);
    
    const sendCodeButton = page.getByRole('button', { name: /send code|send|get code/i });
    await expect(sendCodeButton).toBeEnabled({ timeout: 5000 });
    await sendCodeButton.click();
    
    // Wait for OTP input to appear
    await page.waitForTimeout(2000);
    
    // Enter invalid static OTP
    const invalidOTP = "999999";
    await page.getByRole('textbox', { name: /code/i }).fill(invalidOTP);
    
    
    // Try to fill password fields with invalid OTP
    const passwordField = page.getByLabel(/password/i).or(page.getByPlaceholder(/New Password/i));
    const confirmPasswordField = page.getByLabel(/confirmPassword/i).or(page.getByPlaceholder(/Confirm Password/i));
    
    await passwordField.fill("Password@123");
    await confirmPasswordField.fill("Password@123");
    await page.waitForTimeout(5000);
  });

  test('Reset password with weak password', async ({ page }) => {
    await addCursorTracking(page);

    const storedTimestamp = getUserData('signupTimestamp');
    const storedEmail = getUserData('signupEmail');
    
    let timestamp = Date.now().toString();
    let testEmail = generateTestmailAddress(namespace, timestamp);

    if (storedTimestamp && storedEmail) {
      console.log(`Using existing signup email: ${storedEmail}`);
      timestamp = storedTimestamp;
      testEmail = storedEmail;
    } else {
      console.log(`Generating new email for reset password: ${testEmail}`);
    }
    
    // Navigate to reset password page
    await page.goto('/signin');
    await page.getByRole('link', { name: /forgot password|reset password/i }).click();
    await page.waitForURL(/reset|forgot/i);
    
    // Request OTP
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await emailInput.fill(testEmail);
    
    const sendCodeButton = page.getByRole('button', { name: /send code|send|get code/i });
    await expect(sendCodeButton).toBeEnabled({ timeout: 5000 });
    
    const startTime = Date.now();
    await sendCodeButton.click();
    
    // Get OTP from email
    const otp = await getOTPFromEmail({ 
        timestamp: timestamp, 
        apiKey: apiKey, 
        namespace: namespace 
    }, undefined, 30000, startTime);
    await page.getByRole('textbox', { name: /code/i }).fill(otp);
    
    await page.waitForTimeout(2000);
    
    // Fill with weak password (too short)
    const passwordField = page.getByLabel(/password/i).or(page.getByPlaceholder(/New Password/i));
    const confirmPasswordField = page.getByLabel(/confirmPassword/i).or(page.getByPlaceholder(/Confirm Password/i));
    
    await expect(passwordField).toBeVisible({ timeout: 10000 });
    await passwordField.fill("123");
    
    await expect(confirmPasswordField).toBeVisible({ timeout: 5000 });
    await confirmPasswordField.fill("123");
    
    await page.waitForTimeout(2000);
  });


  test('Reset password without special characters', async ({ page }) => {
    await addCursorTracking(page);

    const storedTimestamp = getUserData('signupTimestamp');
    const storedEmail = getUserData('signupEmail');
    
    let timestamp = Date.now().toString();
    let testEmail = generateTestmailAddress(namespace, timestamp);

    if (storedTimestamp && storedEmail) {
      console.log(`Using existing signup email: ${storedEmail}`);
      timestamp = storedTimestamp;
      testEmail = storedEmail;
    } else {
      console.log(`Generating new email for reset password: ${testEmail}`);
    }
    
    // Navigate to reset password page
    await page.goto('/signin');
    await page.getByRole('link', { name: /forgot password|reset password/i }).click();
    await page.waitForURL(/reset|forgot/i);
    
    // Request OTP
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await emailInput.fill(testEmail);
    
    const sendCodeButton = page.getByRole('button', { name: /send code|send|get code/i });
    await expect(sendCodeButton).toBeEnabled({ timeout: 5000 });
    
    const startTime = Date.now();
    await sendCodeButton.click();
    
    // Get OTP from email
    const otp = await getOTPFromEmail({ 
        timestamp: timestamp, 
        apiKey: apiKey, 
        namespace: namespace 
    }, undefined, 30000, startTime);
    await page.getByRole('textbox', { name: /code/i }).fill(otp);
    
    await page.waitForTimeout(2000);
    
    // Fill with password without special characters
    const passwordField = page.getByLabel(/password/i).or(page.getByPlaceholder(/New Password/i));
    const confirmPasswordField = page.getByLabel(/confirmPassword/i).or(page.getByPlaceholder(/Confirm Password/i));
    
    await expect(passwordField).toBeVisible({ timeout: 10000 });
    await passwordField.fill("Password123");
    
    await expect(confirmPasswordField).toBeVisible({ timeout: 5000 });
    await confirmPasswordField.fill("Password123");
    
    await page.waitForTimeout(2000);
  });
});
