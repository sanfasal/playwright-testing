// import { test, expect } from '@playwright/test';
// import { generateTestmailAddress, getOTPFromEmail } from '../../utils/email-helper';
// import { saveUserData, getUserData } from '../../utils/data-store';
// import { login } from '../../utils/auth-helper';
// import dotenv from 'dotenv';
// import { addCursorTracking } from '../../utils/cursor-helper';
// import { fillFieldWithDelay, verifyPasswordToggle } from '../../utils/form-helper';

// // Static test data
// const TEST_USER = {
//   firstName: 'Seksaa',
//   lastName: 'Tech',
//   company: 'SeksaaTech',
//   existingEmail: 'sanfasal70@gmail.com',
//   validPassword: 'Password@123',
//   invalidPassword: 'DPassword@456',
// } as const;
// // Static test data
// const SIGNIN_USER = {
//   email: getUserData('signupEmail') || 'sanfasal.its@gmail.com',
//   validPassword: getUserData('signupPassword') || 'Sal@2025',
//   invalidPassword: 'Sal@12345',
// } as const;

// const ICONS = {
//   eyeOff: '.lucide-eye-off',
//   eye: '.lucide-eye',
// } as const;

// // Speed configuration for demo
// const FAST_TYPING = {
//   clickDelay: 100,
//   typingDelay: 20,
//   afterTypingDelay: 100
// };

// const FAST_PASSWORD = {
//   typingDelay: 50,
//   afterTypingDelay: 300
// };

// dotenv.config();

// test.describe.serial('User sign up', () => {
//   test.setTimeout(60000); // Increase timeout for realistic typing delays

//   // ========================================
//   // Sign Up
//   // ========================================

//   test('Sign up fails with existing email', async ({ page }) => {
//      await addCursorTracking(page);

//     await page.goto('/signup');
//     await page.waitForTimeout(800);

//     await fillFieldWithDelay(page.getByRole('textbox', { name: /first name/i }), TEST_USER.firstName, FAST_TYPING);
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /last name/i }), TEST_USER.lastName, FAST_TYPING);
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /company/i }), TEST_USER.company, FAST_TYPING);
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /email/i }), TEST_USER.existingEmail, FAST_TYPING);
    
//     const passwordField = page.getByRole('textbox', { name: /^password$/i });
//     const confirmPasswordField = page.getByRole('textbox', { name: /confirm password/i });

//     await fillFieldWithDelay(passwordField, TEST_USER.validPassword, FAST_PASSWORD);
//     await fillFieldWithDelay(confirmPasswordField, TEST_USER.validPassword, { ...FAST_PASSWORD, afterTypingDelay: 600 });

//     // Verify password toggle works for both fields
//     await verifyPasswordToggle(passwordField);
//     await verifyPasswordToggle(confirmPasswordField);

//     await page.getByRole('button', { name: /sign up/i }).click();

//     // Verify error message
//     await expect(
//       page.getByText(/user already exists/i)
//     ).toBeVisible({ timeout: 9000 });
//   });

//   test('Sign up fails with passwords do not match', async ({ page }) => {
//     await addCursorTracking(page);

//     await page.goto('/signup');
//     await page.waitForTimeout(800);

//     // Fill in all required fields
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /first name/i }), TEST_USER.firstName, FAST_TYPING);
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /last name/i }), TEST_USER.lastName, FAST_TYPING);
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /company/i }), TEST_USER.company, FAST_TYPING);
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /email/i }), TEST_USER.existingEmail, FAST_TYPING);
    
//     const passwordField = page.getByRole('textbox', { name: /^password$/i });
//     const confirmPasswordField = page.getByRole('textbox', { name: /confirm password/i });

//     await fillFieldWithDelay(passwordField, TEST_USER.validPassword, FAST_PASSWORD);
//     await fillFieldWithDelay(confirmPasswordField, TEST_USER.invalidPassword, { ...FAST_PASSWORD, afterTypingDelay: 600 });
    
