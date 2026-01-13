import { test, expect } from '@playwright/test';


test.describe('Reset Password', () => {
  const testEmail = 'sanfasal70@gmail.com';

  test('Reset password with valid OTP code', async ({ page }) => {
    // Navigate to signin page
    await page.goto('/signin');
    
    // Click on "Forgot Password" or "Reset Password" link
    await page.getByRole('link', { name: /forgot password|reset password/i }).click();
    
    // Wait for reset password page to load
    await page.waitForURL(/reset|forgot/i);
    await expect(page).toHaveTitle(/reset|forgot/i);
    
    // Enter email and request OTP
    await page.getByRole('textbox', { name: /email/i }).fill(testEmail);
    await page.getByRole('button', { name: /send code/i }).click();
    
    // Wait for redirect to save-reset-password page
    await page.waitForURL(/save-reset-password/i, { timeout: 10000 });
    
    // Enter OTP code
    const otpInput = page.getByRole('textbox', { name: /code|otp|verification/i });
    await expect(otpInput).toBeVisible();
    
    // Enter new password
    const newPassword = 'NewSecurePassword123!';
    await page.getByRole('textbox', { name: /^password$/i }).fill(newPassword);
    await page.getByRole('textbox', { name: /confirm password/i }).fill(newPassword);
    
    // Submit the form
    await page.getByRole('button', { name: /reset password|submit|confirm/i }).click();
    
    // Verify success
    await expect(page).toHaveURL(/signin|login|success/i, { timeout: 10000 });
    await expect(page.getByText(/password reset|success|updated/i)).toBeVisible();
    
    console.log('✓ Password reset successful');
  });

  // test('Reset password with invalid email', async ({ page }) => {
  //   // Navigate to signin page
  //   await page.goto('/signin');
    
  //   // Click on "Forgot Password" or "Reset Password" link
  //   await page.getByRole('link', { name: /forgot password|reset password/i }).click();
    
  //   // Wait for reset password page to load
  //   await page.waitForURL(/reset|forgot/i);
  //   await expect(page).toHaveTitle(/reset|forgot/i);
    
  //   // Enter invalid email (email that doesn't exist)
  //   const invalidEmail = 'nonexistent_user_12345@gmail.com';
  //   await page.getByRole('textbox', { name: /email/i }).fill(invalidEmail);
  //   await page.getByRole('button', { name: /send code/i }).click();
    
  //   // Verify error message is shown
  //   await expect(
  //     page.getByText(/email not found|user not found|invalid email/i)
  //   ).toBeVisible({ timeout: 5000 });
    
  //   console.log('✓ Invalid email error displayed correctly');
  // });

  // test('Reset password with invalid OTP code', async ({ page }) => {
  //   // Navigate to signin page
  //   await page.goto('/signin');
    
  //   // Click on "Forgot Password" or "Reset Password" link
  //   await page.getByRole('link', { name: /forgot password|reset password/i }).click();
    
  //   // Wait for reset password page to load
  //   await page.waitForURL(/reset|forgot/i);
  //   await expect(page).toHaveTitle(/reset|forgot/i);
    
  //   // Enter email and request OTP
  //   await page.getByRole('textbox', { name: /email/i }).fill(testEmail);
  //   await page.getByRole('button', { name: /send code/i }).click();
    
  //   // Wait for redirect to save-reset-password page
  //   await page.waitForURL(/save-reset-password/i, { timeout: 10000 });
    
  //   // Enter INVALID OTP code
  //   const invalidOtp = '000000';
  //   const otpInput = page.getByRole('textbox', { name: /code|otp|verification/i });
  //   await expect(otpInput).toBeVisible();
  //   await otpInput.fill(invalidOtp);
    
  //   // Enter new password
  //   const newPassword = 'NewSecurePassword123!';
  //   await page.getByRole('textbox', { name: /^password$/i }).fill(newPassword);
  //   await page.getByRole('textbox', { name: /confirm password/i }).fill(newPassword);
    
  //   // Submit the form
  //   await page.getByRole('button', { name: /reset password|submit|confirm/i }).click();
    
  //   // Verify error message is shown
  //   await expect(
  //     page.getByText(/invalid code|incorrect code|code expired|verification failed/i)
  //   ).toBeVisible({ timeout: 5000 });
    
  //   console.log('✓ Invalid OTP error displayed correctly');
  // });

  // test('Reset password with empty fields', async ({ page }) => {
  //   // Navigate to signin page
  //   await page.goto('/signin');
    
  //   // Click on "Forgot Password" or "Reset Password" link
  //   await page.getByRole('link', { name: /forgot password|reset password/i }).click();
    
  //   // Wait for reset password page to load
  //   await page.waitForURL(/reset|forgot/i);
  //   await expect(page).toHaveTitle(/reset|forgot/i);
    
  //   // Try to submit without entering email
  //   await page.getByRole('button', { name: /send code/i }).click();
    
  //   // Verify validation error
  //   const emailInput = page.getByRole('textbox', { name: /email/i });
  //   await expect(emailInput).toHaveAttribute('required', '');
    
  //   console.log('✓ Form validation working correctly');
  // });
});
function waitForOTP(testEmail: string, arg1: {
  subject: string; maxWaitTime: number; // 60 seconds
  pollInterval: number; // Check every 3 seconds
  codeLength: number;
}) {
  throw new Error('Function not implemented.');
}