//     // Verify password toggle works for both fields
//     await verifyPasswordToggle(passwordField);
//     await verifyPasswordToggle(confirmPasswordField);
//   });

//   test('Sign up with weak password', async ({ page }) => {
//     await addCursorTracking(page);

//     await page.goto('/signup');
//     await page.waitForTimeout(800);

//     // Fill in all required fields
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /first name/i }), TEST_USER.firstName, FAST_TYPING);
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /last name/i }), TEST_USER.lastName, FAST_TYPING);
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /company/i }), TEST_USER.company, FAST_TYPING);
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /email/i }), 'seksaatech@gmail.com', FAST_TYPING);
    
//     // Fill with weak password (too short)
//     const weakPassword = '123';
//     const passwordField = page.getByRole('textbox', { name: /^password$/i });
//     const confirmPasswordField = page.getByRole('textbox', { name: /confirm password/i });

//     await fillFieldWithDelay(passwordField, weakPassword, { typingDelay: 50 });
//     await fillFieldWithDelay(confirmPasswordField, weakPassword, { typingDelay: 50, afterTypingDelay: 300 });
    
//     // Verify password toggle works for both fields
//     await verifyPasswordToggle(passwordField);
//     await verifyPasswordToggle(confirmPasswordField);
    
//     await page.waitForTimeout(1000);
//   });

//   test.skip('Sign up successfully', async ({ page }) => {
//       await addCursorTracking(page);
//   const apiKey = process.env.TESTMAIL_API_KEY;
//   const namespace = process.env.TESTMAIL_NAMESPACE;

//   if (!apiKey || !namespace) {
//     throw new Error('TESTMAIL_API_KEY and TESTMAIL_NAMESPACE must be defined in .env');
//   }
//     // Generate dynamic email
//     const timestamp = Date.now().toString();
//     const email = generateTestmailAddress(namespace, timestamp) 
    

//     await page.goto('/signup');

//     // Wait for page to load
//     await expect(page).toHaveTitle(/Sign Up/i);
//     await page.waitForTimeout(800);

//     // Use accessible selectors with realistic typing
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /first name/i }), TEST_USER.firstName, FAST_TYPING);
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /last name/i }), TEST_USER.lastName, FAST_TYPING);
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /company/i }), TEST_USER.company, FAST_TYPING);
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /email/i }), email, FAST_TYPING);
    
//     const passwordField = page.getByRole('textbox', { name: /^password$/i });
//     const confirmPasswordField = page.getByRole('textbox', { name: /confirm password/i });

//     await fillFieldWithDelay(passwordField, TEST_USER.validPassword, FAST_PASSWORD);
//     await fillFieldWithDelay(confirmPasswordField, TEST_USER.validPassword, { ...FAST_PASSWORD, afterTypingDelay: 600 });
    
//     // Verify password toggle works
//     await verifyPasswordToggle(passwordField);
//     await verifyPasswordToggle(confirmPasswordField);

//     await page.getByRole('button', { name: /sign up/i }).click();
//     await page.waitForURL(/signup-verify/i, { timeout: 50000 });

//     if (apiKey && namespace) {
//         const otp = await getOTPFromEmail({ apiKey, namespace, timestamp: timestamp });
//         await fillFieldWithDelay(page.getByRole('textbox', { name: /code/i }), otp, { typingDelay: 50 });
//         await page.getByRole('button', { name: /verify|submit|confirm/i }).click();

//         // Save data for other tests
//         console.log('Saving user data for reset password test...');
//         saveUserData('signupEmail', email);
//         saveUserData('signupTimestamp', timestamp);
//     }

//   });

//   // ========================================
//   // Sign In
//   // ======================================== 

//     test('Sign in with valid credentials', async ({ page }) => {
//     await addCursorTracking(page);
//     await page.goto('/signin');
//     await expect(page).toHaveTitle(/signin|login/i);
//     await page.waitForTimeout(50);
//     const emailField = page.getByRole('textbox', { name: /email/i });
//     await fillFieldWithDelay(emailField, SIGNIN_USER.email, {
//       typingDelay: 20,
//       afterTypingDelay: 50
//     });
//     const passwordField = page.getByRole('textbox', { name: /password/i });
//     await fillFieldWithDelay(passwordField, SIGNIN_USER.validPassword, {
//       typingDelay: 20,
//       afterTypingDelay: 50
//     });
//     await page.locator(ICONS.eyeOff).click();
//     await page.waitForTimeout(50);
//     await page.locator(ICONS.eye).click();
//     await page.waitForTimeout(50);
//     await page.getByRole('button', { name: /signin|login/i }).click();
//     await page.waitForURL(/dashboard/i);
//     await expect(page).toHaveURL(/dashboard/i);
//     await page.waitForTimeout(100);
//   });
  
//   test('User sign in with invalid credentials', async ({ page }) => {
//       await addCursorTracking(page);
//       await page.goto('/signin');
//       await expect(page).toHaveTitle(/signin|login/i);
//       await page.waitForTimeout(800);
  
//       await fillFieldWithDelay(page.getByRole('textbox', { name: /email/i }), SIGNIN_USER.email, FAST_TYPING);
//       const passwordField = page.getByRole('textbox', { name: /password/i });
//       await fillFieldWithDelay(passwordField, SIGNIN_USER.invalidPassword, { ...FAST_PASSWORD, afterTypingDelay: 600 });
      
//       // Verify password toggle
//       await verifyPasswordToggle(passwordField);
  
//       await page.getByRole('button', { name: /signin|login/i }).click();
//       await page.waitForTimeout(800);
  
//       await expect(page).toHaveURL(/signin/i);
//     });

//   test('User sign in with invalid email format', async ({ page }) => {
//     await addCursorTracking(page);
//     await page.goto('/signin');
//     await expect(page).toHaveTitle(/signin|login/i);

//     // Fill with invalid email format (missing @)
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /email/i }), 'sanfasalgmail.com', FAST_TYPING);
//     const passwordField = page.getByRole('textbox', { name: /password/i });
//     await fillFieldWithDelay(passwordField, SIGNIN_USER.validPassword, { ...FAST_PASSWORD, afterTypingDelay: 600 });
    
//     // Verify password toggle
//     await verifyPasswordToggle(passwordField);

//     await page.waitForTimeout(1000);
//   });


//   // ========================================
//   // Reset Password
//   // ========================================
//   test('Reset password with OTP', async ({ page }) => {
//     await addCursorTracking(page);
//     const apiKey = process.env.TESTMAIL_API_KEY;
//     const namespace = process.env.TESTMAIL_NAMESPACE;

//     if (!apiKey || !namespace) {
//       throw new Error('TESTMAIL_API_KEY and TESTMAIL_NAMESPACE must be defined in .env');
//     }

//     const storedTimestamp = getUserData('signupTimestamp');
//     const storedEmail = getUserData('signupEmail');
    
//     let timestamp = Date.now().toString();
//     let testEmail = generateTestmailAddress(namespace, timestamp);

//     if (storedTimestamp && storedEmail) {
//       console.log(`Using existing signup email: ${storedEmail}`);
//       timestamp = storedTimestamp;
//       testEmail = storedEmail;
//     } else {
//       console.log(`Generating new email for reset password: ${testEmail}`);
//     }
    
//     // Navigate to reset password page
//     await page.goto('/signin');
//     await page.getByRole('link', { name: /forgot password|reset password/i }).click();
//     await page.waitForURL(/reset|forgot/i);
    
//     // Request OTP
//     const emailInput = page.getByRole('textbox', { name: /email/i });
//     await expect(emailInput).toBeVisible({ timeout: 5000 });
//     await fillFieldWithDelay(emailInput, testEmail, FAST_TYPING);
    
//     const sendCodeButton = page.getByRole('button', { name: /send code|send|get code/i });
//     await expect(sendCodeButton).toBeEnabled({ timeout: 5000 });
    
//     // Capture time before requesting OTP to filter out old emails
//     const startTime = Date.now();
//     await sendCodeButton.click();
    
//     // Get OTP from email
//     const otp = await getOTPFromEmail({ 
//         timestamp: timestamp, 
//         apiKey: apiKey, 
//         namespace: namespace 
//     }, undefined, 30000, startTime);
//     await fillFieldWithDelay(page.getByRole('textbox', { name: /code/i }), otp, { typingDelay: 50 });
    
//     // Wait for password fields to appear (they might be on the same page or appear after OTP validation)
//     await page.waitForTimeout(1000);
    
//     // Fill password fields
//     const passwordField = page.getByLabel(/password/i).or(page.getByPlaceholder(/New Password/i));
//     const confirmPasswordField = page.getByLabel(/confirmPassword/i).or(page.getByPlaceholder(/Confirm Password/i));
    
//     await fillFieldWithDelay(passwordField, "Password@123", FAST_PASSWORD);
//     await fillFieldWithDelay(confirmPasswordField, "Password@123", { ...FAST_PASSWORD, afterTypingDelay: 200 });
    
//     // Verify password toggle
//     await verifyPasswordToggle(passwordField);
//     await verifyPasswordToggle(confirmPasswordField);
//     await page.waitForTimeout(1000);


//     await page.getByRole('button', { name: /reset password|reset/i }).click();
//     await page.waitForTimeout(1000);
//   });



//   // ========================================
//   // Invoice Management
//   // ========================================
//   test.describe('Invoice Management', () => {
    
//     test.beforeEach(async ({ page }) => {
//       await login(page);
      
//       await expect(page).toHaveURL(/dashboard/);
//       await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
//       await page.getByText('Invoice', { exact: true }).click();
//       await expect(page).toHaveURL(/invoice/);
//     });

//     test('Add new invoice', async ({ page }) => {
//       await addCursorTracking(page);
//       await page.locator('body > div > div.flex-1.flex.gap-10 > div.flex-1.min-w-\\[600px\\].overflow-auto > main > button').click();
      
//       await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
      
//       await page.getByText('Select Student', { exact: true }).click();
//       await page.waitForTimeout(300); // Small delay for dropdown to open
//       const studentOptions = page.getByRole('option');
//       await studentOptions.first().waitFor({ state: 'visible', timeout: 5000 });
//       await studentOptions.first().click();
      
//       await page.getByText('Select Class', { exact: true }).click();
//       await page.waitForTimeout(300); // Small delay for dropdown to open
//       const classOptions = page.getByRole('option');
//       await classOptions.first().waitFor({ state: 'visible', timeout: 5000 });
//       await classOptions.first().click();
      
//       await page.getByText('Select Status', { exact: true }).click();
//       await page.waitForTimeout(300); // Small delay for dropdown to open
//       const statusOptions = page.getByRole('option');
//       await statusOptions.first().waitFor({ state: 'visible', timeout: 5000 });
//       await statusOptions.first().click();
      
//       await fillFieldWithDelay(page.getByLabel(/Due Date/i), '2026-01-14', FAST_TYPING);
//       await fillFieldWithDelay(page.getByLabel(/Amount \(\$\)/i), '1000', FAST_TYPING);
//       await fillFieldWithDelay(page.getByLabel(/Discount \(\$\)/i), '50', FAST_TYPING);
//       await fillFieldWithDelay(page.getByLabel(/Note/i), 'Test invoice note', FAST_TYPING);
//       await page.getByRole('button', { name: /Create/i }).click();
//     });
//   });
// });
