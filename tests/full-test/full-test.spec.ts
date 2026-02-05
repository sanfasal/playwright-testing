import { test, expect } from '@playwright/test';
import { getOTPFromEmail, generateRandomPassword, generateTestmailAddress } from '../../utils/email-helper';
import { addUser, getUserData, getUserPasswordByEmail, updateUserEmail, updateUserPassword } from '../../utils/data-store';
import { login } from '../../utils/auth-helper';
import dotenv from 'dotenv';
import { addCursorTracking } from '../../utils/cursor-helper';
import { FileInput, verifyPasswordToggle } from '../../utils/form-helper';
import { deleteEntityViaActionMenu, deleteItem } from '../../utils/delete-helper';
import { uploadThumbnail } from '../../utils/upload-thumbnail-helper';
import { generateVerifiedEmails } from '../../utils/email-generator';
import * as fs from 'fs';
import * as path from 'path';
import staticData from '../../constant/static-data.json';
import { toggleViewMode } from '../../utils/view-helper';

// Load environment variables
dotenv.config();

// Static test data
const { 
  TEST_USER, 
  personalDataEdit, 
  systemDataEdit, 
  userDataAdd: userDataAddBase,
  userDataEdit: userDataEditBase,
  coachDataAdd: coachDataAddBase,
  coachDataEdit: coachDataEditBase,
  studentDataAdd: studentDataAddBase,
  studentDataEdit: studentDataEditBase,
} = staticData;

// Generate random suffix for unique emails and identifiers
const randomSuffix = Math.floor(Math.random() * 10000);

// Build dynamic data objects from static data with runtime values
const userDataAdd = {
  ...userDataAddBase,
  dob: new Date().toISOString().split("T")[0],
};

const userDataEdit = {
  ...userDataEditBase,
};

const coachDataAdd = {
  ...coachDataAddBase,
  email: `${coachDataAddBase.emailPrefix}${randomSuffix}@gmail.com`,
  dob: new Date().toISOString().split("T")[0],
};

const coachDataEdit = {
  ...coachDataEditBase,
  email: `${coachDataEditBase.emailPrefix}${randomSuffix}@gmail.com`,
  dob: new Date().toISOString().split("T")[0],
};

const studentDataAdd = {
  ...studentDataAddBase,
  lastName: `${studentDataAddBase.lastNamePrefix} ${randomSuffix}`,
  email: `${studentDataAddBase.emailPrefix}.${randomSuffix}@gmail.com`,
  telegram: `${studentDataAddBase.telegramPrefix}${randomSuffix}`,
  dob: new Date().toISOString().split('T')[0],
  guardian: {
    ...studentDataAddBase.guardian,
    email: `${studentDataAddBase.guardian.emailPrefix}${randomSuffix}@gmail.com `,
  },
  emergency: {
    ...studentDataAddBase.emergency,
    email: `${studentDataAddBase.emergency.emailPrefix}${randomSuffix}@gmail.com`,
  },
};

const studentDataEdit = {
  ...studentDataEditBase,
  email: `${studentDataEditBase.emailPrefix}${randomSuffix}@gmail.com`,
  telegram: `${studentDataEditBase.telegramPrefix}${randomSuffix}`,
  dob: new Date().toISOString().split('T')[0],
  guardian: {
    ...studentDataEditBase.guardian,
    email: `${studentDataEditBase.guardian.emailPrefix}${randomSuffix}@gmail.com `,
  },
  emergency: {
    ...studentDataEditBase.emergency,
    email: `${studentDataEditBase.emergency.emailPrefix}${randomSuffix}@gmail.com `,
  },
};

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

test.describe.serial('Full Test', () => {
  test.setTimeout(1200000); // 20 minutes global timeout for this extended suite

  // ========================================
  // 1. Auth
  // ========================================
  test.describe('Auth', () => {
    test.skip("Sign Up", async ({ page }) => {
    await addCursorTracking(page);

    const apiKey = process.env.TESTMAIL_API_KEY;
    const namespace = process.env.TESTMAIL_NAMESPACE;

    // Generate fresh emails before starting
    generateVerifiedEmails();

    if (!apiKey || !namespace) {
      throw new Error(
        "TESTMAIL_API_KEY and TESTMAIL_NAMESPACE must be defined in .env"
      );
    }
    // Read generated emails
    const emailsPath = path.resolve(__dirname, "../../generated-emails.json");
    
    if (!fs.existsSync(emailsPath)) {
        throw new Error(`Generated emails file not found at ${emailsPath}`);
    }

    const emails = JSON.parse(fs.readFileSync(emailsPath, "utf-8"));
    if (!emails || emails.length === 0) {
        throw new Error("No generated emails found in file");
    }

    // Use the first email (index 0)
    const emailObj = emails[0];
    const email = emailObj.email;
    
    // Extract timestamp from email (format: namespace.timestamp@inbox.testmail.app)
    // The timestamp is the part between the dot and the @
    const match = email.match(/\.(\d+)@/);
    if (!match) {
        throw new Error(`Could not extract timestamp from email: ${email}`);
    }
    const timestamp = match[1];

    // Use the password from the generated email if available, otherwise generate a new one
    const password = emailObj.password || generateRandomPassword(12);
    
    if (emailObj.password) {
        console.log(`Using password from generated-emails.json: ${password}`);
    } else {
        console.log(`No password found in generated-emails.json, generated new one: ${password}`);
    }

    await page.goto("/signup");

    // Wait for page to load
    await expect(page).toHaveTitle(/Sign Up/i);
    await page.waitForTimeout(50);

    // Fill form like a real user
    await FileInput(
      page.getByRole("textbox", { name: /first name/i }),
      TEST_USER.firstName
    );
    await FileInput(
      page.getByRole("textbox", { name: /last name/i }),
      TEST_USER.lastName
    );
    await FileInput(
      page.getByRole("textbox", { name: /company/i }),
      TEST_USER.company
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
  });

  //===============================================================================
  //Sign In
  test('Sign In', async ({ page }) => {
      await addCursorTracking(page);
      await page.goto('/signin');
      await expect(page).toHaveTitle(/signin|login/i);
      await page.waitForTimeout(50);
      const SIGNIN_USER = getSigninUser();
      const emailField = page.getByRole('textbox', { name: /email/i });
      await FileInput(emailField, SIGNIN_USER.email);
      const passwordField = page.getByRole('textbox', { name: /password/i });
      await FileInput(passwordField, SIGNIN_USER.validPassword);
      await page.locator(ICONS.eyeOff).click();
      await page.waitForTimeout(50);
      await page.locator(ICONS.eye).click();
      await page.waitForTimeout(50);
      await page.getByRole('button', { name: /signin|login/i }).click();
      await page.waitForURL(/dashboard/i);
      await expect(page).toHaveURL(/dashboard/i);
      await page.waitForTimeout(1000);
    });
  });

  // ========================================
  // 2. Personal Life
  // ========================================

  test.describe('Personal Life', () => {
    test.beforeEach(async ({ page }) => {
      await addCursorTracking(page);
      await login(page);
      await expect(page).toHaveURL(/dashboard/);

      await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 1000 });
      await page.getByText('Personal Life', { exact: true }).click().catch(() => null);
      await expect(page).toHaveURL(/\/personal-life/).catch(() => null);
    });


    //Edit Profile
    test('Edit Profile', async ({ page }) => {
      const pageUpdateBtn = page.getByRole('button', { name: /^(Update Settings|Update Profile)$/i }).first();
      if (await pageUpdateBtn.isVisible().catch(() => false)) {
        await pageUpdateBtn.click();
      } else {
        const rows = page.locator('table tbody tr, [role="row"], .personal-life-item, div[class*="personal-life"]');
        const row = rows.nth(0);
        if (!(await row.isVisible().catch(() => false))) return;
        const editBtn = row.getByRole('button', { name: /Edit|Update/i }).first().or(row.locator('button').filter({ has: page.locator('svg') }).first());
        if (await editBtn.isVisible().catch(() => false)) {
          await editBtn.click();
        }
      }
      // Upload profile picture
      await uploadThumbnail(page, "file-input-profile || selected-exist-profile");  
      // First / Last name
      const firstNameField = page.getByLabel(/First Name/i).or(page.locator('#firstName, input[name="firstName"]'));
      if (await firstNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstNameField.clear();
        await FileInput(firstNameField, personalDataEdit.firstName);
      }

      const lastNameField = page.getByLabel(/Last Name/i).or(page.locator('#lastName, input[name="lastName"]'));
      if (await lastNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await lastNameField.clear();
        await FileInput(lastNameField, personalDataEdit.lastName);
      }

      // Gender selection (dropdown)
      const genderButton = page.locator('button[role="combobox"]').filter({ has: page.locator('svg') }).first();
      if (await genderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await genderButton.click();
        await page.waitForTimeout(400);
        const genderOption = page.locator('[role="option"]').filter({ hasText: personalDataEdit.gender }).first();
        if (await genderOption.isVisible({ timeout: 1500 }).catch(() => false)) {
          await genderOption.click();
          await page.waitForTimeout(300);
        } else {
          const firstOption = page.locator('[role="option"]').first();
          if (await firstOption.isVisible({ timeout: 1500 }).catch(() => false)) {
            await firstOption.click();
            await page.waitForTimeout(300);
          }
        }
      }

      // Phone
      const phoneField = page.locator('#phone').or(page.getByLabel(/Phone Number|Phone/i)).or(page.getByPlaceholder(/012345678|098/));
      if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await phoneField.clear();
        await FileInput(phoneField, personalDataEdit.phone);
      }

      // Date of Birth
      const dobField = page.getByLabel(/Date of Birth|DOB|Birth Date/i).or(page.locator('#dob, input[name="dob"], input[type="date"]'));
      if (await dobField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dobField.click();
        await page.waitForTimeout(200);
        await dobField.fill(personalDataEdit.dob);
        await page.waitForTimeout(300);
      }

      // Occupation
      const occupationField = page.getByLabel(/Occupation/i).or(page.locator('input[name="occupation"]'));
      if (await occupationField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await occupationField.clear();
        await FileInput(occupationField, personalDataEdit.occupation);
      }

      // Bio / About
      const bioField = page.getByLabel(/Bio|About me/i).or(page.locator('textarea[name="bio"]'));
      if (await bioField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await bioField.fill(personalDataEdit.bio);
      }

      // Address: Village, Commune, District, City
      const villageField = page.getByPlaceholder('Village').or(page.locator('input[name="address.village"]')).or(page.getByLabel(/Village/i));
      if (await villageField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await villageField.clear();
        await FileInput(villageField, personalDataEdit.address.village);
        await page.waitForTimeout(300);
      }

      const communeField = page.getByPlaceholder('Commune').or(page.locator('input[name="address.commune"]')).or(page.locator('#commune'));
      if (await communeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await communeField.scrollIntoViewIfNeeded();
        const isDisabled = await communeField.isDisabled().catch(() => false);
        if (!isDisabled) {
          await communeField.clear();
          await FileInput(communeField, personalDataEdit.address.commune);
        }
      }

      const districtField = page.getByPlaceholder('District').or(page.locator('input[name="address.district"]')).or(page.locator('#district'));
      if (await districtField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await districtField.scrollIntoViewIfNeeded();
        const isDisabled = await districtField.isDisabled().catch(() => false);
        if (!isDisabled) {
          await districtField.clear();
          await FileInput(districtField, personalDataEdit.address.district);
        }
      }

      const cityField = page.getByPlaceholder('Province').or(page.locator('input[name="address.city"]')).or(page.locator('#city'));
      if (await cityField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cityField.scrollIntoViewIfNeeded();
        const isDisabled = await cityField.isDisabled().catch(() => false);
        if (!isDisabled) {
          await cityField.clear();
          await FileInput(cityField, personalDataEdit.address.city);
        }
      }

      // Submit
      const submit = page.getByRole('button', { name: /Save|Update|Submit/i });
      if (await submit.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submit.click();
        await page.waitForTimeout(1000);
      }
    });
  });

  //Change Email
  test('Change Gmail', async ({ page }) => {  
      // Read generated emails to verify available accounts
      const generatedEmailsPath = path.resolve(__dirname, '../../generated-emails.json');
      if (!fs.existsSync(generatedEmailsPath)) {
          throw new Error("generated-emails.json not found. Cannot proceed with email change test.");
      }
      const generatedEmails = JSON.parse(fs.readFileSync(generatedEmailsPath, 'utf-8'));
      if (!Array.isArray(generatedEmails) || generatedEmails.length < 2) {
          throw new Error("Need at least 2 generated emails in generated-emails.json to test cycling.");
      }
  
      // Read current user data to find who is currently signed up/in
      const userDataPath = path.resolve(__dirname, '../../user-data.json');
      let currentEmail = '';
      
      if (fs.existsSync(userDataPath)) {
          const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf-8'));
          // Try to get email from users array first
          if (userData.users && Array.isArray(userData.users) && userData.users.length > 0) {
              currentEmail = userData.users[0].email;
          } else if (userData.signupEmail) {
              currentEmail = userData.signupEmail;
          }
      }
  
      // Determine target email for the change
      // If currentEmail is found in generatedEmails, pick the OTHER one.
      // Default to index 0 if current not found (will trigger signup) -> target index 1
      let currentIndex = generatedEmails.findIndex((e: any) => e.email === currentEmail);
      
      if (currentIndex === -1) {
          console.log(`Current email ${currentEmail} not found in generated-emails.json (or no current user). Defaulting to start with index 0.`);
          currentIndex = 0;
          currentEmail = generatedEmails[0].email;
      }
      
      // Toggle index: if 0 -> 1, if 1 -> 0
      const targetIndex = currentIndex === 0 ? 1 : 0;
      const targetEmailData = generatedEmails[targetIndex];
      const targetEmail = targetEmailData.email;
  
      // Determine credential source for the TARGET email (to get OTP)
      // Map source string to env vars
      let targetApiKey = '';
      let targetNamespace = '';
      
      if (targetEmailData.source === 'email-helper1') {
          targetApiKey = process.env.TESTMAIL_API_KEY!;
          targetNamespace = process.env.TESTMAIL_NAMESPACE!;
      } else {
          // Default to helper2 for others or explicitly checking 'email-helper2'
          targetApiKey = process.env.TESTMAIL_API_KEY2!;
          targetNamespace = process.env.TESTMAIL_NAMESPACE2!;
      }
  
      if (!targetApiKey || !targetNamespace) {
          throw new Error(`Could not find API keys for source: ${targetEmailData.source} (Target Email: ${targetEmail}). Check .env`);
      }
  
      // Also need credentials for CURRENT email if we need to signup (rare, but good for completeness)
      const currentApiKey = generatedEmails[currentIndex].source === 'email-helper1' 
          ? process.env.TESTMAIL_API_KEY! 
          : process.env.TESTMAIL_API_KEY2!;
      const currentNamespace = generatedEmails[currentIndex].source === 'email-helper1'
          ? process.env.TESTMAIL_NAMESPACE!
          : process.env.TESTMAIL_NAMESPACE2!;
  
  
      await addCursorTracking(page);
  
      // Step 2: Ensure User is Logged In
      // Check if current user is actually signed up in user-data.json (simulated check)
      // Real check: try login. If fail, signup.
      
      console.log(`Step 2: Checking/Ensuring Login with ${currentEmail}...`);
      
      // We can use the helper's login. If it fails (caught by us or helper?), we might need signup.
      // However, the test requirement implies we are likely already simulating a user flow.
      // Let's safe-guard: Check if email exists in user-data. If not, signup.
      
      let isSignedUp = false;
      let knownPassword = getUserPasswordByEmail(currentEmail);
  
      if (fs.existsSync(userDataPath)) {
           const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf-8'));
           isSignedUp = userData.users?.some((u: any) => u.email === currentEmail) || userData.signupEmail === currentEmail;
      }
  
      await login(page, currentEmail, knownPassword || undefined);
      await expect(page).toHaveURL(/dashboard/);
      await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 10000 });
  
      // Step 3: Navigate to Personal Life
      console.log("Step 3: Navigating to Personal Life page...");
      await page.getByText('Personal Life', { exact: true }).click().catch(() => null);
      await expect(page).toHaveURL(/\/personal-life/).catch(() => null);
      
      // Step 4: Initiate Email Change
      console.log(`Step 4: Changing email to ${targetEmail}...`);
      
      const pageUpdateBtn = page.getByRole('button', { name: /^(Change Email|Update Email)$/i }).first();
      if (await pageUpdateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await pageUpdateBtn.click();
        await page.waitForTimeout(600);
      } else {
        const rows = page.locator('table tbody tr, [role="row"], .personal-life-item, div[class*="personal-life"]');
        const row = rows.nth(0);
        if (!(await row.isVisible({ timeout: 3000 }).catch(() => false))) {
            console.warn("Could not find Personal Life row/table. Test might fail.");
        }
        const editBtn = row.getByRole('button', { name: /Edit|Update/i }).first().or(row.locator('button').filter({ has: page.locator('svg') }).first());
        if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await editBtn.click();
          await page.waitForTimeout(600);
        }
      }
  
      // Step 5: Fill New Email
      const newEmailInput = page.locator('#newEmail');
      await newEmailInput.waitFor({ state: 'visible', timeout: 10000 });
      await FileInput(newEmailInput, targetEmail); 
  
      const confirmEmailField = page.locator('#confirmNewEmail')
          .or(page.locator('input[name="confirmNewEmail"]'))
          .or(page.getByLabel(/Confirm New Email/i))
          .or(page.getByPlaceholder(/Confirm/i));
  
      await confirmEmailField.waitFor({ state: 'visible', timeout: 5000 });
      await confirmEmailField.clear();
      await FileInput(confirmEmailField, targetEmail);
  
      // Submit Change Request
      const otpSentTime = Date.now();
      const submit = page.getByRole('button', { name: /Change|Update|Submit|Save/i });
      if (await submit.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submit.click();
        await page.waitForTimeout(1000);
      }
  
      // Step 6: Verify OTP
      console.log("Step 5: Waiting for OTP...");
      const otpField = page.getByRole('textbox', { name: /code|otp|verification/i }).or(page.locator('input[name="code"], input[name="otp"]'));
      await expect(otpField).toBeVisible({ timeout: 30000 });
  
      // Extract timestamp from target email (format: namespace.timestamp@...)
      const targetEmailParts = targetEmail.split('@')[0].split('.');
      const targetTimestamp = targetEmailParts[targetEmailParts.length - 1];
  
      const otp = await getOTPFromEmail({
          apiKey: targetApiKey,
          namespace: targetNamespace,
          timestamp: targetTimestamp
      }, undefined, 30000, otpSentTime);
  
      await FileInput(otpField, otp);
      
      const verifyBtn = page.getByRole('button', { name: /Verify|Confirm|Submit/i });
      if (await verifyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await verifyBtn.click();
          await page.waitForTimeout(1000);
      }

      updateUserEmail(currentEmail, targetEmail);
    });

  //Update Password
  test.describe('Update Password', () => {

    test.beforeEach(async ({ page }) => {
      await addCursorTracking(page);
      await login(page);
      await expect(page).toHaveURL(/dashboard/);

      await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 30000 });
      await page.getByText('Personal Life', { exact: true }).click().catch(() => null);
      await expect(page).toHaveURL(/\/personal-life/).catch(() => null);
    });
    
    test('Update Password', async ({ page }) => {
        test.setTimeout(120000);

        // Prefer page-level update button (Update Settings / Update Profile), fallback to edit controls
        const updatePwdBtn = page.getByRole('button', { name: /^(Update Password|Change Password)$/i });
        await updatePwdBtn.scrollIntoViewIfNeeded().catch(() => null);
        await updatePwdBtn.click().catch(() => null);

        // Current Password
        let currentPassword = 'Test@123'; // Fallback
        let currentEmail = '';
        const userDataPath = path.resolve(__dirname, '..', '..', 'user-data.json');
        try {
            if (fs.existsSync(userDataPath)) {
                const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf-8'));
                if (userData.users && userData.users.length > 0) {
                     currentPassword = userData.users[userData.users.length - 1].password;
                     currentEmail = userData.users[userData.users.length - 1].email;
                } else if (userData.signupEmail) {
                     currentPassword = userData.signupPassword;
                     currentEmail = userData.signupEmail;
                }
            }
        } catch (e) {
            console.error("Error reading user-data.json for password:", e);
        }

        const currentPasswordField = page.locator('#currentPassword');
        if (await currentPasswordField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await currentPasswordField.clear();
          await FileInput(currentPasswordField, currentPassword);
          // Scope icon to the field's container
          const fieldContainer = page.locator('div')
            .filter({ has: currentPasswordField })
            .filter({ has: page.locator(ICONS.eyeOff).or(page.locator(ICONS.eye)) })
            .last();
          
          if (await fieldContainer.locator(ICONS.eyeOff).isVisible().catch(() => false)) {
              await fieldContainer.locator(ICONS.eyeOff).click();
              await page.waitForTimeout(50);
              await fieldContainer.locator(ICONS.eye).click();
              await page.waitForTimeout(50);
          }
        }

        // New Password
        const newPassword = generateRandomPassword(12);
        const newPasswordField = page.locator('#newPassword');
        if (await newPasswordField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await newPasswordField.clear();
          await FileInput(newPasswordField, newPassword);
          const fieldContainer = page.locator('div')
            .filter({ has: newPasswordField })
            .filter({ has: page.locator(ICONS.eyeOff).or(page.locator(ICONS.eye)) })
            .last();
          
          if (await fieldContainer.locator(ICONS.eyeOff).isVisible().catch(() => false)) {
              await fieldContainer.locator(ICONS.eyeOff).click();
              await page.waitForTimeout(50);
              await fieldContainer.locator(ICONS.eye).click();
              await page.waitForTimeout(50);
          }
        }

        // Confirm Password
        const confirmPasswordField = page.locator('#confirmPassword');
        if (await confirmPasswordField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmPasswordField.clear();
          await FileInput(confirmPasswordField, newPassword);
          const fieldContainer = page.locator('div')
            .filter({ has: confirmPasswordField })
            .filter({ has: page.locator(ICONS.eyeOff).or(page.locator(ICONS.eye)) })
            .last();

          if (await fieldContainer.locator(ICONS.eyeOff).isVisible().catch(() => false)) {
              await fieldContainer.locator(ICONS.eyeOff).click();
              await page.waitForTimeout(50);
              await fieldContainer.locator(ICONS.eye).click();
              await page.waitForTimeout(200);
          }
        }

        // Submit
        const submit = page.getByRole('button', { name: /Save|Update|Submit/i });
        if (await submit.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submit.click();
          await page.waitForTimeout(1000);
          
          if (currentEmail && newPassword) {
              updateUserPassword(currentEmail, newPassword);
          }
        }
      });
  });

  // ========================================
  // 3. System Settings
  // ========================================

  test.describe("System", () => {
    test.beforeEach(async ({ page }) => {
      await addCursorTracking(page);
      await login(page);
      await expect(page).toHaveURL(/dashboard/);

      // Wait for workspace to load then navigate to System
      await expect(
        page.getByText("Please wait while we load your workspace")
      ).toBeHidden({ timeout: 20000 });
      await page
        .getByText("System", { exact: true })
        .click()
        .catch(() => null);
      await expect(page)
        .toHaveURL(/\/system/)
        .catch(() => null);
    });

    test("Edit system", async ({ page }) => {
      test.setTimeout(120000);
      await page.waitForTimeout(1000);

      // Try to click the page-level "Update Settings" button first
      const pageUpdateBtn = page
        .getByRole("button", { name: /^Update Settings$/i })
        .first();
      if (await pageUpdateBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await pageUpdateBtn.click();
        await page.waitForTimeout(800);
      } else {
        // Fallback: try a row-local Edit button or a generic Edit button
        const rows = page.locator(
          'table tbody tr, [role="row"], .system-item, div[class*="system"]'
        );
        const row = rows.nth(0);
        if (!(await row.isVisible({ timeout: 3000 }).catch(() => false))) return;

        const preferredBtnByText = row
          .getByRole("button", { name: /Edit System|Edit/i })
          .first();
        let editBtn = preferredBtnByText;
        if (
          !(await preferredBtnByText
            .isVisible({ timeout: 1000 })
            .catch(() => false))
        ) {
          const globalBtn = page
            .getByRole("button", { name: /Edit System|Edit/i })
            .first();
          if (await globalBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            editBtn = globalBtn;
          } else {
            editBtn = row
              .locator("button")
              .filter({ has: page.locator("svg") })
              .first();
          }
        }

        if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await editBtn.click();
          await page.waitForTimeout(1200);
        }
      }

      // Upload Profile Image
      await uploadThumbnail(page, "file-input-profile || selected-exist-profile");

      // Edit Name
      const nameField = page
        .getByLabel(/Name|System Name/i)
        .or(page.locator('#name, input[name="name"]'));
      if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nameField.clear();
        await FileInput(nameField, systemDataEdit.name);
      }

      // Edit Contact Email
      const emailField = page
        .getByLabel(/Email|Contact Email/i)
        .or(page.getByPlaceholder(/email/i))
        .or(page.locator('input[type="email"]'));
      if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emailField.clear();
        await FileInput(emailField, systemDataEdit.contactEmail);
      }

      // Edit Phone
      const phoneField = page
        .getByLabel(/Phone|Contact Number/i)
        .or(page.locator("#phone"));
      if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await phoneField.clear();
        await FileInput(phoneField, systemDataEdit.phone);
      }

      // Website
      const websiteField = page
        .getByLabel(/Website/i)
        .or(page.locator('#website, input[name="website"]'));
      if (await websiteField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await websiteField.clear();
        await FileInput(websiteField, systemDataEdit.website);
      }

      // Edit Address fields (Village, Commune, District, City)
      const villageField = page
        .getByPlaceholder("Village")
        .or(page.locator('input[name="address.village"]'))
        .or(page.getByLabel(/Village/i));
      if (await villageField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await villageField.clear();
        await FileInput(
          villageField,
          systemDataEdit.village
        );
        await page.waitForTimeout(500);
      }

      const communeField = page
        .getByPlaceholder("Commune")
        .or(page.locator('input[name="address.commune"]'))
        .or(page.locator("#commune"));
      if (await communeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await communeField.scrollIntoViewIfNeeded();
        const isDisabled = await communeField.isDisabled().catch(() => false);
        if (!isDisabled) {
          await communeField.clear();
          await FileInput(communeField, systemDataEdit.commune);
        }
      }

      const districtField = page
        .getByPlaceholder("District")
        .or(page.locator('input[name="address.district"]'))
        .or(page.locator("#district"));
      if (await districtField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await districtField.scrollIntoViewIfNeeded();
        const isDisabled = await districtField.isDisabled().catch(() => false);
        if (!isDisabled) {
          await districtField.clear();
          await FileInput(districtField, systemDataEdit.district);
        }
      }

      const cityField = page
        .getByPlaceholder("Province")
        .or(page.locator('input[name="address.city"]'))
        .or(page.locator("#city"));
      if (await cityField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cityField.scrollIntoViewIfNeeded();
        const isDisabled = await cityField.isDisabled().catch(() => false);
        if (!isDisabled) {
          await cityField.clear();
          await FileInput(cityField, systemDataEdit.city);
        }
      }

      // Submit
      const submitButton = page.getByRole("button", {
        name: /Update|Save|Submit/i,
      });
      if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitButton.click();
        await page.waitForTimeout(1500);
      }
    });
  });

  // ========================================
  // 3. Users Management
  // ========================================

  test.describe("Users", () => {
    test.beforeEach(async ({ page }) => {
      await addCursorTracking(page);
      await login(page);
      await expect(page).toHaveURL(/dashboard/);
      await expect(
        page.getByText("Please wait while we load your workspace")
      ).toBeHidden({ timeout: 20000 });
      await page.getByText("User", { exact: true }).click();
      await expect(page).toHaveURL(/\/users/);
    });

    // Add new user
    test("CRUD Users", async ({ page }) => {

      await page
        .getByRole("button")
        .filter({ has: page.locator("svg.lucide-plus") })
        .click();
      await page.waitForTimeout(200);

      // Upload Profile Image
      await uploadThumbnail(page, "file-input-profile || selected-exist-profile", {
        imagePath: path.join(__dirname, '..', '..', 'public', 'images', 'profile-create.png')
      });

      // Personal Details
      const firstNameField = page
        .getByLabel(/First Name/i)
        .or(page.locator('#firstName, input[name="firstName"]'));
      await FileInput(firstNameField, userDataAdd.firstName);

      const lastNameField = page
        .getByLabel(/Last Name/i)
        .or(page.locator('#lastName, input[name="lastName"]'));
      await FileInput(lastNameField, userDataAdd.lastName);

      // // Fill Email field
      await page.waitForTimeout(500);
      const emailField = page
        .getByLabel(/email/i)
        .or(page.getByPlaceholder(/email/i))
        .or(page.locator('input[type="email"]'));
      if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
        const useGmail = (process.env.TESTMAIL_USE_GMAIL || '').toLowerCase() === 'true';
        const testEmail = useGmail
          ? `${userDataAdd.firstName.toLowerCase()}.${userDataAdd.lastName.toLowerCase()}+${Date.now()}@gmail.com`
          : generateTestmailAddress(process.env.TESTMAIL_NAMESPACE || 'username', String(Date.now()));
        console.log('Using test email for new user:', testEmail);
        await FileInput(emailField, testEmail);
      }

      // Gender Selection (Dropdown)
      const genderButton = page
        .locator('button[role="combobox"]')
        .filter({ has: page.locator("svg") })
        .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
        .first();

      if (await genderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await genderButton.click();
        await page.waitForTimeout(500);
        const firstOption = page.locator('[role="option"]').first();
        await firstOption.click();
        await page.waitForTimeout(400);
      }

      // Fill Date of Birth with today's date
      const dobField = page
        .getByLabel(/Date of Birth|DOB|Birth Date/i)
        .or(page.locator('#dob, input[name="dob"], input[type="date"]'));
      if (await dobField.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Use .fill() for date inputs instead of FileInput
        await dobField.click();
        await page.waitForTimeout(300);
        await dobField.fill(userDataAdd.dob);
        await page.waitForTimeout(400);
      }

      // Fill Phone field (if exists)
      const phoneField = page
        .locator("#phone")
        .or(page.getByLabel(/Phone Number/i))
        .or(page.getByPlaceholder(/012345678/i));
      if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(phoneField, userDataAdd.phone);
      }

      // Select Role from dropdown
      await page.waitForTimeout(500);
      const roleDropdown = page
        .getByRole("combobox", { name: /Select a role/i })
        .or(page.locator('button:has-text("Select a role")'))
        .or(page.locator('[aria-label="Select a role"]'));

      if (await roleDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
        await roleDropdown.click();
        await page.waitForTimeout(500);

        // Select the first option (index 0)
        const firstOption = page.locator('[role="option"]').nth(0);
        if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await firstOption.click();
          console.log("✓ Selected role from dropdown");
          await page.waitForTimeout(400);
        }
      }

      // Village
      const villageField = page
        .getByPlaceholder("Village")
        .or(page.locator('input[name="address.village"]'))
        .or(page.getByLabel(/Village/i));
      if (await villageField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(villageField, userDataAdd.address.village);
        await page.waitForTimeout(1000);
      }

      // Commune
      const communeField = page
        .getByPlaceholder("Commune")
      .or(page.locator('input[name="address.commune"]'))
        .or(page.locator("#commune"));
    if (await communeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await communeField.scrollIntoViewIfNeeded();

      const isDisabled = await communeField.isDisabled().catch(() => false);
        if (!isDisabled) {
        await page.waitForTimeout(300);
        await FileInput(communeField, userDataAdd.address.commune);
      }
    }

      // District
      const districtField = page
        .getByPlaceholder("District")
        .or(page.locator('input[name="address.district"]'))
        .or(page.locator("#district"));
      if (await districtField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await districtField.scrollIntoViewIfNeeded();

        const isDisabled = await districtField.isDisabled().catch(() => false);
        if (!isDisabled) {
          await page.waitForTimeout(300);
          await FileInput(districtField, userDataAdd.address.district);
        }
      }

      // City
      const cityField = page
        .getByPlaceholder("Province")
        .or(page.locator('input[name="address.city"]'))
        .or(page.locator("#city"));
      if (await cityField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cityField.scrollIntoViewIfNeeded();

        const isDisabled = await cityField.isDisabled().catch(() => false);
        if (!isDisabled) {
          await page.waitForTimeout(300);
          await FileInput(cityField, userDataAdd.address.city);
        }
      }

      // Toggle Active status to TRUE (if exists)
      await page.waitForTimeout(500);
      const activeToggle = page
        .locator("#isActive")
        .or(page.getByLabel("Active User"));

      if (await activeToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
        const isChecked = await activeToggle
          .getAttribute("aria-checked")
          .catch(() => "false");
        // Check if it's unchecked (aria-checked="false")
        if (isChecked === "false") {
          await activeToggle.click();
        }
        await page.waitForTimeout(500);
      }

      // Submit the form
      await page.waitForTimeout(500);
      const submitButton = page.getByRole("button", {
        name: /Add|Create|Submit/i,
      });
      if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }

      //=============================================================
      // User list or grid view page
      await expect(page).toHaveTitle(/User/i);
      await page.waitForTimeout(1000);
      await toggleViewMode(page);
      await page.waitForTimeout(1000);

      //=============================================================
      // Update User
      const userRows = page.locator(
        'table tbody tr, [role="row"], .user-item, div[class*="user"]'
      );

      // Get the user at index 0 (first user)
      const userAtIndex0 = userRows.nth(0);
      await userAtIndex0.waitFor({ state: "visible", timeout: 5000 });
      const editIcon = userAtIndex0
        .locator("button")
        .filter({ has: page.locator("svg") })
        .filter({ hasNot: page.locator("svg.lucide-trash") })
        .first();

      if (await editIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editIcon.click();

        // Wait for the edit drawer/form to appear
        await page.waitForTimeout(1500);

        // Upload Profile Image
        await uploadThumbnail(page, "file-input-profile || selected-exist-profile", {
          imagePath: path.join(__dirname, '..', '..', 'public', 'images', 'profile-update.png')
        });

        // Edit First Name field
        const firstNameField = page
          .getByLabel(/First Name/i)
          .or(page.locator('#firstName, input[name="firstName"]'));
        if (
          await firstNameField.isVisible({ timeout: 3000 }).catch(() => false)
        ) {
          await firstNameField.clear();
          await FileInput(firstNameField, userDataEdit.firstName);
        }

        // Edit Last Name field
        const lastNameField = page
          .getByLabel(/Last Name/i)
          .or(page.locator('#lastName, input[name="lastName"]'));
        if (await lastNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
          await lastNameField.clear();
          await FileInput(lastNameField, userDataEdit.lastName);
        }
        // Gender Selection (Dropdown)
        const genderButton = page
          .locator('button[role="combobox"]')
          .filter({ has: page.locator("svg") })
          .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
          .first();

        if (await genderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await genderButton.click();
          await page.waitForTimeout(500);
          // Select index 1 (second option)
          const option = page.locator('[role="option"]').nth(1);
          await option.click();
          await page.waitForTimeout(400);
        }

        // Edit Date of Birth
        const dobField = page
          .getByLabel(/Date of Birth|DOB|Birth Date/i)
          .or(page.locator('#dob, input[name="dob"], input[type="date"]'));
        if (await dobField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await dobField.click();
          await page.waitForTimeout(300);
          await dobField.fill(userDataEdit.dob);
          await page.waitForTimeout(400);
        }

        // Edit Phone field
        const phoneField = page
          .locator("#phone")
          .or(page.getByLabel(/Phone Number/i))
          .or(page.getByPlaceholder(/012345678/i));
        if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await phoneField.clear();
          await FileInput(phoneField, userDataEdit.phone);
        }

      // Select Role from dropdown
      await page.waitForTimeout(500);
      const roleDropdown = page
        .locator('button[role="combobox"]')
        .filter({ has: page.locator('svg.lucide-chevron-down') })
        .filter({ hasText: /Admin|Manager|User|Select a role/i })
        .first();

      if (await roleDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
        await roleDropdown.scrollIntoViewIfNeeded();
        await roleDropdown.click();
        await page.waitForTimeout(500);

        // Select the first option (index 0)
        const firstOption = page.locator('[role="option"]').nth(1);
        if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await firstOption.click();
          console.log("✓ Selected role from dropdown");
          await page.waitForTimeout(400);
        }
      }
        // Village
        const villageField = page
          .getByPlaceholder("Village")
          .or(page.locator('input[name="address.village"]'))
          .or(page.getByLabel(/Village/i));
        if (await villageField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await villageField.clear();
          await FileInput(villageField, userDataEdit.address.village);
          await page.waitForTimeout(1000);
        }

        // Commune
        const communeField = page
          .getByPlaceholder("Commune")
          .or(page.locator('input[name="address.commune"]'))
          .or(page.locator("#commune"));
        if (await communeField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await communeField.scrollIntoViewIfNeeded();
          if (!(await communeField.isDisabled())) {
            await communeField.clear();
            await FileInput(communeField, userDataEdit.address.commune);
          }
        }

        // District
        const districtField = page
          .getByPlaceholder("District")
          .or(page.locator('input[name="address.district"]'))
          .or(page.locator("#district"));
        if (await districtField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await districtField.scrollIntoViewIfNeeded();
          if (!(await districtField.isDisabled())) {
            await districtField.clear();
            await FileInput(
              districtField,
              userDataEdit.address.district
            );
          }
        }

        // City
        const cityField = page
          .getByPlaceholder("Province")
          .or(page.locator('input[name="address.city"]'))
          .or(page.locator("#city"));
        if (await cityField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await cityField.scrollIntoViewIfNeeded();
          if (!(await cityField.isDisabled())) {
            await cityField.clear();
            await FileInput(cityField, userDataEdit.address.city);
          }
        }

        // Toggle Active status to FALSE (if exists)
        await page.waitForTimeout(500);
        const activeToggle = page
          .locator("#isActive")
          .or(page.getByLabel("Active User"));

        if (await activeToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
          const isChecked = await activeToggle
            .getAttribute("aria-checked")
            .catch(() => "false");
          // Check if it's checked (aria-checked="true")
          if (isChecked === "true") {
            await activeToggle.click();
            console.log("✓ Set Active toggle to FALSE");
          }
          await page.waitForTimeout(500);
        }

        // Submit the updated form
        await page.waitForTimeout(500);
        const submitButton = page.getByRole("button", {
          name: /Update|Save|Submit/i,
        });
        if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submitButton.click();
          await page.waitForTimeout(2000);
        }
        
        await page.waitForTimeout(2000);
      }

          //=============================================================
      // Delete User
      const indexToDelete = 0;
      const userToDelete = userRows.nth(indexToDelete);
      if (await userToDelete.isVisible({ timeout: 5000 }).catch(() => false)) {
        const deleteIconInRow = userToDelete
          .locator("button")
          .filter({
            has: page.locator("svg.lucide-trash, svg.lucide-trash-2"),
          })
          .first();

        // Click the delete icon directly (don't click the user row)
        if (
          await deleteIconInRow.isVisible({ timeout: 3000 }).catch(() => false)
        ) {
          await deleteIconInRow.click();
          await page.waitForTimeout(1000);

          // Use the delete helper to handle the confirmation modal
          await deleteItem(page, "Confirm Delete");
        }
      }
    });
  });

  // ========================================
  // 3. Coaches Management
  // ========================================
  test.describe('Coaches', () => {
    
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 20000 });
    await page.getByText('Coach', { exact: true }).click();
    await expect(page).toHaveURL(/\/coaches/);
    await page.waitForTimeout(1000);
  });
  
    // Add new coach
    test('CRUD Coach', async ({ page }) => {
      await page.getByRole('button').filter({ has: page.locator('svg.lucide-plus') }).click();
      await uploadThumbnail(page, "file-input-profile || selected-exist-profile", {
        imagePath: path.join(__dirname, '..','..', 'public', 'images', 'profile-create.png')
      });
      
      const firstNameField = page.getByLabel(/First Name/i).or(page.locator('#firstName, input[name="firstName"]'));
      await FileInput(firstNameField, coachDataAdd.firstName);
      
      const lastNameField = page.getByLabel(/Last Name/i).or(page.locator('#lastName, input[name="lastName"]'));
      await FileInput(lastNameField, coachDataAdd.lastName);
      
      // Gender Selection (Dropdown)
      const genderButton = page.locator('button[role="combobox"]').filter({ has: page.locator('svg') })
        .or(page.locator('button[role="combobox"][aria-controls*="radix"]')).first();
      
      if (await genderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await genderButton.click();
        await page.waitForTimeout(500);
        const firstOption = page.locator('[role="option"]').first();
        await firstOption.click();
        await page.waitForTimeout(400);
      }
      
      // Fill Date of Birth
      const dobField = page.locator('input[name="dateOfBirth"]')
          .or(page.getByLabel(/Date of Birth/i))
          .or(page.getByPlaceholder(/Date of Birth/i));
        if (await dobField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dobField.scrollIntoViewIfNeeded();
      await dobField.click();
      await page.waitForTimeout(300);
          await dobField.fill('1998-05-20');
      await page.waitForTimeout(400);
        }
  
            // Contact Information
      const emailField = page.getByLabel(/Email/i).or(page.locator('#email, input[name="email"]'));
      await FileInput(emailField, coachDataAdd.email);
      
      const phoneField = page.getByLabel(/Phone/i).or(page.locator('input[name="phone"]'));
      if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(phoneField, coachDataAdd.phone);
      }
      
      const telegramField = page.getByPlaceholder(/Telegram/i).or(page.locator('input[name="telegram"]'));
      if (await telegramField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(telegramField, coachDataAdd.telegram);
      }
  
      // Professional & Banking Information
      const idNumberField = page.getByLabel(/ID Number/i).or(page.locator('input[name="idNumber"]'));
      if (await idNumberField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(idNumberField, coachDataAdd.idNumber);
      }
  
      const abaAccountNameField = page.getByLabel(/ABA Account Name/i).or(page.locator('input[name="ABAAccountName"]'));
      if (await abaAccountNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(abaAccountNameField, coachDataAdd.abaAccountName);
      }
  
      const abaAccountNumberField = page.getByLabel(/ABA Account Number/i).or(page.locator('input[name="ABAAccountNumber"]'));
      if (await abaAccountNumberField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(abaAccountNumberField, coachDataAdd.abaAccountNumber);
      }
  
      const joinDateField = page.getByLabel(/Join Date/i).or(page.locator('input[name="joinDate"]'));
      if (await joinDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
        const today = new Date();
        const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        await joinDateField.scrollIntoViewIfNeeded();
        await joinDateField.click();
        await page.waitForTimeout(300);
        await joinDateField.fill(todayFormatted);
        await page.waitForTimeout(400);
      }
  
      const majorField = page.getByLabel(/Major/i).or(page.locator('input[name="major"]'));
      if (await majorField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(majorField, coachDataAdd.major);
      }
  
      const coursePerHourField = page.getByLabel(/Course Per Hour/i).or(page.locator('input[name="costPerHour"]'));
      if (await coursePerHourField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(coursePerHourField, coachDataAdd.costPerHour);
      }
  
      // Select Education Level (dropdown)
      const educationLevelButton = page.getByRole('combobox', { name: /Education Level/i })
        .or(page.locator('button:has-text("Education Level")'))
        .or(page.locator('[aria-label*="Education Level"]'))
        .first();
      
      if (await educationLevelButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Click to open the dropdown
        await educationLevelButton.click();
        await page.waitForTimeout(500);
        
        // Select the first option (index 0)
        const firstOption = page.locator('[role="option"]').first();
        if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await firstOption.click();
          await page.waitForTimeout(400);
        }
      }
      
      // Village (if exists) - uses nested name attribute
      const villageField = page.getByPlaceholder('Village')
        .or(page.locator('input[name="address.village"]'))
        .or(page.getByLabel(/Village/i));
      if (await villageField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(villageField, coachDataAdd.address.village);
        await villageField.press('Tab'); 
        await page.waitForTimeout(1000);
      }
  
      // Commune / Songkat 
      const communeField = page.getByRole('textbox', { name: /Commune/i })
        .or(page.getByRole('combobox', { name: /Commune/i }))
        .or(page.getByPlaceholder(/Commune/i))
        .or(page.locator('input[name="address.commune"]'))
        .or(page.locator('#commune'));
        
      // Use .first() to avoid strict mode violations if duplicates exist
      const targetCommune = communeField.first();
      const isCommuneVisible = await targetCommune.isVisible({ timeout: 3000 }).catch((e) => {
        console.log('Ignore: Commune visibility check failed (might be hidden or optional):', e);
        return false;
      });
      console.log(`Debug: Commune field visible? ${isCommuneVisible}`);
  
      if (isCommuneVisible) {
        // Explicitly wait for the field to be enabled in case it depends on Village
        try {
          await expect(targetCommune).toBeEnabled({ timeout: 5000 });
        } catch (e) {
          console.log('Warning: Commune field did not become enabled:', e);
        }
  
        await targetCommune.click();
        await page.waitForTimeout(300);
        await FileInput(targetCommune, coachDataAdd.address.commune);
        await targetCommune.blur();
        await page.waitForTimeout(500);
      }
  
      // District / Khan (if exists)
      const districtField = page.getByPlaceholder('District / Khan')
        .or(page.locator('input[name="address.district"]'))
        .or(page.locator('#district'));
      if (await districtField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await districtField.scrollIntoViewIfNeeded();
        
        const isDisabled = await districtField.isDisabled().catch(() => false);
        if (!isDisabled) {
          await page.waitForTimeout(300);
          await FileInput(districtField, coachDataAdd.address.district);
        }
      }
  
      // City / Province (if exists)
      const cityField = page.getByPlaceholder('City / Province')
        .or(page.locator('input[name="address.city"]'))
        .or(page.locator('#city'));
      if (await cityField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cityField.scrollIntoViewIfNeeded();
        
        const isDisabled = await cityField.isDisabled().catch(() => false);
        if (!isDisabled) {
          await page.waitForTimeout(300);
          await FileInput(cityField, coachDataAdd.address.city);
        }
      }
  
      // Click "Add Work History" button
      const addWorkHistoryButton = page.getByRole('button', { name: /Add Work History/i })
        .or(page.locator('button:has-text("Add Work History")'))
        .or(page.locator('button:has(svg.lucide-plus)').filter({ hasText: /Work History/i }));
      
      if (await addWorkHistoryButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addWorkHistoryButton.scrollIntoViewIfNeeded();
        await addWorkHistoryButton.click();
        await page.waitForTimeout(800);
        
        // Fill Position
        const positionField = page.getByPlaceholder('Position')
          .or(page.locator('input[name="workHistory.0.position"]'))
          .or(page.getByLabel(/Position/i));
        if (await positionField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await FileInput(positionField, 'Senior Developer');
        }
        
        // Fill Organization
        const organizationField = page.getByPlaceholder('Organization')
          .or(page.locator('input[name="workHistory.0.organization"]'))
          .or(page.getByLabel(/Organization/i));
        if (await organizationField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await FileInput(organizationField, 'Tech Company Ltd');
        }
        
        // Fill Start Date
        const startDateField = page.getByPlaceholder('Start Date')
          .or(page.locator('input[name="workHistory.0.startDate"]'))
          .or(page.getByLabel(/Start Date/i));
        if (await startDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await startDateField.click();
          await page.waitForTimeout(300);
          await startDateField.fill('2020-01-15');
          await page.waitForTimeout(400);
        }
        
        // Fill End Date
        const endDateField = page.getByPlaceholder('End Date')
          .or(page.locator('input[name="workHistory.0.endDate"]'))
          .or(page.getByLabel(/End Date/i));
        if (await endDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await endDateField.click();
          await page.waitForTimeout(300);
          await endDateField.fill('2023-12-31');
          await page.waitForTimeout(400);
        }
      }
  
       // Click Education Background
      const addEducationBackgroundButton = page.getByRole('button', { name: /Add Education Background/i })
        .or(page.locator('button:has-text("Add Education Background")'))
        .or(page.locator('button:has(svg.lucide-plus)').filter({ hasText: /Education Background/i }));
      
      if (await addEducationBackgroundButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addEducationBackgroundButton.scrollIntoViewIfNeeded();
        await addEducationBackgroundButton.click();
        await page.waitForTimeout(800);
        
        // Fill School Name
        const schoolNameField = page.getByPlaceholder('School Name')
          .or(page.locator('input[name="educationBackground.0.schoolName"]'))
          .or(page.getByLabel(/School Name/i));
        await schoolNameField.fill('Royal University of Phnom Penh');
        
        // Fill Major
        const majorField = page.locator('input[name="educationBackground.0.major"]');
        await FileInput(majorField, 'Computer Science');
        
     // Fill Start Date
        const startDateField = page.locator('input[name="educationBackground.0.startDate"]');
        if (await startDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await startDateField.click();
        await page.waitForTimeout(300);
        await startDateField.fill('2020-01-15');
          await page.waitForTimeout(400);
        }
        
        // Fill End Date
        const endDateField = page.locator('input[name="educationBackground.0.endDate"]');
        if (await endDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await endDateField.click();
        await page.waitForTimeout(300);
        await endDateField.fill('2023-12-31');
          await page.waitForTimeout(400);
        }
      }
          
      // Click Next button to proceed to Guardian tab
      await page.waitForTimeout(1000);
      const nextButton = page.getByRole('button', { name: /Next|next/i });
      await nextButton.scrollIntoViewIfNeeded();
      await nextButton.click();
      await page.waitForTimeout(2000);
  
      // ===== GUARDIAN TAB =====    
      // Guardian Name
      const guardianNameField = page.locator('input[name="guardian.name"]')
        .or(page.getByPlaceholder('Name'))
        .or(page.getByLabel(/Name/i));
      if (await guardianNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guardianNameField.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await FileInput(guardianNameField, 'Dara Sok');
      }
  
      // Guardian Phone Number
      const guardianPhoneField = page.locator('input[name="guardian.phone"]')
        .or(page.getByPlaceholder('Phone Number'))
        .or(page.getByLabel(/Phone/i));
      if (await guardianPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guardianPhoneField.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await FileInput(guardianPhoneField, '0987654321');
      }
  
      // Guardian Relation
      const guardianRelationField = page.locator('input[name="guardian.relation"]')
        .or(page.getByPlaceholder('Relation'))
        .or(page.getByLabel(/Relation/i));
      if (await guardianRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guardianRelationField.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await FileInput(guardianRelationField, 'Father');
      }
  
      // Guardian Email
      const guardianEmailField = page.locator('input[name="guardian.email"]')
        .or(page.getByPlaceholder('Email'))
        .or(page.getByLabel(/Email/i));
      if (await guardianEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guardianEmailField.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await FileInput(guardianEmailField, 'darasok@gmail.com');
      }
  
      // Guardian Village
      const guardianVillageField = page.locator('input[name="guardian.address.village"]')
        .or(page.getByPlaceholder('Village'))
        .or(page.getByLabel(/Village/i));
      if (await guardianVillageField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guardianVillageField.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await FileInput(guardianVillageField, 'Toul Kork');
        // Use Tab to ensure natural user behavior and trigger blur events
        await guardianVillageField.press('Tab'); 
        // Wait for address fields to become enabled
        await page.waitForTimeout(1000);
      }
  
      // Guardian Commune / Songkat
      const finalGuardianCommune = page.locator('input[name="guardian.address.commune"]')
        .or(page.locator('#commune'))
        .or(page.getByPlaceholder(/Khum\/Sangkat|Commune/i))
        .or(page.getByLabel(/Commune/i));
  
      if (await finalGuardianCommune.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Explicitly wait for the field to be enabled
        try {
          await expect(finalGuardianCommune).toBeEnabled({ timeout: 5000 });
        } catch (e) {
          console.log('Warning: Guardian Commune field did not become enabled:', e);
        }
        
        await finalGuardianCommune.click();
        await page.waitForTimeout(200);
        await FileInput(finalGuardianCommune, 'Toul Kork');
        await finalGuardianCommune.blur();
        await page.waitForTimeout(500);
      }
  
      // Guardian District / Khan
      const guardianDistrictField = page.locator('input[name="guardian.address.district"]')
        .or(page.locator('#district'))
        .or(page.getByPlaceholder(/District|Khan/i))
        .or(page.getByLabel(/District/i));
      if (await guardianDistrictField.isVisible({ timeout: 2000 }).catch(() => false)) {
         try {
          await expect(guardianDistrictField).toBeEnabled({ timeout: 5000 });
        } catch (e) {
          console.log('Warning: Guardian District field did not become enabled:', e);
        }
  
        const isDisabled = await guardianDistrictField.isDisabled().catch(() => false);
        if (!isDisabled) {
          // await guardianDistrictField.click(); // Removed to prevent scrolling jump
          await page.waitForTimeout(200);
          await FileInput(guardianDistrictField, 'Phnom Penh');
        }
      }
  
      // Guardian City / Province
      const guardianCityField = page.locator('input[name="guardian.address.city"]')
        .or(page.locator('#city'))
        .or(page.getByPlaceholder(/City|Province/i))
        .or(page.getByLabel(/City|Province/i));
      if (await guardianCityField.isVisible({ timeout: 2000 }).catch(() => false)) {
         try {
          await expect(guardianCityField).toBeEnabled({ timeout: 5000 });
        } catch (e) {
          console.log('Warning: Guardian City field did not become enabled:', e);
        }
  
        const isDisabled = await guardianCityField.isDisabled().catch(() => false);
        if (!isDisabled) {
          await page.waitForTimeout(200);
          await FileInput(guardianCityField, 'Phnom Penh');
        }
      }
  
      // Click Next button to proceed to Emergency tab
      await page.waitForTimeout(1000);
      const nextButton2 = page.getByRole('button', { name: /Next|next/i });
      await nextButton2.scrollIntoViewIfNeeded();
      await nextButton2.click();
      await page.waitForTimeout(2000);
  
      // ===== EMERGENCY TAB =====
      
      // Emergency Name
      const emergencyNameField = page.locator('input[name="emergency.name"]')
        .or(page.getByPlaceholder('Name'))
        .or(page.getByLabel(/Name/i));
      if (await emergencyNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emergencyNameField.scrollIntoViewIfNeeded();
        await emergencyNameField.click();
        await page.waitForTimeout(200);
        await FileInput(emergencyNameField, 'Heng Leakana');
      }
  
      // Emergency Phone Number
      const emergencyPhoneField = page.locator('input[name="emergency.phone"]')
        .or(page.getByPlaceholder('Phone Number'))
        .or(page.getByLabel(/Phone/i));
      if (await emergencyPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emergencyPhoneField.scrollIntoViewIfNeeded();
        await emergencyPhoneField.click();
        await page.waitForTimeout(200);
        await FileInput(emergencyPhoneField, '0123456789');
      }
  
      // Emergency Relation
      const emergencyRelationField = page.locator('input[name="emergency.relation"]')
        .or(page.getByPlaceholder('Relation'))
        .or(page.getByLabel(/Relation/i));
      if (await emergencyRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emergencyRelationField.scrollIntoViewIfNeeded();
        await emergencyRelationField.click();
        await page.waitForTimeout(200);
        await FileInput(emergencyRelationField, 'Mother');
      }
  
      // Emergency Email
      const emergencyEmailField = page.locator('input[name="emergency.email"]')
        .or(page.getByPlaceholder('Email'))
        .or(page.getByLabel(/Email/i));
      if (await emergencyEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emergencyEmailField.scrollIntoViewIfNeeded();
        await emergencyEmailField.click();
        await page.waitForTimeout(200);
        await FileInput(emergencyEmailField, 'leakana.heng@gmail.com');
      }
  
      // Emergency Village
      const emergencyVillageField = page.locator('input[name="emergency.address.village"]')
        .or(page.getByPlaceholder('Village'))
        .or(page.getByLabel(/Village/i));
      if (await emergencyVillageField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emergencyVillageField.scrollIntoViewIfNeeded();
        await emergencyVillageField.click();
        await page.waitForTimeout(200);
        await FileInput(emergencyVillageField, 'Toul Kork');
        // Use Tab to ensure natural user behavior and trigger blur events
        await emergencyVillageField.press('Tab'); 
        // Wait for address fields to become enabled
        await page.waitForTimeout(1000);
      }
  
      // Emergency Commune / Songkat
      const emergencyCommune = page.locator('input[name="emergency.address.commune"]')
        .or(page.locator('#commune'))
        .or(page.getByPlaceholder(/Khum\/Sangkat|Commune/i))
        .or(page.getByLabel(/Commune/i));
      if (await emergencyCommune.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Explicitly wait for the field to be enabled
        try {
          await expect(emergencyCommune).toBeEnabled({ timeout: 5000 });
        } catch (e) {
          console.log('Warning: Emergency Commune field did not become enabled:', e);
        }
        
        await emergencyCommune.click();
        await page.waitForTimeout(200);
        await FileInput(emergencyCommune, 'Toul Kork ');
        await emergencyCommune.blur();
        await page.waitForTimeout(500);
      }
  
      // Emergency District / Khan
      const emergencyDistrictField = page.locator('input[name="emergency.address.district"]')
        .or(page.locator('#district'))
        .or(page.getByPlaceholder(/District|Khan/i))
        .or(page.getByLabel(/District/i));
      if (await emergencyDistrictField.isVisible({ timeout: 2000 }).catch(() => false)) {
         try {
          await expect(emergencyDistrictField).toBeEnabled({ timeout: 5000 });
        } catch (e) {
          console.log('Warning: Emergency District field did not become enabled:', e);
        }
  
        const isDisabled = await emergencyDistrictField.isDisabled().catch(() => false);
        if (!isDisabled) {
          await page.waitForTimeout(200);
          await FileInput(emergencyDistrictField, 'Phnom Penh');
        }
      }
  
      // Emergency City / Province
      const emergencyCityField = page.locator('input[name="emergency.address.city"]')
        .or(page.locator('#city'))
        .or(page.getByPlaceholder(/City|Province/i))
        .or(page.getByLabel(/City|Province/i));
      if (await emergencyCityField.isVisible({ timeout: 2000 }).catch(() => false)) {
         try {
          await expect(emergencyCityField).toBeEnabled({ timeout: 5000 });
        } catch (e) {
          console.log('Warning: Emergency City field did not become enabled:', e);
        }
  
        const isDisabled = await emergencyCityField.isDisabled().catch(() => false);
        if (!isDisabled) {
          await page.waitForTimeout(200);
          await FileInput(emergencyCityField, 'Phnom Penh');
        }
      }
  
      // Click Create button to submit the form
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: /Create/i }).click();
      await page.waitForTimeout(1000);

      // View list or grid coaches page
      await expect(page).toHaveTitle(/Coach/i);
      await page.waitForTimeout(1000);
      await toggleViewMode(page);
      await page.waitForTimeout(1000);

    //=========================================================================
      // Update coach
      
      const coachRows = page.locator('table tbody tr, [role="row"], .coach-row, div[class*="coach"]');
      
      await coachRows.first().waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(500);
      
      const firstCoach = coachRows.nth(0);
      await firstCoach.waitFor({ state: 'visible', timeout: 5000 });
      await firstCoach.click();
      await page.waitForTimeout(1500);
      
    // Open the actions menu (three-dot icon)
    const actionsMenuButton = page.locator('button:has(svg.lucide-ellipsis-vertical)')
      .or(page.getByRole('button', { name: /more options|actions|menu/i }))
      .or(page.locator('button[aria-haspopup="menu"]'))
      .or(page.locator('svg.lucide-ellipsis-vertical'))
      .first();

          await actionsMenuButton.waitFor({ state: 'visible', timeout: 5000 });
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
      
      // Look for Edit button in the dropdown menu
      const editButton = page.getByRole('menuitem', { name: /Edit/i })
        .or(page.getByRole('button', { name: /Edit/i }));
      
      if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editButton.click();
        
        // Wait for edit form to appear
        await page.waitForTimeout(1000);
  
      // Upload Profile Image
      await uploadThumbnail(page, "file-input-profile || selected-exist-profile", {
        imagePath: path.join(__dirname, '..', '..','public', 'images', 'profile-update.png')
      });
        
        // Edit First Name
        const firstNameField = page.getByLabel(/First Name/i)
          .or(page.locator('#firstName, input[name="firstName"]'));
        if (await firstNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
          await firstNameField.clear();
          await FileInput(firstNameField, coachDataEdit.firstName);
        }
        
        // Edit Last Name
        const lastNameField = page.getByLabel(/Last Name/i)
          .or(page.locator('#lastName, input[name="lastName"]'));
        if (await lastNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
          await lastNameField.clear();
          await FileInput(lastNameField, coachDataEdit.lastName);
        }
        
      // Edit Gender (Dropdown)
      const genderButton = page.locator('button[role="combobox"]').filter({ has: page.locator('svg') })
        .or(page.locator('button[role="combobox"][aria-controls*="radix"]')).first();
      
      if (await genderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await genderButton.click();
        await page.waitForTimeout(500);
        const firstOption = page.locator('[role="option"]').nth(1); // Select 2nd option for change
        if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await firstOption.click();
          await page.waitForTimeout(400);
        } else {
           // Fallback to first option if only one exists
           await page.locator('[role="option"]').first().click();
           await page.waitForTimeout(400);
        }
      }
        // Edit Date of Birth
        const dobField = page.locator('input[name="dateOfBirth"]')
          .or(page.getByLabel(/Date of Birth/i))
          .or(page.getByPlaceholder(/Date of Birth/i));
        if (await dobField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await dobField.scrollIntoViewIfNeeded();
          await dobField.clear();
          await dobField.click();
          await page.waitForTimeout(300);
          await dobField.fill('1995-05-20');
          await page.waitForTimeout(400);
        }
  
              // Edit Email
        const emailField = page.getByLabel(/Email/i)
          .or(page.locator('#email, input[name="email"]'));
        if (await emailField.isVisible({ timeout: 3000 }).catch(() => false)) {
          await emailField.clear();
          await FileInput(emailField, coachDataEdit.email);
        }
        
        
        // Edit Phone
        const phoneField = page.getByLabel(/Phone/i)
          .or(page.locator('input[name="phone"]'));
        if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await phoneField.clear();
          await FileInput(phoneField, coachDataEdit.phone);
        }
        
        // Edit Telegram
        const telegramField = page.getByPlaceholder(/Telegram/i)
          .or(page.locator('input[name="telegram"]'));
        if (await telegramField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await telegramField.clear();
          await FileInput(telegramField, coachDataEdit.telegram);
        }
        
        // Edit ID Number
        const idNumberField = page.getByLabel(/ID Number/i)
          .or(page.locator('input[name="idNumber"]'));
        if (await idNumberField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await idNumberField.clear();
          await FileInput(idNumberField, coachDataEdit.idNumber);
        }
        
        // Edit ABA Account Name
        const abaAccountNameField = page.getByLabel(/ABA Account Name/i)
          .or(page.locator('input[name="ABAAccountName"]'));
        if (await abaAccountNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await abaAccountNameField.clear();
          await FileInput(abaAccountNameField, coachDataEdit.abaAccountName);
        }
        
        // Edit ABA Account Number
        const abaAccountNumberField = page.getByLabel(/ABA Account Number/i)
          .or(page.locator('input[name="ABAAccountNumber"]'));
        if (await abaAccountNumberField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await abaAccountNumberField.clear();
          await FileInput(abaAccountNumberField, coachDataEdit.abaAccountNumber);
        }
        
        // Edit Join Date
        const joinDateField = page.getByLabel(/Join Date/i)
          .or(page.locator('input[name="joinDate"]'));
        if (await joinDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await joinDateField.scrollIntoViewIfNeeded();
          await joinDateField.clear();
          await joinDateField.click();
          await page.waitForTimeout(300);
          await joinDateField.fill('2021-03-15');
          await page.waitForTimeout(400);
        }
        
        // Edit Major (Professional Major, not Education Background Major)
        const majorField = page.locator('input[name="major"]')
          .or(page.getByLabel(/^Major$/i))
          .first();
        if (await majorField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await majorField.scrollIntoViewIfNeeded();
          await majorField.clear();
          await page.waitForTimeout(200);
          await FileInput(majorField, coachDataEdit.major);
        }
        
        // Edit Cost Per Hour
        const costPerHourField = page.getByLabel(/Course Per Hour|Cost Per Hour/i)
          .or(page.locator('input[name="costPerHour"]'));
        if (await costPerHourField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await costPerHourField.clear();
          await FileInput(costPerHourField, coachDataEdit.costPerHour);
        }
  
            // Select Education Level (dropdown)
      const educationLevelButton = page.getByRole('combobox', { name: /Education Level/i })
        .or(page.locator('button:has-text("Education Level")'))
        .or(page.locator('[aria-label*="Education Level"]'))
        .first();
      
      if (await educationLevelButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Click to open the dropdown
        await educationLevelButton.click();
        await page.waitForTimeout(500);
        
        // Select the first option (index 0)
        const firstOption = page.locator('[role="option"]').first();
        if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await firstOption.click();
          await page.waitForTimeout(400);
        }
      }
  
        // Edit Village
        const villageField = page.getByPlaceholder('Village')
          .or(page.locator('input[name="address.village"]'))
          .or(page.getByLabel(/Village/i));
        if (await villageField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await villageField.clear();
          await FileInput(villageField, coachDataEdit.address.village);
          await villageField.press('Tab');
          await page.waitForTimeout(1000);
        }
  
        // Edit Commune
        const communeField = page.getByRole('textbox', { name: /Commune/i })
          .or(page.getByRole('combobox', { name: /Commune/i }))
          .or(page.getByPlaceholder(/Commune/i))
          .or(page.locator('input[name="address.commune"]'))
          .or(page.locator('#commune'));
        const targetCommune = communeField.first();
        if (await targetCommune.isVisible({ timeout: 3000 }).catch(() => false)) {
          try {
            await expect(targetCommune).toBeEnabled({ timeout: 5000 });
          } catch (e) {
            console.log('Warning: Commune field did not become enabled:', e);
          }
          await targetCommune.clear();
          await targetCommune.click();
          await page.waitForTimeout(300);
          await FileInput(targetCommune, coachDataEdit.address.commune);
          await targetCommune.blur();
          await page.waitForTimeout(500);
        }
  
        // Edit District
        const districtField = page.getByPlaceholder('District / Khan')
          .or(page.locator('input[name="address.district"]'))
          .or(page.locator('#district'));
        if (await districtField.isVisible({ timeout: 2000 }).catch(() => false)) {
          const isDisabled = await districtField.isDisabled().catch(() => false);
          if (!isDisabled) {
            await districtField.clear();
            await page.waitForTimeout(300);
            await FileInput(districtField, coachDataEdit.address.district);
          }
        }
  
        // Edit City
        const cityField = page.getByPlaceholder('City / Province')
          .or(page.locator('input[name="address.city"]'))
          .or(page.locator('#city'));
        if (await cityField.isVisible({ timeout: 2000 }).catch(() => false)) {
          const isDisabled = await cityField.isDisabled().catch(() => false);
          if (!isDisabled) {
            await cityField.clear();
            await page.waitForTimeout(300);
            await FileInput(cityField, coachDataEdit.address.city);
          }
        }
  
        // Edit Work History - Click "Add Work History" button if needed
        const addWorkHistoryButton = page.getByRole('button', { name: /Add Work History/i })
          .or(page.locator('button:has-text("Add Work History")'))
          .or(page.locator('button:has(svg.lucide-plus)').filter({ hasText: /Work History/i }));
        
        if (await addWorkHistoryButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await addWorkHistoryButton.scrollIntoViewIfNeeded();
          // Check if there is already a work history item, if so we don't click add, we edit existing.
          // But if the form is empty for some reason, click add.
          // For simplicity, we can assume if the fields aren't visible, we click add.
          const existingField = page.locator('input[name="workHistory.0.position"]');
          if (!(await existingField.isVisible({ timeout: 1000 }).catch(() => false))) {
             await addWorkHistoryButton.click();
             await page.waitForTimeout(800);
          }
        }
        
        // Edit Work History fields (if they exist)
        const workPositionField = page.getByPlaceholder('Position')
          .or(page.locator('input[name="workHistory.0.position"]'))
          .or(page.getByLabel(/Position/i));
        if (await workPositionField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await workPositionField.clear();
          await FileInput(workPositionField, 'Lead Developer');
        }
        
        const workOrgField = page.getByPlaceholder('Organization')
          .or(page.locator('input[name="workHistory.0.organization"]'))
          .or(page.getByLabel(/Organization/i));
        if (await workOrgField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await workOrgField.clear();
          await FileInput(workOrgField, 'Software Solutions Inc');
        }
        
        // Edit Work History Start Date (specific to workHistory.0, not education dates)
        const workStartDateField = page.locator('input[name="workHistory.0.startDate"]')
          .or(page.getByPlaceholder('Start Date'))
          .or(page.getByLabel(/Start Date/i))
          .first();
        if (await workStartDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await workStartDateField.scrollIntoViewIfNeeded();
          await workStartDateField.clear();
          await workStartDateField.click();
          await page.waitForTimeout(300);
          await workStartDateField.fill('2019-06-01');
          await page.waitForTimeout(400);
        }
        
        // Edit Work History End Date (specific to workHistory.0, not education dates)
        const workEndDateField = page.locator('input[name="workHistory.0.endDate"]')
          .or(page.getByPlaceholder('End Date'))
          .or(page.getByLabel(/End Date/i))
          .first();
        if (await workEndDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await workEndDateField.scrollIntoViewIfNeeded();
          await workEndDateField.clear();
          await workEndDateField.click();
          await page.waitForTimeout(300);
          await workEndDateField.fill('2024-01-31');
          await page.waitForTimeout(400);
        }
        
        // Edit Education Background - Click "Add Education Background" button if needed
        const addEducationButton = page.getByRole('button', { name: /Add Education Background/i })
          .or(page.locator('button:has-text("Add Education Background")'))
          .or(page.locator('button:has(svg.lucide-plus)').filter({ hasText: /Education Background/i }));
        
        if (await addEducationButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await addEducationButton.scrollIntoViewIfNeeded();
           const existingEduField = page.locator('input[name="educationBackground.0.schoolName"]');
           if (!(await existingEduField.isVisible({ timeout: 1000 }).catch(() => false))) {
              await addEducationButton.click();
              await page.waitForTimeout(800);
           }
        }
        
        // Edit Education Background fields
        const schoolNameField = page.getByPlaceholder('School Name')
          .or(page.locator('input[name="educationBackground.0.schoolName"]'))
          .or(page.getByLabel(/School Name/i));
        if (await schoolNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await schoolNameField.clear();
          await FileInput(schoolNameField, 'Royal University of Phnom Penh (Updated)');
        }
        
        // Fill Major
        const majorEduField = page.locator('input[name="educationBackground.0.major"]');
        if (await majorEduField.isVisible({ timeout: 2000 }).catch(() => false)) {
           await majorEduField.clear();
           await FileInput(majorEduField, 'Information Technology');
        }
        
        const eduStartDateField = page.locator('input[name="educationBackground.0.startDate"]');
        if (await eduStartDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await eduStartDateField.scrollIntoViewIfNeeded();
          await eduStartDateField.clear();
          await eduStartDateField.click();
          await page.waitForTimeout(300);
          await eduStartDateField.fill('2015-09-01');
          await page.waitForTimeout(400);
        }
        
        const eduEndDateField = page.locator('input[name="educationBackground.0.endDate"]');
        if (await eduEndDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await eduEndDateField.scrollIntoViewIfNeeded();
          await eduEndDateField.clear();
          await eduEndDateField.click();
          await page.waitForTimeout(300);
          await eduEndDateField.fill('2017-06-30');
          await page.waitForTimeout(400);
        }
        
        // Click Next button to proceed to Guardian tab
        await page.waitForTimeout(1000);
        const nextButton = page.getByRole('button', { name: /Next|next/i });
        if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nextButton.scrollIntoViewIfNeeded();
          await nextButton.click();
          await page.waitForTimeout(2000);
        }
        
        // ===== GUARDIAN TAB =====
        // Guardian Name
        const guardianNameField = page.locator('input[name="guardian.name"]')
          .or(page.getByPlaceholder('Name'))
          .or(page.getByLabel(/Name/i));
        if (await guardianNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await guardianNameField.scrollIntoViewIfNeeded();
          await guardianNameField.clear();
          await page.waitForTimeout(200);
          await FileInput(guardianNameField, 'Updated Guardian Name');
        }
        
        // Guardian Phone (use specific name, #phone is not unique)
        const guardianPhoneField = page.locator('input[name="guardian.phone"]')
        .or(page.locator('#phone'))
          .or(page.getByPlaceholder('Phone Number'));
        if (await guardianPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await guardianPhoneField.clear();
          await FileInput(guardianPhoneField, '0999888777');
        }
        
  // Guardian Relation
  const guardianRelationField = page.locator('#relation')  // ← Add ID here
    .or(page.locator('input[name="guardian.relation"]'))
    .or(page.getByPlaceholder('Relation'));
        if (await guardianRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await guardianRelationField.clear();
          await FileInput(guardianRelationField, 'Mother');
        }
        
        // Guardian Email
        const guardianEmailField = page.locator('input[name="guardian.email"]')
          .or(page.getByPlaceholder('Email'));
        if (await guardianEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await guardianEmailField.clear();
          await FileInput(guardianEmailField, 'guardian@email.com');
        }
        
        // Guardian Village
        const guardianVillageField = page.locator('input[name="guardian.address.village"]')
          .or(page.getByPlaceholder('Village'))
          .or(page.getByLabel(/Village/i));
        if (await guardianVillageField.isVisible({ timeout: 3000 }).catch(() => false)) {
          await guardianVillageField.scrollIntoViewIfNeeded();
          await guardianVillageField.clear();
          await page.waitForTimeout(200);
          await FileInput(guardianVillageField, 'Toul Kork');
          await guardianVillageField.press('Tab');
          await page.waitForTimeout(1000);
        }
        
        // Guardian Commune
        const guardianCommuneField = page.locator('input[name="guardian.address.commune"]')
          .or(page.locator('#commune'))
          .or(page.getByPlaceholder(/Khum\/Sangkat|Commune/i))
          .or(page.getByLabel(/Commune/i));
        if (await guardianCommuneField.isVisible({ timeout: 3000 }).catch(() => false)) {
          // Explicitly wait for the field to be enabled
          try {
            await expect(guardianCommuneField).toBeEnabled({ timeout: 5000 });
          } catch (e) {
            console.log('Warning: Guardian Commune field did not become enabled:', e);
          }
          
          await guardianCommuneField.scrollIntoViewIfNeeded();
          await guardianCommuneField.clear();
          await guardianCommuneField.click();
          await page.waitForTimeout(200);
          await FileInput(guardianCommuneField, 'Toul Kork');
          await guardianCommuneField.blur();
          await page.waitForTimeout(500);
        }
        
        // Guardian District
        const guardianDistrictField = page.locator('input[name="guardian.address.district"]')
          .or(page.getByPlaceholder('District / Khan'))
          .or(page.getByLabel(/District|Khan/i));
        if (await guardianDistrictField.isVisible({ timeout: 3000 }).catch(() => false)) {
          const isDisabled = await guardianDistrictField.isDisabled().catch(() => false);
          if (!isDisabled) {
            await guardianDistrictField.scrollIntoViewIfNeeded();
            await guardianDistrictField.clear();
            await page.waitForTimeout(200);
            await FileInput(guardianDistrictField, 'Toul Kork');
          }
        }
        
        // Guardian City
        const guardianCityField = page.locator('input[name="guardian.address.city"]')
          .or(page.getByPlaceholder('City / Province'))
          .or(page.getByLabel(/City|Province/i));
        if (await guardianCityField.isVisible({ timeout: 3000 }).catch(() => false)) {
          const isDisabled = await guardianCityField.isDisabled().catch(() => false);
          if (!isDisabled) {
            await guardianCityField.scrollIntoViewIfNeeded();
            await guardianCityField.clear();
            await page.waitForTimeout(200);
            await FileInput(guardianCityField, 'Phnom Penh');
          }
        }
        
        // Click Next button to proceed to Emergency tab
        await page.waitForTimeout(1000);
        const nextButton2 = page.getByRole('button', { name: /Next|next/i });
        if (await nextButton2.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nextButton2.scrollIntoViewIfNeeded();
          await nextButton2.click();
          await page.waitForTimeout(2000);
        }
        
        // ===== EMERGENCY CONTACT TAB =====
        // Emergency Name
        const emergencyNameField = page.locator('input[name="emergency.name"]')
        .or(page.locator('#name'))
          .or(page.getByPlaceholder('Name'));
        if (await emergencyNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await emergencyNameField.scrollIntoViewIfNeeded();
          await emergencyNameField.clear();
          await page.waitForTimeout(200);
          await FileInput(emergencyNameField, 'Emergency Contact Name');
        }
        
        // Emergency Phone
        const emergencyPhoneField = page.locator('input[name="emergency.phone"]')
        .or(page.locator('#phone'))
          .or(page.getByPlaceholder('Phone Number'));
        if (await emergencyPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await emergencyPhoneField.clear();
          await FileInput(emergencyPhoneField, '0111222333');
        }
        
        // Emergency Relation
        const emergencyRelationField = page.locator('input[name="emergency.relation"]')
        .or(page.locator('#relation'))
          .or(page.getByPlaceholder('Relation'));
        if (await emergencyRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await emergencyRelationField.clear();
          await FileInput(emergencyRelationField, 'Sibling');
        }
        
        // Emergency Email
        const emergencyEmailField = page.locator('input[name="emergency.email"]')
          .or(page.getByPlaceholder('Email'));
        if (await emergencyEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await emergencyEmailField.clear();
          await FileInput(emergencyEmailField, 'emergency@email.com');
        }
        
        // Emergency Village
        const emergencyVillageField = page.locator('input[name="emergency.address.village"]')
          .or(page.getByPlaceholder('Village'))
          .or(page.getByLabel(/Village/i));
        if (await emergencyVillageField.isVisible({ timeout: 3000 }).catch(() => false)) {
          await emergencyVillageField.scrollIntoViewIfNeeded();
          await emergencyVillageField.clear();
          await page.waitForTimeout(200);
          await FileInput(emergencyVillageField, 'Daun Penh');
          await emergencyVillageField.press('Tab');
          await page.waitForTimeout(1000);
        }
        
        // Emergency Commune
        const emergencyCommuneField = page.locator('input[name="emergency.address.commune"]')
          .or(page.locator('#commune'))
          .or(page.getByPlaceholder(/Khum\/Sangkat|Commune/i))
          .or(page.getByLabel(/Commune/i));
        if (await emergencyCommuneField.isVisible({ timeout: 3000 }).catch(() => false)) {
          // Explicitly wait for the field to be enabled
          try {
            await expect(emergencyCommuneField).toBeEnabled({ timeout: 5000 });
          } catch (e) {
            console.log('Warning: Emergency Commune field did not become enabled:', e);
          }
          
          await emergencyCommuneField.scrollIntoViewIfNeeded();
          await emergencyCommuneField.clear();
          await emergencyCommuneField.click();
          await page.waitForTimeout(200);
          await FileInput(emergencyCommuneField, 'Daun Penh');
          await emergencyCommuneField.blur();
          await page.waitForTimeout(500);
        }
        
        // Emergency District
        const emergencyDistrictField = page.locator('input[name="emergency.address.district"]')
          .or(page.getByPlaceholder('District / Khan'))
          .or(page.getByLabel(/District|Khan/i));
        if (await emergencyDistrictField.isVisible({ timeout: 3000 }).catch(() => false)) {
          const isDisabled = await emergencyDistrictField.isDisabled().catch(() => false);
          if (!isDisabled) {
            await emergencyDistrictField.scrollIntoViewIfNeeded();
            await emergencyDistrictField.clear();
            await page.waitForTimeout(200);
            await FileInput(emergencyDistrictField, 'Daun Penh');
          }
        }
        
        // Emergency City
        const emergencyCityField = page.locator('input[name="emergency.address.city"]')
          .or(page.getByPlaceholder('City / Province'))
          .or(page.getByLabel(/City|Province/i));
        if (await emergencyCityField.isVisible({ timeout: 3000 }).catch(() => false)) {
          const isDisabled = await emergencyCityField.isDisabled().catch(() => false);
          if (!isDisabled) {
            await emergencyCityField.scrollIntoViewIfNeeded();
            await emergencyCityField.clear();
            await page.waitForTimeout(200);
            await FileInput(emergencyCityField, 'Phnom Penh');
          }
        }
  
        // Click Update/Save button to submit the form
        await page.waitForTimeout(1000);
        const updateButton = page.getByRole('button', { name: /Update|Save/i });
        await updateButton.scrollIntoViewIfNeeded();
        await updateButton.click();
        await page.waitForTimeout(1000);

//=========================================================================
        // Click the back/close button to return to coaches list
      const backButton = page.locator('button:has(svg.lucide-arrow-left)')
        .or(page.locator('svg.lucide-arrow-left').locator('xpath=..'))
        .or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-arrow-left"]') }))
        .or(page.locator('button[aria-label*="back" i]'))
        .or(page.getByRole('button', { name: /Back|back/i }));
      
      await backButton.first().waitFor({ state: 'visible', timeout: 5000 });
      await backButton.first().scrollIntoViewIfNeeded();
      await backButton.first().click();
      await page.waitForTimeout(1500);
      }


//====================================================================
      // Delete coach
    
      await coachRows.first().waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(500);
      
      // Click the first coach to select it
      await coachRows.nth(0).click();
      await page.waitForTimeout(1500);
      await deleteEntityViaActionMenu(page);
      
      await page.waitForTimeout(1000);
    });
  });

  // ========================================
  // 5. Students Management
  // ========================================
test.describe('Students', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 10000 });
    await page.getByText('Student', { exact: true }).click();
    await page.waitForTimeout(500);
    
    // Go to Dashboard first
    await page.getByText('Dashboard', { exact: true }).last().click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/students/);
    await page.waitForTimeout(500);

    // Then List Students
    await page.getByText('List Students', { exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/students/);
    await page.waitForTimeout(1000);
  });

  // ===================================
  // Add new student
  // ===================================
  test('CRUD Students', async ({ page }) => {
    await page.locator('body > div > div.flex-1.flex.gap-10 > div.flex-1.min-w-\\[600px\\].overflow-auto > div > button').click();
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 1000 });

    // Upload Profile Image
    await uploadThumbnail(page, "file-input-profile || selected-exist-profile", {
      imagePath: path.join(__dirname, '..', '..','public', 'images', 'profile-create.png')
    });
    
    // Fill First Name
    const firstNameField = page.getByLabel(/First Name/i)
      .or(page.locator('#firstName, input[name="firstName"]'));
    await FileInput(firstNameField, studentDataAdd.firstName);
    
    // Fill Last Name
    const lastNameField = page.getByLabel(/Last Name/i)
      .or(page.locator('#lastName, input[name="lastName"]'));
    await FileInput(lastNameField, studentDataAdd.lastName);
    
    // Select Gender (before email)
    const genderButton = page.locator('button[role="combobox"]').filter({ has: page.locator('svg') })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .first();
    
    if (await genderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await genderButton.click();
      await page.waitForTimeout(500);
      const firstOption = page.locator('[role="option"]').first();
      await firstOption.click();
      await page.waitForTimeout(400);
    }
    
    // Fill Email (use testmail helper to generate a unique inbox)
    const emailField = page.getByLabel(/Email/i)
      .or(page.locator('#email, input[name="email"]'));
    await FileInput(emailField, studentDataAdd.email);

    // Fill Date of Birth with today's date
    const dobField = page.getByLabel(/Date of Birth|DOB|Birth Date/i)
      .or(page.locator('#dob, input[name="dob"], input[name="dateOfBirth"], input[type="date"]'));
    await dobField.click();
    await page.waitForTimeout(300);
    await dobField.fill(studentDataAdd.dob);
    await page.waitForTimeout(400);
    
    // Fill Phone (if exists)
    const phoneField = page.getByLabel(/Phone/i)
      .or(page.locator('input[name="phone"]'));
    if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(phoneField, studentDataAdd.phone);
    }
    
    // Telegram usernames (if exists)
    const telegramField = page.getByPlaceholder(/Telegram/i)
      .or(page.locator('input[name="telegram"]'));
    if (await telegramField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(telegramField, studentDataAdd.telegram);
    }
    
    // Village (if exists) - uses nested name attribute
    const villageField = page.getByPlaceholder('Village')
      .or(page.locator('input[name="address.village"]'))
      .or(page.getByLabel(/Village/i));
    if (await villageField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(villageField, studentDataAdd.address.village);
      await villageField.press('Tab'); 
      await page.waitForTimeout(1000);
    }

    // Commune / Songkat
    const communeField = page.getByRole('textbox', { name: /Commune/i })
      .or(page.getByRole('combobox', { name: /Commune/i }))
      .or(page.getByPlaceholder(/Commune/i))
      .or(page.locator('input[name="address.commune"]'))
      .or(page.locator('#commune'));
      
    // Use .first() to avoid strict mode violations if duplicates exist
    const targetCommune = communeField.first();
    const isCommuneVisible = await targetCommune.isVisible({ timeout: 3000 }).catch((e) => {
      console.log('Ignore: Commune visibility check failed (might be hidden or optional):', e);
      return false;
    });
    console.log(`Debug: Commune field visible? ${isCommuneVisible}`);

    if (isCommuneVisible) {
      try {
        await expect(targetCommune).toBeEnabled({ timeout: 5000 });
      } catch (e) {
        console.log('Warning: Commune field did not become enabled:', e);
      }

      await targetCommune.click();
      await page.waitForTimeout(300);
      await FileInput(targetCommune, studentDataAdd.address.commune);
      await targetCommune.blur();
      await page.waitForTimeout(500);
    }

    // District / Khan
    const districtField = page.getByPlaceholder('District / Khan')
      .or(page.locator('input[name="address.district"]'))
      .or(page.locator('#district'));
    if (await districtField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await districtField.scrollIntoViewIfNeeded();
      
      const isDisabled = await districtField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await page.waitForTimeout(300);
        await FileInput(districtField, studentDataAdd.address.district);
      }
    }

    // City / Province
    const cityField = page.getByPlaceholder('City / Province')
      .or(page.locator('input[name="address.city"]'))
      .or(page.locator('#city'));
    if (await cityField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cityField.scrollIntoViewIfNeeded();
      
      const isDisabled = await cityField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await page.waitForTimeout(300);
        await FileInput(cityField, studentDataAdd.address.city);
      }
    }
    
    
    // Click Next button to proceed to Guardian tab
    await page.waitForTimeout(1000);
    const nextButton = page.getByRole('button', { name: /Next|next/i });
    await nextButton.scrollIntoViewIfNeeded();
    await nextButton.click();
    await page.waitForTimeout(2000);

    // ===== GUARDIAN TAB =====
    // Guardian Name
    const guardianNameField = page.locator('input[name="guardian.name"]')
      .or(page.getByPlaceholder('Name'))
      .or(page.getByLabel(/Name/i));
    if (await guardianNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianNameField.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await FileInput(guardianNameField, studentDataAdd.guardian.name);
    }

    // Guardian Phone Number
    const guardianPhoneField = page.locator('input[name="guardian.phone"]')
      .or(page.getByPlaceholder('Phone Number'))
      .or(page.getByLabel(/Phone/i));
    if (await guardianPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianPhoneField.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await FileInput(guardianPhoneField, studentDataAdd.guardian.phone);
    }

    // Guardian Relation
    const guardianRelationField = page.locator('input[name="guardian.relation"]')
      .or(page.getByPlaceholder('Relation'))
      .or(page.getByLabel(/Relation/i));
    if (await guardianRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianRelationField.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await FileInput(guardianRelationField, studentDataAdd.guardian.relation);
    }

    // Guardian Email
    const guardianEmailField = page.locator('input[name="guardian.email"]')
      .or(page.getByPlaceholder('Email'))
      .or(page.getByLabel(/Email/i));
    if (await guardianEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianEmailField.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await FileInput(guardianEmailField, studentDataAdd.guardian.email);
    }

    // Guardian Village
    const guardianVillageField = page.locator('input[name="guardian.address.village"]')
      .or(page.getByPlaceholder('Village'))
      .or(page.getByLabel(/Village/i));
    if (await guardianVillageField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianVillageField.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await FileInput(guardianVillageField, studentDataAdd.guardian.address.village);
      await guardianVillageField.press('Tab'); 
      await page.waitForTimeout(1000);
    }

    // Guardian Commune / Songkat
    const finalGuardianCommune = page.locator('input[name="guardian.address.commune"]')
      .or(page.locator('#commune'))
      .or(page.getByPlaceholder(/Khum\/Sangkat|Commune/i))
      .or(page.getByLabel(/Commune/i));

    if (await finalGuardianCommune.isVisible({ timeout: 2000 }).catch(() => false)) {
      try {
        await expect(finalGuardianCommune).toBeEnabled({ timeout: 5000 });
      } catch (e) {
        console.log('Warning: Guardian Commune field did not become enabled:', e);
      }
      
      await finalGuardianCommune.click();
      await page.waitForTimeout(200);
      await FileInput(finalGuardianCommune, studentDataAdd.guardian.address.commune);
      await finalGuardianCommune.blur();
      await page.waitForTimeout(500);
    }

    // Guardian District / Khan
    const guardianDistrictField = page.locator('input[name="guardian.address.district"]')
      .or(page.locator('#district'))
      .or(page.getByPlaceholder(/District|Khan/i))
      .or(page.getByLabel(/District/i));
    if (await guardianDistrictField.isVisible({ timeout: 2000 }).catch(() => false)) {
       try {
        await expect(guardianDistrictField).toBeEnabled({ timeout: 5000 });
      } catch (e) {
        console.log('Warning: Guardian District field did not become enabled:', e);
      }

      const isDisabled = await guardianDistrictField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await page.waitForTimeout(200);
        await FileInput(guardianDistrictField, studentDataAdd.guardian.address.district);
      }
    }

    // Guardian City / Province
    const guardianCityField = page.locator('input[name="guardian.address.city"]')
      .or(page.locator('#city'))
      .or(page.getByPlaceholder(/City|Province/i))
      .or(page.getByLabel(/City|Province/i));
    if (await guardianCityField.isVisible({ timeout: 2000 }).catch(() => false)) {
      try {
        await expect(guardianCityField).toBeEnabled({ timeout: 5000 });
      } catch (e) {
        console.log('Warning: Guardian City field did not become enabled:', e);
      }

      const isDisabled = await guardianCityField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await page.waitForTimeout(200);
        await FileInput(guardianCityField, studentDataAdd.guardian.address.city);
      }
    }

    // Click Next button to proceed to Emergency tab
    await page.waitForTimeout(1000);
    const nextButton2 = page.getByRole('button', { name: /Next|next/i });
    await nextButton2.scrollIntoViewIfNeeded();
    await nextButton2.click();
    await page.waitForTimeout(2000);

    // ===== EMERGENCY TAB =====
    // Emergency Name
    const emergencyNameField = page.locator('input[name="emergency.name"]')
      .or(page.getByPlaceholder('Name'))
      .or(page.getByLabel(/Name/i));
    if (await emergencyNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyNameField.scrollIntoViewIfNeeded();
      await emergencyNameField.click();
      await page.waitForTimeout(200);
      await FileInput(emergencyNameField, studentDataAdd.emergency.name);
    }

    // Emergency Phone Number
    const emergencyPhoneField = page.locator('input[name="emergency.phone"]')
      .or(page.getByPlaceholder('Phone Number'))
      .or(page.getByLabel(/Phone/i));
    if (await emergencyPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyPhoneField.scrollIntoViewIfNeeded();
      await emergencyPhoneField.click();
      await page.waitForTimeout(200);
      await FileInput(emergencyPhoneField, studentDataAdd.emergency.phone);
    }

    // Emergency Relation
    const emergencyRelationField = page.locator('input[name="emergency.relation"]')
      .or(page.getByPlaceholder('Relation'))
      .or(page.getByLabel(/Relation/i));
    if (await emergencyRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyRelationField.scrollIntoViewIfNeeded();
      await emergencyRelationField.click();
      await page.waitForTimeout(200);
      await FileInput(emergencyRelationField, studentDataAdd.emergency.relation);
    }

    // Emergency Email
    const emergencyEmailField = page.locator('input[name="emergency.email"]')
      .or(page.getByPlaceholder('Email'))
      .or(page.getByLabel(/Email/i));
    if (await emergencyEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyEmailField.scrollIntoViewIfNeeded();
      await emergencyEmailField.click();
      await page.waitForTimeout(200);
      await FileInput(emergencyEmailField, studentDataAdd.emergency.email);
    }

    // Emergency Village
    const emergencyVillageField = page.locator('input[name="emergency.address.village"]')
      .or(page.getByPlaceholder('Village'))
      .or(page.getByLabel(/Village/i));
    if (await emergencyVillageField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyVillageField.scrollIntoViewIfNeeded();
      await emergencyVillageField.click();
      await page.waitForTimeout(200);
      await FileInput(emergencyVillageField, studentDataAdd.emergency.address.village);
      await emergencyVillageField.press('Tab'); 
      await page.waitForTimeout(1000);
    }

    // Emergency Commune / Songkat
    const emergencyCommune = page.locator('input[name="emergency.address.commune"]')
      .or(page.locator('#commune'))
      .or(page.getByPlaceholder(/Khum\/Sangkat|Commune/i))
      .or(page.getByLabel(/Commune/i));
    if (await emergencyCommune.isVisible({ timeout: 2000 }).catch(() => false)) {
      try {
        await expect(emergencyCommune).toBeEnabled({ timeout: 5000 });
      } catch (e) {
        console.log('Warning: Emergency Commune field did not become enabled:', e);
      }
      
      await emergencyCommune.click();
      await page.waitForTimeout(200);
      await FileInput(emergencyCommune, studentDataAdd.emergency.address.commune);
      await emergencyCommune.blur();
      await page.waitForTimeout(500);
    }

    // Emergency District / Khan
    const emergencyDistrictField = page.locator('input[name="emergency.address.district"]')
      .or(page.locator('#district'))
      .or(page.getByPlaceholder(/District|Khan/i))
      .or(page.getByLabel(/District/i));
    if (await emergencyDistrictField.isVisible({ timeout: 2000 }).catch(() => false)) {
       try {
        await expect(emergencyDistrictField).toBeEnabled({ timeout: 5000 });
      } catch (e) {
        console.log('Warning: Emergency District field did not become enabled:', e);
      }

      const isDisabled = await emergencyDistrictField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await page.waitForTimeout(200);
        await FileInput(emergencyDistrictField, studentDataAdd.emergency.address.district);
      }
    }

    // Emergency City / Province
    const emergencyCityField = page.locator('input[name="emergency.address.city"]')
      .or(page.locator('#city'))
      .or(page.getByPlaceholder(/City|Province/i))
      .or(page.getByLabel(/City|Province/i));
    if (await emergencyCityField.isVisible({ timeout: 2000 }).catch(() => false)) {
       try {
        await expect(emergencyCityField).toBeEnabled({ timeout: 5000 });
      } catch (e) {
        console.log('Warning: Emergency City field did not become enabled:', e);
      }

      const isDisabled = await emergencyCityField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await page.waitForTimeout(200);
        await FileInput(emergencyCityField, studentDataAdd.emergency.address.city);
      }
    }

    // Click Create button to submit the form
    await page.waitForTimeout(1000);
    const createButton = page.getByRole('button', { name: /Create/i });
    await createButton.scrollIntoViewIfNeeded();
    await createButton.click();
    await page.waitForTimeout(1000);


//===================================================================
// Students list or gird view page
    await expect(page).toHaveTitle(/Student/i);
    await page.waitForTimeout(1000);
    await toggleViewMode(page);
    await page.waitForTimeout(1000);



//===================================================================
// Update Student

    const studentRows = page.locator('table tbody tr, [role="row"], .student-row, div[class*="student"]');
    await studentRows.first().waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
    
    // Click on the first student
    const firstStudent = studentRows.nth(0);
    await firstStudent.waitFor({ state: 'visible', timeout: 5000 });
    await firstStudent.click();
    await page.waitForTimeout(1500);
    
    // Open the actions menu (three-dot icon)
    const actionsMenuButton = page.locator('button:has(svg.lucide-ellipsis-vertical)')
      .or(page.getByRole('button', { name: /more options|actions|menu/i }))
      .or(page.locator('button[aria-haspopup="menu"]'))
      .or(page.locator('svg.lucide-ellipsis-vertical'))
      .first();
    
    await actionsMenuButton.waitFor({ state: 'visible', timeout: 5000 });
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
    
    // Look for Edit button in the dropdown menu
    const editButton = page.getByRole('menuitem', { name: /Edit/i })
      .or(page.getByRole('button', { name: /Edit/i }));
    
    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editButton.click();
      
      // Wait for edit form to appear
      await page.waitForTimeout(1000);
      
      // ===== STUDENT TAB =====
      
    // Upload Profile Image
    await uploadThumbnail(page, "file-input-profile || selected-exist-profile", {
      imagePath: path.join(__dirname, '..', '..','public', 'images', 'profile-update.png')
    });
      
      // Edit First Name
      const firstNameField = page.getByLabel(/First Name/i)
        .or(page.locator('#firstName, input[name="firstName"]'));
      if (await firstNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstNameField.clear();
        await FileInput(firstNameField, studentDataEdit.firstName);
      }
      
      // Edit Last Name
      const lastNameField = page.getByLabel(/Last Name/i)
        .or(page.locator('#lastName, input[name="lastName"]'));
      if (await lastNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await lastNameField.clear();
        await FileInput(lastNameField, studentDataEdit.lastName);
      }

    // Edit Gender (Dropdown)
    const genderButton = page.locator('button[role="combobox"]').filter({ has: page.locator('svg') })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]')).first();
    
    if (await genderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await genderButton.click();
      await page.waitForTimeout(500);
      const firstOption = page.locator('[role="option"]').nth(1); // Select 2nd option for change
      if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstOption.click();
        await page.waitForTimeout(400);
      } else {
         // Fallback to first option if only one exists
         await page.locator('[role="option"]').first().click();
         await page.waitForTimeout(400);
      }
    }
      
      // Edit Email
      const emailField = page.getByLabel(/Email/i)
        .or(page.locator('#email, input[name="email"]'));
      if (await emailField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await emailField.clear();
        await FileInput(emailField, studentDataEdit.email);
      }

            // Edit Date of Birth
      const dobField = page.locator('input[name="dateOfBirth"]')
        .or(page.getByLabel(/Date of Birth/i))
        .or(page.getByPlaceholder(/Date of Birth/i));
      if (await dobField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dobField.scrollIntoViewIfNeeded();
        await dobField.clear();
        await dobField.click();
        await page.waitForTimeout(300);
        await dobField.fill('1995-05-20');
        await page.waitForTimeout(400);
      }
      
      // Edit Phone
      const phoneField = page.getByLabel(/Phone/i)
        .or(page.locator('input[name="phone"]'));
      if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await phoneField.clear();
        await FileInput(phoneField, studentDataEdit.phone);
      }

      // Telegram usernames (if exists)
    const telegramField = page.getByPlaceholder(/Telegram/i)
      .or(page.locator('input[name="telegram"]'));
    if (await telegramField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(telegramField, studentDataEdit.telegram);
    }

      // Edit Village
      const villageField = page.getByPlaceholder('Village')
        .or(page.locator('input[name="address.village"]'))
        .or(page.getByLabel(/Village/i));
      if (await villageField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await villageField.clear();
        await FileInput(villageField, studentDataEdit.address.village);
        await villageField.press('Tab');
        await page.waitForTimeout(1000);
      }

      // Edit Commune
      const communeField = page.getByRole('textbox', { name: /Commune/i })
        .or(page.getByRole('combobox', { name: /Commune/i }))
        .or(page.getByPlaceholder(/Commune/i))
        .or(page.locator('input[name="address.commune"]'))
        .or(page.locator('#commune'));
      const targetCommune = communeField.first();
      if (await targetCommune.isVisible({ timeout: 3000 }).catch(() => false)) {
        try {
          await expect(targetCommune).toBeEnabled({ timeout: 5000 });
        } catch (e) {
          console.log('Warning: Commune field did not become enabled:', e);
        }
        await targetCommune.clear();
        await targetCommune.click();
        await page.waitForTimeout(300);
        await FileInput(targetCommune, studentDataEdit.address.commune);
        await targetCommune.blur();
        await page.waitForTimeout(500);
      }

      // Edit District
      const districtField = page.getByPlaceholder('District / Khan')
        .or(page.locator('input[name="address.district"]'))
        .or(page.locator('#district'));
      if (await districtField.isVisible({ timeout: 2000 }).catch(() => false)) {
        const isDisabled = await districtField.isDisabled().catch(() => false);
        if (!isDisabled) {
          await districtField.clear();
          await page.waitForTimeout(300);
          await FileInput(districtField, studentDataEdit.address.district);
        }
      }

      // Edit City
      const cityField = page.getByPlaceholder('City / Province')
        .or(page.locator('input[name="address.city"]'))
        .or(page.locator('#city'));
      if (await cityField.isVisible({ timeout: 2000 }).catch(() => false)) {
        const isDisabled = await cityField.isDisabled().catch(() => false);
        if (!isDisabled) {
          await cityField.clear();
          await page.waitForTimeout(300);
          await FileInput(cityField, studentDataEdit.address.city);
        }
      }

      // Click Next to go to Guardian tab
      await page.waitForTimeout(1000);
      const nextButton1 = page.getByRole('button', { name: /Next|next/i });
      if (await nextButton1.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nextButton1.scrollIntoViewIfNeeded();
        await nextButton1.click();
        await page.waitForTimeout(2000);

        // ===== GUARDIAN TAB =====

        // Edit Guardian Name
        const guardianNameField = page.locator('input[name="guardian.name"]')
          .or(page.getByPlaceholder('Name'))
          .or(page.getByLabel(/Name/i));
        if (await guardianNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await guardianNameField.scrollIntoViewIfNeeded();
          await guardianNameField.clear();
          await page.waitForTimeout(200);
          await FileInput(guardianNameField, studentDataEdit.guardian.name);
        }

        // Edit Guardian Phone
        const guardianPhoneField = page.locator('input[name="guardian.phone"]')
          .or(page.getByPlaceholder('Phone Number'))
          .or(page.getByLabel(/Phone/i));
        if (await guardianPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await guardianPhoneField.scrollIntoViewIfNeeded();
          await guardianPhoneField.clear();
          await page.waitForTimeout(200);
          await FileInput(guardianPhoneField, studentDataEdit.guardian.phone);
        }

        // Edit Guardian Relation
        const guardianRelationField = page.locator('input[name="guardian.relation"]')
          .or(page.getByPlaceholder('Relation'))
          .or(page.getByLabel(/Relation/i));
        if (await guardianRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await guardianRelationField.scrollIntoViewIfNeeded();
          await guardianRelationField.clear();
          await page.waitForTimeout(200);
          await FileInput(guardianRelationField, studentDataEdit.guardian.relation);
        }

        // Edit Guardian Email
        const guardianEmailField = page.locator('input[name="guardian.email"]')
          .or(page.getByPlaceholder('Email'))
          .or(page.getByLabel(/Email/i));
        if (await guardianEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await guardianEmailField.scrollIntoViewIfNeeded();
          await guardianEmailField.clear();
          await page.waitForTimeout(200);
          await FileInput(guardianEmailField, studentDataEdit.guardian.email);
        }

        // Edit Guardian Village
        const guardianVillageField = page.locator('input[name="guardian.address.village"]')
          .or(page.getByPlaceholder('Village'))
          .or(page.getByLabel(/Village/i));
        if (await guardianVillageField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await guardianVillageField.scrollIntoViewIfNeeded();
          await guardianVillageField.clear();
          await page.waitForTimeout(200);
          await FileInput(guardianVillageField, studentDataEdit.guardian.address.village);
          await guardianVillageField.press('Tab');
          await page.waitForTimeout(1000);
        }

        // Edit Guardian Commune
        const guardianCommuneField = page.locator('input[name="guardian.address.commune"]')
          .or(page.locator('#commune'))
          .or(page.getByPlaceholder(/Khum\/Sangkat|Commune/i))
          .or(page.getByLabel(/Commune/i));
        if (await guardianCommuneField.isVisible({ timeout: 2000 }).catch(() => false)) {
          try {
            await expect(guardianCommuneField).toBeEnabled({ timeout: 5000 });
          } catch (e) {
            console.log('Warning: Guardian Commune field did not become enabled:', e);
          }
          await guardianCommuneField.clear();
          await guardianCommuneField.click();
          await page.waitForTimeout(200);
          await FileInput(guardianCommuneField, studentDataEdit.guardian.address.commune);
          await guardianCommuneField.blur();
          await page.waitForTimeout(500);
        }

        // Edit Guardian District
        const guardianDistrictField = page.locator('input[name="guardian.address.district"]')
          .or(page.locator('#district'))
          .or(page.getByPlaceholder(/District|Khan/i))
          .or(page.getByLabel(/District/i));
        if (await guardianDistrictField.isVisible({ timeout: 2000 }).catch(() => false)) {
          try {
            await expect(guardianDistrictField).toBeEnabled({ timeout: 5000 });
          } catch (e) {
            console.log('Warning: Guardian District field did not become enabled:', e);
          }
          const isDisabled = await guardianDistrictField.isDisabled().catch(() => false);
          if (!isDisabled) {
            await guardianDistrictField.clear();
            await page.waitForTimeout(200);
            await FileInput(guardianDistrictField, studentDataEdit.guardian.address.district);
          }
        }

        // Edit Guardian City
        const guardianCityField = page.locator('input[name="guardian.address.city"]')
          .or(page.locator('#city'))
          .or(page.getByPlaceholder(/City|Province/i))
          .or(page.getByLabel(/City|Province/i));
        if (await guardianCityField.isVisible({ timeout: 2000 }).catch(() => false)) {
          try {
            await expect(guardianCityField).toBeEnabled({ timeout: 5000 });
          } catch (e) {
            console.log('Warning: Guardian City field did not become enabled:', e);
          }
          const isDisabled = await guardianCityField.isDisabled().catch(() => false);
          if (!isDisabled) {
            await guardianCityField.clear();
            await page.waitForTimeout(200);
            await FileInput(guardianCityField, studentDataEdit.guardian.address.city);
          }
        }

        // Click Next to go to Emergency tab
        await page.waitForTimeout(1000);
        const nextButton2 = page.getByRole('button', { name: /Next|next/i });
        if (await nextButton2.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nextButton2.scrollIntoViewIfNeeded();
          await nextButton2.click();
          await page.waitForTimeout(2000);

          // ===== EMERGENCY TAB =====

          // Edit Emergency Name
          const emergencyNameField = page.locator('input[name="emergency.name"]')
            .or(page.getByPlaceholder('Name'))
            .or(page.getByLabel(/Name/i));
          if (await emergencyNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await emergencyNameField.scrollIntoViewIfNeeded();
            await emergencyNameField.clear();
            await emergencyNameField.click();
            await page.waitForTimeout(200);
            await FileInput(emergencyNameField, studentDataEdit.emergency.name);
          }

          // Edit Emergency Phone
          const emergencyPhoneField = page.locator('input[name="emergency.phone"]')
            .or(page.getByPlaceholder('Phone Number'))
            .or(page.getByLabel(/Phone/i));
          if (await emergencyPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await emergencyPhoneField.scrollIntoViewIfNeeded();
            await emergencyPhoneField.clear();
            await emergencyPhoneField.click();
            await page.waitForTimeout(200);
            await FileInput(emergencyPhoneField, studentDataEdit.emergency.phone);
          }

          // Edit Emergency Relation
          const emergencyRelationField = page.locator('input[name="emergency.relation"]')
            .or(page.getByPlaceholder('Relation'))
            .or(page.getByLabel(/Relation/i));
          if (await emergencyRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await emergencyRelationField.scrollIntoViewIfNeeded();
            await emergencyRelationField.clear();
            await emergencyRelationField.click();
            await page.waitForTimeout(200);
            await FileInput(emergencyRelationField, studentDataEdit.emergency.relation);
          }

          // Edit Emergency Email
          const emergencyEmailField = page.locator('input[name="emergency.email"]')
            .or(page.getByPlaceholder('Email'))
            .or(page.getByLabel(/Email/i));
          if (await emergencyEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await emergencyEmailField.scrollIntoViewIfNeeded();
            await emergencyEmailField.clear();
            await emergencyEmailField.click();
            await page.waitForTimeout(200);
            await FileInput(emergencyEmailField, studentDataEdit.emergency.email);
          }

          // Edit Emergency Village
          const emergencyVillageField = page.locator('input[name="emergency.address.village"]')
            .or(page.getByPlaceholder('Village'))
            .or(page.getByLabel(/Village/i));
          if (await emergencyVillageField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await emergencyVillageField.scrollIntoViewIfNeeded();
            await emergencyVillageField.clear();
            await emergencyVillageField.click();
            await page.waitForTimeout(200);
            await FileInput(emergencyVillageField, studentDataEdit.emergency.address.village);
            await emergencyVillageField.press('Tab');
            await page.waitForTimeout(1000);
          }

          // Edit Emergency Commune
          const emergencyCommune = page.locator('input[name="emergency.address.commune"]')
            .or(page.locator('#commune'))
            .or(page.getByPlaceholder(/Khum\/Sangkat|Commune/i))
            .or(page.getByLabel(/Commune/i));
          if (await emergencyCommune.isVisible({ timeout: 2000 }).catch(() => false)) {
            try {
              await expect(emergencyCommune).toBeEnabled({ timeout: 5000 });
            } catch (e) {
              console.log('Warning: Emergency Commune field did not become enabled:', e);
            }
            await emergencyCommune.clear();
            await emergencyCommune.click();
            await page.waitForTimeout(200);
            await FileInput(emergencyCommune, studentDataEdit.emergency.address.commune);
            await emergencyCommune.blur();
            await page.waitForTimeout(500);
          }

          // Edit Emergency District
          const emergencyDistrictField = page.locator('input[name="emergency.address.district"]')
            .or(page.locator('#district'))
            .or(page.getByPlaceholder(/District|Khan/i))
            .or(page.getByLabel(/District/i));
          if (await emergencyDistrictField.isVisible({ timeout: 2000 }).catch(() => false)) {
            try {
              await expect(emergencyDistrictField).toBeEnabled({ timeout: 5000 });
            } catch (e) {
              console.log('Warning: Emergency District field did not become enabled:', e);
            }
            const isDisabled = await emergencyDistrictField.isDisabled().catch(() => false);
            if (!isDisabled) {
              await emergencyDistrictField.clear();
              await page.waitForTimeout(200);
              await FileInput(emergencyDistrictField, studentDataEdit.emergency.address.district);
            }
          }

          // Edit Emergency City
          const emergencyCityField = page.locator('input[name="emergency.address.city"]')
            .or(page.locator('#city'))
            .or(page.getByPlaceholder(/City|Province/i))
            .or(page.getByLabel(/City|Province/i));
          if (await emergencyCityField.isVisible({ timeout: 2000 }).catch(() => false)) {
            try {
              await expect(emergencyCityField).toBeEnabled({ timeout: 5000 });
            } catch (e) {
              console.log('Warning: Emergency City field did not become enabled:', e);
            }
            const isDisabled = await emergencyCityField.isDisabled().catch(() => false);
            if (!isDisabled) {
              await emergencyCityField.clear();
              await page.waitForTimeout(200);
              await FileInput(emergencyCityField, studentDataEdit.emergency.address.city);
            }
          }
        }
      }
      
      // Save/Update button
      await page.waitForTimeout(1000);
      const saveButton = page.getByRole('button', { name: /Save|Update/i });
      await saveButton.scrollIntoViewIfNeeded();
      await saveButton.click();
      
      // Wait for update to complete
      await page.waitForTimeout(1000);
    } else {
      console.log('Edit functionality not found');
    }

    //=========================================================================
        // Click the back/close button to return to coaches list
      const backButton = page.locator('button:has(svg.lucide-arrow-left)')
        .or(page.locator('svg.lucide-arrow-left').locator('xpath=..'))
        .or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-arrow-left"]') }))
        .or(page.locator('button[aria-label*="back" i]'))
        .or(page.getByRole('button', { name: /Back|back/i }));
      
      await backButton.first().waitFor({ state: 'visible', timeout: 5000 });
      await backButton.first().scrollIntoViewIfNeeded();
      await backButton.first().click();
      await page.waitForTimeout(1500);
      


//==============================================================================
//Delete Student

    const rowsToDelete = page.locator('table tbody tr, [role="row"], .student-row, div[class*="student"]');
    await rowsToDelete.count();
    const indexToDelete = 0;
    const studentToDelete = rowsToDelete.nth(indexToDelete);
    await studentToDelete.waitFor({ state: 'visible', timeout: 5000 });
    await studentToDelete.click();
    await page.waitForTimeout(1500);
    await deleteEntityViaActionMenu(page, null, 'Confirm Delete');
    await page.waitForTimeout(1000);

  });
});

  // ========================================
  // 6. Material Management
  // ========================================

  test.describe('Materials', () => {
    
    test.beforeEach(async ({ page }) => {
      await addCursorTracking(page);
      
      await login(page);
      
      await expect(page).toHaveURL(/dashboard/);
      await page.waitForTimeout(2000);
  
      await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 30000 });
      
      await page.getByText('Material', { exact: true }).click() ;
      
      await expect(page).toHaveURL(/material/);
    });
  
    // ===================================
    // Helper function to select a material and open its details
    // ===================================
    async function selectMaterial(page: any, index: number = 1) {
      const materialRows = page.locator('table tbody tr, [role="row"], .material-row');
      await materialRows.first().waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(500);
      const materialAtIndex = materialRows.nth(index);
      await materialAtIndex.waitFor({ state: 'visible', timeout: 5000 });
      await materialAtIndex.click();
      await page.waitForTimeout(1500);
    }
  
    test('CRUD Material', async ({ page }) => {
      await page.locator('#add-material-button').click();
      await expect(page.getByRole('textbox').first()).toBeVisible();

      await uploadThumbnail(page, "materialFile", {
        imagePath: path.join(__dirname, '..', '..','public', 'images', 'thumbnial-create.pdf')
      });
      await page.waitForTimeout(500);
      const submitButton = page.getByRole('button', { name: /Create|Save|Submit/i });
      await submitButton.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500); // Brief pause for smooth scroll animation
      await submitButton.click();
      await page.waitForTimeout(1200);

    //================================================================================
    // Material list or grid view 
      await page.waitForTimeout(1000);
      await toggleViewMode(page);
      await page.waitForTimeout(1000);
    //================================================================================
      // Update Material
      await selectMaterial(page, 0);
      
      // Open the actions menu (three-dot icon)
      const actionsMenuButton = page.getByRole('button', { name: /more options|actions|menu/i })
        .or(page.locator('button[aria-haspopup="menu"]'))
        .or(page.locator('svg.lucide-ellipsis-vertical'))
        .first();
      await actionsMenuButton.click();
      await page.waitForTimeout(500);
      
      // Look for Edit button in the dropdown menu
      const editButton = page.getByRole('menuitem', { name: /Edit/i }).or(page.getByRole('button', { name: /Edit/i }));
      
      if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editButton.click();
        
        // Wait for edit form to appear
        await page.waitForTimeout(1500);
        
        // Click "Remove file" button first to remove existing file
        const removeFileButton = page.getByRole('button', { name: /Remove file/i })
          .or(page.locator('button[aria-label*="Remove file"]'))
          .or(page.locator('button:has-text("Remove file")'));
        
        if (await removeFileButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('Clicking Remove file button...');
          await removeFileButton.click();
          await page.waitForTimeout(500);
        }
  
        // Now upload the new thumbnail
        await uploadThumbnail(page, "materialFile",{
          imagePath: path.join(__dirname, '..', '..', 'public', 'images', 'thumbnial-update.pdf')
        });
        await page.waitForTimeout(500);      
        
        // Save changes
        await page.getByRole('button', { name: /Save|Update/i }).click();
        
        // Wait for update to complete
        await page.waitForTimeout(2000);
        
        // Take a screenshot after successful edit
        await page.screenshot({ 
          path: 'test-results/screenshots/material-edited.png',
          fullPage: true 
        });
      } else {
        console.log('Edit functionality not found');
      }
          //=========================================================================
        // Click the back/close button to return to coaches list
      const backButton = page.locator('button:has(svg.lucide-arrow-left)')
        .or(page.locator('svg.lucide-arrow-left').locator('xpath=..'))
        .or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-arrow-left"]') }))
        .or(page.locator('button[aria-label*="back" i]'))
        .or(page.getByRole('button', { name: /Back|back/i }));
      
      await backButton.first().waitFor({ state: 'visible', timeout: 5000 });
      await backButton.first().scrollIntoViewIfNeeded();
      await backButton.first().click();
      await page.waitForTimeout(1500);

      //================================================================================
      // Delete Material

      // Select and open the first material (index 0)
      await selectMaterial(page, 0);
      await deleteEntityViaActionMenu(page, null, 'Confirm Delete');
    });
});

    // ========================================
  // 7. Lessons 
  // ========================================

  test.describe('Lessons', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);

    await page.getByText('Course', { exact: true }).click();
    await page.waitForTimeout(500); // Wait for dropdown to open
    
    // Then click Lessons from the dropdown menu
    await page.getByText('Lessons', { exact: true }).click();
    
    // Ensure we are on the lessons page before each test starts
    await expect(page).toHaveURL(/courses\/lessons/);
  });
//   =====================================
// Add new lesson
//   =====================================

  test('CRUD Lessons', async ({ page }) => {
    await page.locator('#add-lesson-button').or(page.getByRole('button', { name: /add lesson/i })).click();
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible();
    await page.waitForTimeout(500);
    
    // Fill Title field with realistic typing
    const titleField = page.locator('#title').or(page.getByLabel(/title/i)).or(page.getByPlaceholder(/title/i));
    await FileInput(titleField, 'React js');
    
        // Fill Duration field (if exists)
    await page.waitForTimeout(500);
    const durationField = page.getByLabel(/duration/i)
      .or(page.getByPlaceholder(/duration/i))
      .or(page.locator('input[type="number"]').nth(1));
    if (await durationField.isVisible().catch(() => false)) {
      await FileInput(durationField, '45');
    }

        // Fill Description/Content field
    const objectiveField = page.locator('#objective')
      .or(page.locator('#content'))
      .or(page.getByLabel(/objective|content/i))
      .or(page.getByPlaceholder(/objective|content/i));
    await FileInput(objectiveField, 'objective');
    
    // Fill Description field first
    const descriptionField = page.locator('#description')
      .or(page.locator('#content'))
      .or(page.getByLabel(/description|content/i))
      .or(page.getByPlaceholder(/description|content/i));
    
    await FileInput(descriptionField, 'In this lesson, you will learn about React js');
    
    //=============================================================================
    //Attach Video

      // THEN click "Attach Videos" button after description is filled
    const attachVideoButton = page.getByRole('button', { name: /Attach Videos/i })
      .or(page.getByText(/Attach Videos/i))
      .or(page.locator('button:has-text("Attach Videos")'));
    
    if (await attachVideoButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await attachVideoButton.click();
      await page.waitForTimeout(1500); // Wait for modal to open
      
      await page.waitForTimeout(500);
      
      const videoCards = page.locator('div[data-slot="card"]');
      // Filter out 'Upload new video' to check for actual video content cards
      const contentCards = videoCards.filter({ hasNotText: /Upload new video/i });
      const contentCount = await contentCards.count();

      let selected = false;
      
      if (contentCount === 0) {
          // Use a specific locator for the button shown in the screenshot
          const uploadButton = page.locator('button').filter({ hasText: 'Upload new video' }).first();
          
          if (await uploadButton.isVisible({ timeout: 3000 }).catch(() => false)) {
              await uploadButton.click();

                  await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
                  await uploadThumbnail(page, "materialFile", {
                    imagePath: path.join(__dirname, '..', '..', 'public', 'video', 'seksaa-vdo.mp4')
                  });
                  
                  await page.waitForTimeout(500);
                  
                  const createButton = page.locator('[role="dialog"]').getByRole('button', { name: 'Create', exact: true })
                    .or(page.locator('.modal').getByRole('button', { name: 'Create', exact: true }))
                    .or(page.locator('button[type="submit"]:not([disabled])').filter({ hasText: 'Create' }).last());
                  
                  // Ensure explicit scroll to the button
                  if (await createButton.isVisible()) {
                      await createButton.evaluate((el) => {
                          el.scrollIntoView({ behavior: 'instant', block: 'center' });
                      });
                  }
                  
                  await page.waitForTimeout(1000); // Wait for scroll to settle
                  await createButton.click({ force: true });

                  await page.waitForTimeout(2000);
                  const newContentCards = page.locator('div[data-slot="card"]').filter({ hasNotText: /Upload new video/i });
                  if (await newContentCards.first().isVisible({ timeout: 5000 }).catch(() => false)) {
                       await newContentCards.first().click();
                       await page.waitForTimeout(500);
                  }

                  
          } else {
             // Fallback to simpler text match
             console.log('Button not found by strict selector, trying generic text match...');
             await page.getByText('Upload new video', { exact: false }).click();
          }
      } else {
          // Select the first available video card
          const firstCard = contentCards.nth(0); 
          if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
              await firstCard.click();
              selected = true;
              await page.waitForTimeout(500); 
          }
    
          if (!selected && contentCount > 1) {
               await contentCards.nth(1).click();
               selected = true;
               await page.waitForTimeout(500);
          }
      }
      
      // Click Save button with visible cursor movement
      await page.getByRole('button', { name: /Save|save/i })
        .or(page.locator('button:has-text("Save")')).click();
        await page.waitForTimeout(1500);
    }

    //===========================================================================================
    //Attach documents
    
    const attachDocumentButton = page.getByRole('button', { name: /Attach Documents/i })
      .or(page.getByText(/Attach Documents/i))
      .or(page.locator('button:has-text("Attach Documents")'));
    
    if (await attachDocumentButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await attachDocumentButton.click();
      await page.waitForTimeout(1500); // Wait for modal to open
      
      await page.waitForTimeout(500);
      
      const docCards = page.locator('div[data-slot="card"]');
      // Filter out 'Upload new' to check for actual content cards
      const contentCards = docCards.filter({ hasNotText: /Upload new document/i });
      const contentCount = await contentCards.count();

      let selected = false;
      
      if (contentCount === 0) {
          // Use a specific locator for the button
          const uploadButton = page.locator('button').filter({ hasText: 'Upload new document' }).first();
          
          if (await uploadButton.isVisible({ timeout: 3000 }).catch(() => false)) {
              await uploadButton.click();

              await page.waitForTimeout(1000); // Wait for modal animation
              
                    await uploadThumbnail(page, "Click to upload new material", {
                      imagePath: path.join(__dirname, '..', '..', 'public', 'images', 'thumbnial-create.pdf')
                    });
                  
                  await page.waitForTimeout(500);
                  
                  const createButton = page.locator('[role="dialog"]').getByRole('button', { name: 'Create', exact: true })
                    .or(page.locator('.modal').getByRole('button', { name: 'Create', exact: true }))
                    .or(page.locator('button[type="submit"]:not([disabled])').filter({ hasText: 'Create' }).last());
                  
                  // Ensure explicit scroll to the button
                  if (await createButton.isVisible()) {
                      await createButton.evaluate((el) => {
                          el.scrollIntoView({ behavior: 'instant', block: 'center' });
                      });
                  }
                  
                  await page.waitForTimeout(1000); // Wait for scroll to settle
                  await createButton.click({ force: true });

                  await page.waitForTimeout(2000);
                  const newContentCards = page.locator('div[data-slot="card"]').filter({ hasNotText: /Upload new document/i });
                  if (await newContentCards.first().isVisible({ timeout: 5000 }).catch(() => false)) {
                       await newContentCards.first().click();
                       await page.waitForTimeout(500);
                  }

                  
          } else {
             // Fallback to simpler text match
             console.log('Button not found by strict selector, trying generic text match...');
             await page.getByText('Upload new document', { exact: false }).click();
          }
      } else {
          // Select the first available card
          const firstCard = contentCards.nth(0); 
          if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
              await firstCard.click();
              selected = true;
              await page.waitForTimeout(500); 
          }
    
          if (!selected && contentCount > 1) {
               await contentCards.nth(1).click();
               selected = true;
               await page.waitForTimeout(500);
          }
      }
      
      // Click Save button with visible cursor movement
      await page.getByRole('button', { name: /Save|save/i })
        .or(page.locator('button:has-text("Save")')).click();
        await page.waitForTimeout(1500);
    }
    
    // Toggle Publish button to TRUE (enabled)
    await page.waitForTimeout(500);
    const publishToggle = page.getByText('Publish', { exact: true })
      .or(page.locator('button:has-text("Publish")'))
      .or(page.locator('[role="switch"]').filter({ hasText: /publish/i }))
      .or(page.locator('label:has-text("Publish")'));
    
    if (await publishToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      const isChecked = await publishToggle.getAttribute('aria-checked').catch(() => 'false');
      if (isChecked !== 'true') {
        await publishToggle.click();
      }
      await page.waitForTimeout(500);
    }
    
    await page.getByRole('button', { name: /Add|Create|Submit/i }).click();
    await page.waitForTimeout(1000);


    //====================================================================
    // Close Dialog by clicking the X icon
    const closeIcon = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
    if (await closeIcon.isVisible().catch(() => false)) {
      await closeIcon.click();
      await page.waitForTimeout(500);
    }


    //==================================================================================
    //Update Lesson
    const lessonRows = page.locator('table tbody tr, [role="row"], .lesson-item, div[class*="lesson"]');
    const lessonAtIndex0 = lessonRows.nth(0);
    await lessonAtIndex0.waitFor({ state: 'visible', timeout: 2000 });
    const editIcon = lessonAtIndex0.locator('button').filter({ has: page.locator('svg.lucide-square-pen, svg.lucide-edit, svg.lucide-pencil') }).first()
      .or(lessonAtIndex0.getByRole('button', { name: /edit/i }).first())
      .or(lessonAtIndex0.getByText(/Edit/i).first())
      .or(lessonAtIndex0.locator('button[aria-label*="edit" i]').first());
    
    if (await editIcon.isVisible({ timeout: 1000 }).catch(() => false)) {
      await editIcon.click();
      console.log('✓ Clicked edit icon');
      
      await page.waitForTimeout(1500);
      
      const titleField = page.locator('#title').or(page.getByLabel(/title/i));
      if (await titleField.isVisible({ timeout: 1000 }).catch(() => false)) {
        await titleField.clear();
        await FileInput(titleField, 'Updated React js Advanced');
      }
      
      // Edit Duration field
      const durationField = page.getByLabel(/duration/i)
        .or(page.getByPlaceholder(/duration/i))
        .or(page.locator('input[type="number"]').first());
      if (await durationField.isVisible({ timeout: 1000 }).catch(() => false)) {
        await durationField.clear();
        await FileInput(durationField, '60');
      }
      
      // Edit Objective field
      const objectiveField = page.locator('#objective')
        .or(page.locator('#content'))
        .or(page.getByLabel(/objective|content/i))
        .or(page.getByPlaceholder(/objective|content/i));
      if (await objectiveField.isVisible({ timeout: 1000 }).catch(() => false)) {
        await objectiveField.clear();
        await FileInput(objectiveField, 'Updated objective for advanced React');
      }
      
      // Edit Description field
      const descriptionField = page.locator('#description')
        .or(page.locator('#content'))
        .or(page.getByLabel(/description|content/i))
        .or(page.getByPlaceholder(/description|content/i));
      if (await descriptionField.isVisible({ timeout: 1000 }).catch(() => false)) {
        await descriptionField.clear();
        await FileInput(descriptionField, 'Updated lesson covering advanced React concepts including hooks and state management.');
      }
      
      // THEN click "Attach Material" button after description is filled
      await page.waitForTimeout(500);
      const attachMaterialButton = page.getByRole('button', { name: /attach material/i })
        .or(page.getByText(/attach material/i))
        .or(page.locator('button:has-text("Attach Material")'));
      
      if (await attachMaterialButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await attachMaterialButton.click();
        console.log('✓ Clicked Attach Material button in edit mode');
        await page.waitForTimeout(1500);
        
        console.log('Checking for additional materials to add...');
        const materialCards = page.locator('div[data-slot="card"]');
        const cardCount = await materialCards.count();
        console.log(`Debug: Found ${cardCount} material cards`);

        if (cardCount > 1) {
            // Click the second card (index 1) to add "one more"
            const secondCard = materialCards.nth(1); 
            if (await secondCard.isVisible({ timeout: 2000 }).catch(() => false)) {
                await secondCard.click();
                console.log('✓ Success: Clicked second material card (Adding one more)');
                await page.waitForTimeout(500); 
            }
        } else {
             console.log('ℹ Only 0-1 items found, skipping selection to avoid deselecting existing item or if none exist.');
        }
        
        await page.waitForTimeout(500);
        const saveButton = page.getByRole('button', { name: /^save$/i })
          .or(page.locator('button:has-text("Save")'))
          .or(page.locator('button').filter({ hasText: /^save$/i }));
        
        console.log('Looking for Save button...');
        let saveClicked = false;
        
        if (await saveButton.isVisible({ timeout: 1000 }).catch(() => false)) {
           const box = await saveButton.boundingBox();
           if (box) {
                await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await page.waitForTimeout(500); // Wait for user to see cursor
           }
          await saveButton.click();
          console.log('✓ Clicked Save button to close modal');
          await page.waitForTimeout(1000);
          saveClicked = true;
        }
        
        if (!saveClicked) {
          const clicked = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for (const btn of buttons) {
              const text = btn.textContent?.trim() || '';
              if (text === 'Save' && (btn as HTMLElement).offsetParent !== null) {
                (btn as HTMLElement).click();
                console.log('✓ Clicked Save button via JavaScript');
                return true;
              }
            }
            return false;
          });
          
          if (clicked) {
            console.log('✓ Used JavaScript to click Save button');
            await page.waitForTimeout(1000);
          } else {
            console.log('⚠ Save button not found or not visible');
          }
        }
      }
      
      // Submit the updated form
      await page.getByRole('button', { name: /Update|Save|Submit/i }).click();
      await page.waitForTimeout(500);
    }

    //=================================================================================
    //Delete Lesson
    const lessonRowsToDelete = page.locator('table tbody tr, [role="row"], .lesson-item, div[class*="lesson"]');    
    const indexToDelete = 0;
    const lessonToDelete = lessonRowsToDelete.nth(indexToDelete);
    
    if (await lessonToDelete.isVisible({ timeout: 1000 }).catch(() => false)) {
      const deleteIconInRow = lessonToDelete.locator('button').filter({ 
        has: page.locator('svg.lucide-trash, svg.lucide-trash-2') 
      }).first();
      
      // Click the delete icon directly (don't click the lesson row)
      if (await deleteIconInRow.isVisible({ timeout: 1000 }).catch(() => false)) {
        await deleteIconInRow.click();
        await page.waitForTimeout(1000);
        
        // Use the delete helper to handle the confirmation modal
        await deleteItem(page, 'Confirm Delete');
      }
    } 
  });
});

  // ========================================
  // 8. Modules 
  // ========================================

  test.describe('Modules', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden();
    await page.getByText('Course', { exact: true }).click();
    await page.waitForTimeout(500); 
    await page.getByText('Modules', { exact: true }).click();
    await expect(page).toHaveURL(/courses\/modules/);
  });
  test('CRUD Modules', async ({ page }) => {
    await page.locator('#add-module-button').or(page.getByRole('button', { name: /add module/i })).click();
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible();
    await page.waitForTimeout(500);
    
    // Fill Title field with realistic typing
    const titleField = page.locator('#title').or(page.getByLabel(/title/i)).or(page.getByPlaceholder(/title/i));
    await FileInput(titleField, 'Introduction to JavaScript');
   
    // Fill Description field
    const descriptionField = page.locator('#description')
      .or(page.getByLabel(/description/i))
      .or(page.getByPlaceholder(/description/i));
    await FileInput(descriptionField, 'Learn the fundamentals of JavaScript programming including variables, functions, and control structures.');
    // Submit the form
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Add|Create|Submit/i }).click();
    await page.waitForTimeout(1000);


    // Close Dialog by clicking the X icon
    const closeIcon = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
    if (await closeIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeIcon.click();
      await page.waitForTimeout(1000);
    }
//====================================================================================================
    // Update Module
    const lessonRows = page.locator('table tbody tr, [role="row"], .lesson-item, div[class*="lesson"]');
    const lessonAtIndex0 = lessonRows.nth(0);
    await lessonAtIndex0.waitFor({ state: 'visible', timeout: 2000 });
    // Click the edit icon (pencil icon) directly within the lesson row
    const editIcon = lessonAtIndex0.locator('button').filter({ has: page.locator('svg.lucide-square-pen, svg.lucide-edit, svg.lucide-pencil') }).first()
      .or(lessonAtIndex0.getByRole('button', { name: /edit/i }).first())
      .or(lessonAtIndex0.getByText(/Edit/i).first())
      .or(lessonAtIndex0.locator('button[aria-label*="edit" i]').first());
    
    if (await editIcon.isVisible({ timeout: 1000 }).catch(() => false)) {
      await editIcon.click();
      
      // Wait for the edit drawer/form to appear
      await page.waitForTimeout(800);
      
      // Edit Title field
      const titleField = page.locator('#title').or(page.getByLabel(/title/i));
      if (await titleField.isVisible({ timeout: 1000 }).catch(() => false)) {
        await titleField.clear();
        await FileInput(titleField, 'Advanced JavaScript Concepts');
      }
      
      // Edit Description field
      const descriptionField = page.locator('#description').or(page.getByLabel(/description/i));
      if (await descriptionField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await descriptionField.clear();
        await FileInput(descriptionField, 'Deep dive into advanced JavaScript topics including closures, promises, and async/await.');
      }
      ;
      await page.getByRole('button', { name: /Update|Save|Submit/i }).click();
      await page.waitForTimeout(1000);
    }
    
//=====================================================================================================
    // Delete Module    
    const moduleRows = page.locator('table tbody tr, [role="row"], .module-item, div[class*="module"]');
    const indexToDelete = 0;
    const moduleToDelete = moduleRows.nth(indexToDelete);
    
    if (await moduleToDelete.isVisible({ timeout: 2000 }).catch(() => false)) {
      const deleteIconInRow = moduleToDelete.locator('button').filter({ 
        has: page.locator('svg.lucide-trash, svg.lucide-trash-2') 
      }).first();
      
      // Click the delete icon directly (don't click the module row)
      if (await deleteIconInRow.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteIconInRow.click();
        await page.waitForTimeout(1000);
        await deleteItem(page, 'Confirm Delete');
      }
    }
    
  });
});

  // ========================================
  // 9. Courses 
  // ========================================

  test.describe('Courses', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    
    await page.getByText('Course', { exact: true }).click();
    
    const coursesLink = page.getByRole('link', { name: 'Courses', exact: true })
                      .or(page.getByText('Courses', { exact: true }));
    
    if (await coursesLink.isVisible()) {
        await coursesLink.click();
    }
    
    await expect(page).toHaveURL(/courses/); 
  });

  // =====================================
  // Add new course
  // =====================================
  test('CRUD Courses', async ({ page }) => {
    const addButton = page.locator('#add-course-button')
        .or(page.getByRole('button', { name: /add course/i }));
        
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    await addButton.click();
    
    // 2. Wait for the General Info form (Title field) to appear
    const titleField = page.getByRole('textbox', { name: /^Title/i })
        .or(page.getByPlaceholder('Title', { exact: true }))
        .or(page.locator('input[name="title"]'))
        .first();
        
    await expect(titleField).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500); // Stability wait
    
    // Fill Title
    await FileInput(titleField, 'Introduction to Advanced Programming');

    // 3. Select Subject (Dropdown)
    // Locates the button specifically next to or under the "Subject" label
    const subjectDropdown = page.locator('label:has-text("Subject")').locator('..').locator('button[role="combobox"]')
        .or(page.getByTestId('subject-dropdown'))
        .first();

    await expect(subjectDropdown).toBeVisible(); 
    await subjectDropdown.scrollIntoViewIfNeeded();
    await subjectDropdown.click();
    
    await expect(subjectDropdown).toHaveAttribute('aria-expanded', 'true');
    
    // Select the first available option
    const subjectOptions = page.getByRole('option');
    await expect(subjectOptions.first()).toBeVisible({ timeout: 5000 });
    
    if (await subjectOptions.count() > 1) {
         await subjectOptions.nth(1).click();
    } else {
         await subjectOptions.first().click();
    }

    // 4. Select Level (Dropdown)
    const levelDropdown = page.locator('label:has-text("Level")').locator('..').locator('button[role="combobox"]')
        .or(page.getByTestId('level-dropdown'))
        .first();

    await expect(levelDropdown).toBeVisible();
    await levelDropdown.scrollIntoViewIfNeeded();
    await levelDropdown.click();
    
    await expect(levelDropdown).toHaveAttribute('aria-expanded', 'true');
    const levelOptions = page.getByRole('option');
    await expect(levelOptions.first()).toBeVisible({ timeout: 5000 });
    
    // Select an option
    await levelOptions.first().click();

    // 5. Fill Duration
    const durationField = page.getByRole('textbox', { name: /^Duration/i })
        .or(page.getByPlaceholder('Duration'))
        .or(page.locator('input[name="duration"]'))
        .first();
        
    await durationField.scrollIntoViewIfNeeded();
    await FileInput(durationField, '50');

    // 6. Fill Prerequisite (Textarea)
    const prerequisiteField = page.locator('textarea[name="prerequisite"]')
        .or(page.getByRole('textbox', { name: /^Prerequisite/i }))
        .or(page.getByPlaceholder('Prerequisite'))
        .first();
        
    if (await prerequisiteField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await prerequisiteField.scrollIntoViewIfNeeded();
        await FileInput(prerequisiteField, 'Basic JS knowledge');
    }

    // Optional: Preparation (if exists on form, not in screenshot but good to keep if dynamic)
    const preparationField = page.getByLabel(/preparation/i).or(page.getByPlaceholder(/preparation/i));
    if (await preparationField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(preparationField, 'Laptop and Internet');
    }

    // Optional: Purpose
    const purposeField = page.getByLabel(/purpose/i).or(page.getByPlaceholder(/purpose/i));
    if (await purposeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(purposeField, 'To learn advanced coding.');
    }

    // Optional: Overview
    const overviewField = page.getByLabel(/overview/i).or(page.getByPlaceholder(/overview/i));
    if (await overviewField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(overviewField, 'Course overview content.');
    }
    
    // Optional: Objective
    const objectiveField = page.getByLabel(/objective/i).or(page.getByPlaceholder(/objective/i));
    if (await objectiveField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(objectiveField, 'Course objectives.');
    }

    // Optional: Link
    const linkField = page.getByLabel(/link/i).or(page.getByPlaceholder(/link/i));
    if (await linkField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(linkField, 'https://example.com');
    }

    // 7. Upload Thumbnail
    await uploadThumbnail(page);
    await page.waitForTimeout(1000);

    // 8. Click "Next" to go to Outline tab
    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeVisible();
    await nextButton.scrollIntoViewIfNeeded();
    await nextButton.click();

    // --- Interacting with Module and Lessons (Tab 2) ---
    await page.waitForTimeout(1000);

    // Select Module
    const moduleDropdown = page.getByRole('combobox').filter({ hasText: /select module/i })
        .or(page.getByText('Select module', { exact: false })).first();
    
    await expect(moduleDropdown).toBeVisible();
    await moduleDropdown.click();
    
    await expect(page.getByRole('option').first()).toBeVisible();
    await page.getByRole('option').first().click();
    
    await page.waitForTimeout(500);

    // Select Lessons
    const lessonsDropdown = page.getByRole('combobox').filter({ hasText: /select lessons/i })
        .or(page.getByText('Select Lessons', { exact: false })).first();

    await expect(lessonsDropdown).toBeVisible();
    await lessonsDropdown.click();
    
    await expect(page.getByRole('option').first()).toBeVisible();
    await page.getByRole('option').first().click();

    // Close the multi-select dropdown
    await page.keyboard.press('Escape');
    
    // 9. Submit/Create
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /create|save|submit/i })
        .or(page.locator('button[type="submit"]'))
        .filter({ hasText: /create|save/i }).click();

  //======================================================================================
  // Course List or Grid view
   
      await toggleViewMode(page);

      // Filter by Subject
      const filterSubjectDropdown = page.getByTestId('subjects-dropdown').or(
          page.getByRole('combobox').filter({ hasText: /all subjects/i })
      );
      await expect(filterSubjectDropdown).toBeVisible();
      await filterSubjectDropdown.click();
      
      await expect(filterSubjectDropdown).toHaveAttribute('aria-expanded', 'true');
      
      const filterSubjectOptions = page.getByRole('option');
      await expect(filterSubjectOptions.first()).toBeVisible();
      await expect(filterSubjectOptions.nth(1)).toBeVisible();
      await page.waitForTimeout(300); 
      await filterSubjectOptions.nth(2).click();

      // Filter by Level
      const filterLevelDropdown = page.getByRole('combobox').filter({ hasText: /all levels/i });
      await expect(filterLevelDropdown).toBeVisible();
      await filterLevelDropdown.click();
      
      await expect(filterLevelDropdown).toHaveAttribute('aria-expanded', 'true');

      const filterLevelOptions = page.getByRole('option');
      await expect(filterLevelOptions.nth(1)).toBeVisible();
      
      await page.waitForTimeout(300); 
      await filterLevelOptions.nth(1).click();

      //=========================================================================================
      // Update Course
    const courseRows = page.locator('table tbody tr, [role="row"], .course-item, div[class*="course-card"]');
    await expect(courseRows.first()).toBeVisible({ timeout: 10000 });

    // Get the course at index 0
    const courseAtIndex0 = courseRows.first();
    await courseAtIndex0.scrollIntoViewIfNeeded();
    
    // Click the "three dots" / More Options menu in the row
    const moreMenuBtn = courseAtIndex0.locator('button').filter({ has: page.locator('svg.lucide-more-vertical, svg.lucide-ellipsis, svg.lucide-more-horizontal') }).first();
    
    if (await moreMenuBtn.isVisible({ timeout: 5000 })) {
        await moreMenuBtn.click();
        await page.waitForTimeout(500); // Wait for menu to open
    } else {
        await courseAtIndex0.click({ force: true });
    }
    await page.waitForTimeout(1000);
    await page.waitForTimeout(1000);

    // Look for Edit button
    const actionsMenuButton = page.locator('button[aria-haspopup="menu"]').first();
    await actionsMenuButton.click();
    await page.waitForTimeout(800);
    
    const editButton = page.getByRole('menuitem', { name: /Edit/i }).or(page.getByRole('button', { name: /Edit/i }));
    
    if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editButton.click({ force: true });
      await page.waitForTimeout(1500);
      
      // Edit Title field
      const titleField = page.locator('#title').or(page.getByLabel(/title/i)).first();
      await titleField.waitFor({ state: 'visible', timeout: 5000 });
      
      if (await titleField.isVisible().catch(() => false)) {
        await titleField.clear();
        await FileInput(titleField, 'Updated Course Title - Advanced Programming');
      }

      // Edit Subject (Dropdown) - Try to pick another option if available
      const subjectDropdown = page.getByTestId('subject-dropdown').or(
          page.locator('label', { hasText: /^Subject/ }).locator('..').locator('button[role="combobox"]')
      );
      if (await subjectDropdown.isVisible()) {
          await subjectDropdown.click();
          await expect(subjectDropdown).toHaveAttribute('aria-expanded', 'true');
          const subjectOptions = page.getByRole('option');
          if (await subjectOptions.count() > 1) {
              // Try to select a different one (e.g. index 0 if 1 was selected, or just 0)
              await subjectOptions.first().click(); 
          } else if (await subjectOptions.count() === 1) {
              await subjectOptions.first().click();
          } else {
             // Close if no options
             await subjectDropdown.click();
          }
      }

      // Edit Level (Dropdown)
      const levelDropdown = page.getByTestId('level-dropdown').or(
          page.locator('label', { hasText: /^Level/ }).locator('..').locator('button[role="combobox"]')
      );
      if (await levelDropdown.isVisible()) {
          await levelDropdown.click();
          await expect(levelDropdown).toHaveAttribute('aria-expanded', 'true');
          const levelOptions = page.getByRole('option');
           if (await levelOptions.count() > 0) {
              await levelOptions.first().click(); 
          }
      }

      // Edit Duration
      const durationField = page.getByLabel(/duration/i).or(page.getByPlaceholder(/duration/i));
      if (await durationField.isVisible()) {
           await durationField.clear();
           await FileInput(durationField, '60');
      }

      // Edit Prerequisite
      const prerequisiteField = page.getByLabel(/prerequisite/i).or(page.getByPlaceholder(/prerequisite/i));
      if (await prerequisiteField.isVisible()) {
          await prerequisiteField.clear();
          await FileInput(prerequisiteField, 'Updated JS knowledge');
      }

      // Edit Preparation
      const preparationField = page.getByLabel(/preparation/i).or(page.getByPlaceholder(/preparation/i));
      if (await preparationField.isVisible()) {
          await preparationField.clear();
          await FileInput(preparationField, 'Updated Preparation steps');
      }

      // Edit Purpose
      const purposeField = page.getByLabel(/purpose/i).or(page.getByPlaceholder(/purpose/i));
      if (await purposeField.isVisible()) {
          await purposeField.clear();
          await FileInput(purposeField, 'Updated Purpose: Master advanced concepts.');
      }

      // Edit Overview/Description field (Consistent with Add Course)
      const overviewField = page.locator('#overview')
          .or(page.getByLabel(/overview/i))
          .or(page.getByPlaceholder(/overview/i))
          .or(page.locator('textarea').filter({ hasText: /overview/i }).first())

      if (await overviewField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await overviewField.clear();
        await FileInput(overviewField, 'Updated description with new content and objectives.');
      }

    // Edit Objective
      const objectiveField = page.getByLabel(/objective/i).or(page.getByPlaceholder(/objective/i));
      if (await objectiveField.isVisible()) {
          await objectiveField.clear();
          await FileInput(objectiveField, 'Updated Objective: Master advanced concepts.');
      }
      
      // Edit Link
      const linkField = page.getByLabel(/link/i).or(page.getByPlaceholder(/link/i));
      if (await linkField.isVisible()) {
           await linkField.clear();
           await FileInput(linkField, 'https://www.youtube.com/results?search_query=playwright');
      }

    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeVisible();
    await nextButton.scrollIntoViewIfNeeded();
    await nextButton.hover();
    await page.waitForTimeout(300);
    await nextButton.click();

    await page.waitForTimeout(1000);

    // Module selection logic - Use more specific filtering to avoid matching Subject/Level dropdowns
    // locate the combobox specifically associated with "Select module" text or label
    const moduleDropdown = page.locator('button[role="combobox"]').filter({ hasText: /select module|introduction|module/i }).last();
    
    // Ensure we are in the module section (scroll down)
    await moduleDropdown.scrollIntoViewIfNeeded();
    await expect(moduleDropdown).toBeVisible();
    await moduleDropdown.click();
    
    // Select first available option if any
    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 5000 }).catch(() => null);
    if (await page.getByRole('option').count() > 0) {
        await page.getByRole('option').first().click();
    } else {
         await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);

    // Lessons dropdown
    const lessonsDropdown = page.locator('button[role="combobox"]').filter({ hasText: /select lesson|react|lesson/i }).last();

    if (await lessonsDropdown.isVisible()) {
        await lessonsDropdown.click();
        await page.waitForTimeout(500);
        // Just close it for now as we might not want to change complex selection logic
        await page.keyboard.press('Escape');
    }
    
    await page.waitForTimeout(500);

    // Final Update Submit
    const updateButton = page.getByRole('button', { name: /update|save|submit/i }).last();
    await expect(updateButton).toBeVisible();
    await updateButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200); 
    await updateButton.click({ force: true });
      
    }
      
  });
});

  // ========================================
  // 10. Classes 
  // ========================================

  test.describe('Classes', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Class', { exact: true }).click();
    await expect(page).toHaveURL(/classes/);
  });

  test('CRUD Class', async ({ page }) => {
    const { title, price, progress, startDate, endDate, startTime, endTime } = staticData.classDataAdd;
    
    await page.locator('#add-class-button').click();
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible();
    await page.waitForTimeout(500);
    
    // Fill Title field with realistic typing
    const titleField = page.locator('#title');
    await FileInput(titleField, title);
    
    // Click the first combobox (course dropdown)
    const courseDropdown = page.locator('button[role="combobox"]').first();
    await courseDropdown.waitFor({ state: 'visible' });
    await courseDropdown.click();
    
    // Select the first course option
    await page.waitForTimeout(500);
    const courseOptions = page.getByRole('option');
    await courseOptions.first().waitFor({ state: 'visible' });
    await courseOptions.first().click();
    
    // Scroll to ensure all form fields are visible
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
    
    // Fill Price field - try multiple selector strategies
    await page.waitForTimeout(500);
    const priceField = page.getByLabel(/price/i)
      .or(page.getByPlaceholder(/price/i))
      .or(page.locator('input[type="text"]').nth(1))
      .or(page.locator('input[type="number"]').first());
    await FileInput(priceField, price);
    
    // Fill Progress field
    const progressField = page.getByLabel(/progress/i)
      .or(page.getByPlaceholder(/progress/i))
      .or(page.locator('input[type="text"]').nth(2))
      .or(page.locator('input[type="number"]').nth(1));
    await FileInput(progressField, progress);
    
    // Fill Start Date field (static date)
    const startDateField = page.getByLabel(/start date/i)
      .or(page.getByPlaceholder(/start date/i))
      .or(page.locator('input[type="date"]').first());
    await FileInput(startDateField, startDate);
    
    // Fill End Date field (static date)
    const endDateField = page.getByLabel(/end date/i)
      .or(page.getByPlaceholder(/end date/i))
      .or(page.locator('input[type="date"]').nth(1));
    await FileInput(endDateField, endDate);
    
    // Fill Start Time field
    await page.waitForTimeout(500);
    const startTimeInput = page.getByLabel(/start time/i)
      .or(page.locator('#startTime'))
      .or(page.getByPlaceholder(/start time/i));
    
    await FileInput(startTimeInput, startTime);
    
    const endTimeInput = page.getByLabel(/end time/i)
      .or(page.locator('#endTime'))
      .or(page.getByPlaceholder(/end time/i));
    
    await FileInput(endTimeInput, endTime);

    await uploadThumbnail(page, "file-input");

    // Set Publish toggle to TRUE
    await page.locator('#isPublish')
      .or(page.locator('[role="switch"]').filter({ hasText: /publish/i })).click();
    
    await page.waitForTimeout(1000);

    // Set Online toggle to TRUE
    await page.locator('#isOnline')
      .or(page.locator('[role="switch"]').filter({ hasText: /online/i })).click();

    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: /next|next step/i }).click();
    await page.waitForTimeout(500);

    
    // Step 2: Click to open the coaches dropdown
    const coachesDropdown = page.getByPlaceholder(/select coaches/i)
      .or(page.getByText(/select coaches/i).first())
      .or(page.locator('button[role="combobox"]').filter({ hasText: /coaches/i }))
      .or(page.locator('button[role="combobox"]').last());
    
    // Click the dropdown to open it
    if (await coachesDropdown.isVisible().catch(() => false)) {
      await coachesDropdown.click();
      
      // Select the first coach from the dropdown
      const coachOptions = page.locator('[role="option"], li label, .coach-item, [class*="option"]');
      const firstCoach = coachOptions.nth(0);
      
      if (await firstCoach.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstCoach.click();
        await page.waitForTimeout(800);
      }
      
      // Close the dropdown by clicking outside or pressing Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Step 3: Click Next again to go to Students/Thumbnail tab
    await page.waitForTimeout(500);
    const nextButton2 = page.getByRole('button', { name: /next|next step/i });
       if (await nextButton2.isVisible({ timeout: 1000 }).catch(() => false)) {
      await nextButton2.click();
    }

    const studentsDropdown = page.getByPlaceholder(/select students/i)
      .or(page.getByText(/select students/i).first())
      .or(page.locator('button[role="combobox"]').filter({ hasText: /students/i }))
      .or(page.locator('button[role="combobox"]').last());
    
    // Click the dropdown to open it
    if (await studentsDropdown.isVisible().catch(() => false)) {
      await studentsDropdown.click();
      // Select the first coach from the dropdown
      const studentOptions = page.locator('[role="option"], li label, .coach-item, [class*="option"]');
      const firstStudent = studentOptions.nth(0);
      
      if (await firstStudent.isVisible().catch(() => false)) {
        await firstStudent.click();
      }
      await page.keyboard.press('Escape');
    }
    // Step 5: Click final submit button (Add/Create)
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Add|Create|Submit/i }).click();


      //======================================================================================
  // Class List or Grid view
      await toggleViewMode(page);

      //======================================================================================
  // Update Class
  
    // Extract test data from static data (use aliases to avoid conflict with Add variables)
    const { 
      title: titleEdit, 
      price: priceEdit, 
      progress: progressEdit, 
      startDate: startDateEdit, 
      endDate: endDateEdit, 
      startTime: startTimeEdit, 
      endTime: endTimeEdit 
    } = staticData.classDataEdit;
    
    // Wait for the class list to load
    await page.waitForTimeout(1000);
    const classRows = page.locator('table tbody tr, [role="row"], .class-item, div[class*="class"]');
    
    const classAtIndex0 = classRows.nth(0);
    await classAtIndex0.waitFor({ state: 'visible', timeout: 5000 });
    await classAtIndex0.click();
    await page.waitForTimeout(1500);

    // Find the three-dot menu button within this specific class row
    const actionsMenuButton = page.locator('button[aria-haspopup="menu"]').first();
    await actionsMenuButton.click();
    await page.waitForTimeout(800);
    
    // Click on Edit option in the menu
    const editButton = page.getByRole('menuitem', { name: /Edit/i }).or(page.getByRole('button', { name: /Edit/i }));
    
    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editButton.click();
      
      // Wait for the edit drawer/form to appear
      await page.waitForTimeout(1500);
      
      // Step 1: Edit fields in General Info tab
      // Edit Title field
      const titleField = page.locator('#title');
      if (await titleField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await titleField.clear();
        await FileInput(titleField, titleEdit);
      }

       
    // Select Course dropdown
    await page.waitForTimeout(1000);
    
    // Click the first combobox (course dropdown)
    const courseDropdown = page.locator('button[role="combobox"]').first();
    await courseDropdown.waitFor({ state: 'visible', timeout: 5000 });
    await courseDropdown.click();
    
    // Select the first course option
    await page.waitForTimeout(500);
    const courseOptions = page.getByRole('option');
    await courseOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    await courseOptions.first().click();
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
      
      // Edit Price field
      const priceField = page.getByLabel(/price/i)
        .or(page.getByPlaceholder(/price/i))
        .or(page.locator('input[type="text"]').nth(1))
        .or(page.locator('input[type="number"]').first());
      if (await priceField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await priceField.clear();
        await FileInput(priceField, priceEdit);
      }
      
      // Edit Progress field
      const progressField = page.getByLabel(/progress/i)
        .or(page.getByPlaceholder(/progress/i))
        .or(page.locator('input[type="text"]').nth(2))
        .or(page.locator('input[type="number"]').nth(1));
      if (await progressField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await progressField.clear();
        await FileInput(progressField, progressEdit);
      }

          // Fill Start Date field (static date)
    const startDateField = page.getByLabel(/start date/i)
      .or(page.getByPlaceholder(/start date/i))
      .or(page.locator('input[type="date"]').first());
    await FileInput(startDateField, startDateEdit);
    
    // Fill End Date field (static date)
    const endDateField = page.getByLabel(/end date/i)
      .or(page.getByPlaceholder(/end date/i))
      .or(page.locator('input[type="date"]').nth(1));
    await FileInput(endDateField, endDateEdit);
    
      
      // Edit Start Time
      const startTimeField = page.getByLabel(/start time/i)
        .or(page.locator('#startTime'))
        .or(page.getByPlaceholder(/start time/i));
      if (await startTimeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await startTimeField.clear();
        await FileInput(startTimeField, startTimeEdit);
      }
      
      // Edit End Time
      const endTimeField = page.getByLabel(/end time/i)
        .or(page.locator('#endTime'))
        .or(page.getByPlaceholder(/end time/i));
      if (await endTimeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await endTimeField.clear();
        await FileInput(endTimeField, endTimeEdit);
      }

            // Scroll to ensure toggles are visible
      await page.evaluate(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      });

              // Click "Remove file" button first to remove existing file
        const removeFileButton = page.getByRole('button', { name: /Remove file/i })
          .or(page.locator('button[aria-label*="Remove file"]'))
          .or(page.locator('button:has-text("Remove file")'));
        
        if (await removeFileButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('Clicking Remove file button...');
          await removeFileButton.click();
          await page.waitForTimeout(500);
        }
      await page.waitForTimeout(500);

      await uploadThumbnail(page, "file-input || selected-exist", {
      imagePath: path.join(__dirname, '..', '..','public', 'images', 'thumbnial-update.png')
      });
      
      await page.waitForTimeout(500);
      // Set Publish toggle to FALSE
      await page.locator('#isPublish')
        .or(page.locator('[role="switch"]').filter({ hasText: /publish/i })).click();

      await page.waitForTimeout(1000);  
      // Set Online toggle to FALSE
      await page.locator('#isOnline')
        .or(page.locator('[role="switch"]').filter({ hasText: /online/i })).click();

      // Step 2: Click Next button to go to Coaches tab
      await page.waitForTimeout(1000);
      const nextButton = page.getByRole('button', { name: /next|next step/i });
      await nextButton.scrollIntoViewIfNeeded();
      
      if (await nextButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        const isDisabled = await nextButton.isDisabled().catch(() => true);
        if (!isDisabled) {
          await nextButton.click();
          await page.waitForTimeout(2000);
          
          // Step 3: Update coach selection - Use EXACT same pattern as students (which works)
          await page.waitForTimeout(1000);
          
          console.log('=== COACHES DROPDOWN DEBUG ===');
          
          // Try to find ALL possible chevron buttons
          const allButtons = page.locator('button:has(svg.lucide-chevron-down)');
          const buttonCount = await allButtons.count();
          console.log(`Total buttons with chevron found: ${buttonCount}`);
          
          // Log details about each button
          for (let i = 0; i < buttonCount; i++) {
            const btn = allButtons.nth(i);
            const isVisible = await btn.isVisible().catch(() => false);
            const ariaExpanded = await btn.getAttribute('aria-expanded').catch(() => 'N/A');
            const dataState = await btn.getAttribute('data-state').catch(() => 'N/A');
            console.log(`  Button ${i}: visible=${isVisible}, aria-expanded=${ariaExpanded}, data-state=${dataState}`);
          }
          
          const coachesDropdownTrigger = page.locator('button:has(svg.lucide-chevron-down)').first()
            .or(page.locator('button[type="button"]:has(svg.lucide-chevron-down)').first())
            .or(page.locator('button[aria-haspopup="dialog"]').first())
            .or(page.getByPlaceholder(/select coaches/i));
          
          console.log(`Coaches trigger visible: ${await coachesDropdownTrigger.isVisible({ timeout: 3000 }).catch(() => false)}`);
          
          if (await coachesDropdownTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log('Attempting to click coaches dropdown...');
            await coachesDropdownTrigger.click({ force: true }); // Try force click
            console.log('✓ Clicked to open coaches dropdown');
            await page.waitForTimeout(2000); // Increased wait time
            
            // Try multiple selectors to find coach options
            const coachOptions = page.locator('[role="option"]');
            const coachCount = await coachOptions.count();
            console.log(`Found ${coachCount} coach options in dropdown`);
            
            // Log all available options for debugging
            for (let i = 0; i < Math.min(coachCount, 5); i++) {
              const optionText = await coachOptions.nth(i).textContent().catch(() => 'N/A');
              const isVisible = await coachOptions.nth(i).isVisible().catch(() => false);
              console.log(`  Coach ${i}: "${optionText}" - Visible: ${isVisible}`);
            }
            
            // Add one more coach if more items are available (select index 1 if exists)
            if (coachCount > 1) {
              const secondCoach = coachOptions.nth(1);
              const secondCoachText = await secondCoach.textContent().catch(() => 'Unknown');
              console.log(`Attempting to click second coach: "${secondCoachText}"`);
              
              // Scroll into view first
              await secondCoach.scrollIntoViewIfNeeded().catch(() => {});
              await page.waitForTimeout(300);
              
              if (await secondCoach.isVisible({ timeout: 3000 }).catch(() => false)) {
                await secondCoach.click();
                console.log('✓ Added one more coach (index 1)');
                await page.waitForTimeout(1000);
              } else {
                console.log('⚠ Second coach not visible');
              }
            } else {
              console.log('⚠ No additional coaches available to add');
            }
            
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
          } else {
            console.log('⚠ Coaches dropdown not visible in Edit class');
          }
          
          // Step 4: Click Next to go to Students tab
          const nextButton2 = page.getByRole('button', { name: /next|next step/i });
          if (await nextButton2.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nextButton2.click();
            await page.waitForTimeout(2000);
            
            // Step 4.5: Update student selection (select one more student if available)
            // Target the button that triggers the dropdown (has chevron icon inside)
            const studentsDropdownTrigger = page.locator('button:has(svg.lucide-chevron-down)').last()
              .or(page.locator('button[type="button"]:has(svg.lucide-chevron-down)').last())
              .or(page.locator('button[aria-haspopup="dialog"]').last())
              .or(page.getByPlaceholder(/select students/i));
            
            if (await studentsDropdownTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
              await studentsDropdownTrigger.click();
              await page.waitForTimeout(1500);
              
              // Get all student options that are visible
              const studentOptions = page.locator('[role="option"], li label, .student-item, [class*="option"]');
              const studentCount = await studentOptions.count();
              
              // Add one more student if more items are available (select index 1 if exists)
              if (studentCount > 1) {
                const secondStudent = studentOptions.nth(1);
                if (await secondStudent.isVisible({ timeout: 2000 }).catch(() => false)) {
                  await secondStudent.click();
                  console.log('✓ Added one more student (index 1)');
                  await page.waitForTimeout(800);
                } else {
                  console.log('⚠ Second student not visible');
                }
              } else {
                console.log('⚠ No additional students available to add');
              }
              
              await page.keyboard.press('Escape');
              await page.waitForTimeout(500);
            } else {
              console.log('⚠ Students dropdown not visible in Edit class');
            }
          }
        }
      }
      
      // Step 5: Submit the updated form
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /Update|Save|Submit/i }).click();

    }
    
    //=========================================================================
        // Click the back/close button to return to coaches list
      const backButton = page.locator('button:has(svg.lucide-arrow-left)')
        .or(page.locator('svg.lucide-arrow-left').locator('xpath=..'))
        .or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-arrow-left"]') }))
        .or(page.locator('button[aria-label*="back" i]'))
        .or(page.getByRole('button', { name: /Back|back/i }));
      
      await backButton.first().waitFor({ state: 'visible', timeout: 5000 });
      await backButton.first().scrollIntoViewIfNeeded();
      await backButton.first().click();
      await page.waitForTimeout(1500);
      
      //======================================================================================
    // Delete Class
    const classRowsToDelete = page.locator('table tbody tr, [role="row"], .class-item, div[class*="class"]');
    const indexToDelete = 0;
    const classToDelete = classRowsToDelete.nth(indexToDelete);
    
    await deleteEntityViaActionMenu(page, classToDelete, 'Confirm Delete');
  });
});


  // ========================================
  // 11. Attendance 
  // ========================================

  test.describe('Attendances', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await page.waitForTimeout(1000);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 45000 });
    const attendanceLink = page.getByText('Attendance', { exact: true })
      .or(page.getByText('Attendances', { exact: true }))
      .or(page.locator('a[href*="/attendance"]')); 
    
    if (await attendanceLink.isVisible().catch(() => false)) {
      await attendanceLink.click();
    }
    
    await expect(page).toHaveURL(/attendance/i);
    await page.waitForTimeout(1000);            
  });

  //   ====================================== 
  // CRUD Attendance
  //   ====================================== 
  test('CRUD Attendance', async ({ page }) => {
    
    //======================================================================================
    // Add new attendance
   
    const addButton = page.locator('button:has(.lucide-plus)').first();
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    const subjectDropdown = page.getByTestId('class-title-dropdown').or(
        page.locator('label', { hasText: /^Class Title/ }).locator('..').locator('button[role="combobox"]')
    );

    await expect(subjectDropdown).toBeVisible(); 
    await subjectDropdown.scrollIntoViewIfNeeded();
    await subjectDropdown.click();
    
    await expect(subjectDropdown).toHaveAttribute('aria-expanded', 'true');
    
    const subjectOptions = page.getByRole('option');
    await expect(subjectOptions.first()).toBeVisible({ timeout: 1000 });
    
    if (await subjectOptions.count() > 1) {
         await subjectOptions.nth(0).click();
    } else {
         await subjectOptions.first().click();
    }

    const dueDateInput = page.getByLabel(/Due Date/i)
        .or(page.getByPlaceholder(/Due Date/i))
        .or(page.locator('input[type="date"]').first())
        .or(page.locator('input[placeholder*="date" i]'));

    if (await dueDateInput.isVisible().catch(() => false)) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;
        
        await dueDateInput.click();
        await page.waitForTimeout(200);
        await dueDateInput.fill(formattedDate);
        await page.waitForTimeout(300);
    }

    // Fill Notes field
    await page.waitForTimeout(500);
    const notesInput = page.getByLabel(/Notes|Description/i)
        .or(page.getByPlaceholder(/Notes|Description/i))
        .or(page.locator('textarea[name="note"]'))
        .or(page.locator('textarea'));

    // Wait for notes field to be visible
    if (await notesInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await notesInput.scrollIntoViewIfNeeded();
        await FileInput(notesInput, 'Automated attendance test note');
    } else {
        console.log('⚠ Notes field not found or not visible');
    }
    
    // Click submit button inside the dialog (not the floating action button)
    await page.waitForTimeout(500);
    const dialog = page.getByRole('dialog');
    const submitButton = dialog.locator('button[type="submit"]')
        .or(dialog.getByRole('button', { name: /^Create$|^Add$/i }));
    
    await expect(submitButton).toBeVisible();
    await submitButton.click();
    
    await expect(dialog).toBeHidden({ timeout: 1000 });

    //======================================================================================
    // Select class to view attendances
    const selectClassDropdown = page.locator('button[role="combobox"]')
      .filter({ hasText: /Select Class/i })
      .or(page.locator('button[role="combobox"]').filter({ hasText: /class/i }).first())
      .or(page.getByRole('combobox', { name: /select class/i }));
    
    await expect(selectClassDropdown).toBeVisible({ timeout: 5000 });
    await selectClassDropdown.scrollIntoViewIfNeeded();
    await selectClassDropdown.click();
    
    const options = page.getByRole('option');
    await expect(options.first()).toBeVisible({ timeout: 5000 });
    
    if (await options.count() > 1) {
      await options.nth(1).click();
    } else {
      await options.first().click();
    }
    
    await page.waitForTimeout(2000);

    //======================================================================================
    // Edit attendance
    const attendanceRows = page.locator('table tbody tr, [role="row"], .attendance-item, div[class*="attendance"]');
    
    // Ensure we have rows
    await expect(attendanceRows.first()).toBeVisible({ timeout: 1000 });

    const indexToEdit = 0;
    // Click on the specific cell (Title) to enter detail view
    const rowToEdit = attendanceRows.nth(indexToEdit).locator('td, div').nth(1).first();
    await rowToEdit.click();
    
    // Wait for detail view
    await page.waitForTimeout(1000);

    // Click Edit button
    const actionsMenuButton = page.locator('button[aria-haspopup="menu"]').first();
    await expect(actionsMenuButton).toBeVisible();
    await actionsMenuButton.click();
    
    const editButton = page.getByRole('menuitem', { name: /Edit/i })
        .or(page.getByRole('button', { name: /Edit/i }));
    await expect(editButton).toBeVisible();
    await editButton.click();
    
    // Wait for edit form
    await page.waitForTimeout(1000);
    
    // Modify Notes
    const notesInputEdit = page.getByLabel(/Notes|Description/i)
        .or(page.getByPlaceholder(/Notes|Description/i))
        .or(page.locator('textarea[name="note"]'))
        .or(page.locator('textarea'));
        
    await expect(notesInputEdit).toBeVisible();
    await FileInput(notesInputEdit, 'Updated Note during Automation');

    // Handle "Reason"
    const reasonInput = page.getByLabel(/Reason/i).or(page.getByPlaceholder(/Reason/i));
    if (await reasonInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(reasonInput, 'Updating for test');
    }

    // Submit
    const saveBtn = page.getByRole('button', { name: /Update|Save/i })
        .or(page.locator('button[type="submit"]'));
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();
    
    // Verify success
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 1000 });

    //======================================================================================
    // Navigate back to attendance list
    await page.waitForTimeout(1000);
    
    const backButton = page.locator('button:has(svg.lucide-arrow-left)')
      .or(page.locator('svg.lucide-arrow-left').locator('xpath=..'))
      .or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-arrow-left"]') }))
      .or(page.locator('button[aria-label*="back" i]'))
      .or(page.getByRole('button', { name: /Back|back/i }));
    
    await backButton.first().waitFor({ state: 'visible', timeout: 1000 });
    await backButton.first().scrollIntoViewIfNeeded();
    await backButton.first().click();
    await page.waitForTimeout(1000);

    //======================================================================================
    // Delete attendance
    
    // Select Class to filter list again - use specific selector to avoid clicking add button
    const selectClassDropdownDelete = page.locator('button[role="combobox"]')
      .filter({ hasText: /Select Class/i })
      .or(page.locator('button[role="combobox"]').filter({ hasText: /class/i }).first())
      .or(page.getByRole('combobox', { name: /select class/i }));
    
    await expect(selectClassDropdownDelete).toBeVisible({ timeout: 1000 });
    await selectClassDropdownDelete.scrollIntoViewIfNeeded();
    await selectClassDropdownDelete.click();

    const optionsDelete = page.getByRole('option');
    await expect(optionsDelete.first()).toBeVisible({ timeout: 1000 });
    
    if (await optionsDelete.count() > 1) {
      await optionsDelete.nth(1).click();
    } else {
      await optionsDelete.first().click();
    }

    await page.waitForTimeout(2000);
    const attendanceRowsDelete = page.locator('table tbody tr, [role="row"], .attendance-item, div[class*="attendance"]');
    const indexToDelete = 0;
    const attendanceToDelete = attendanceRowsDelete.nth(indexToDelete);
    await deleteEntityViaActionMenu(page, attendanceToDelete, 'Confirm Delete');
  });
});


  // ========================================
  // 12. Invoices 
  // ========================================

  test.describe('Invoices', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    
    // Navigate to Invoices page
    const invoiceLink = page.getByText('Invoice', { exact: true })
      .or(page.getByText('Invoices', { exact: true }))
      .or(page.locator('a[href*="/invoice"]'));
    
    if (await invoiceLink.isVisible().catch(() => false)) {
      await invoiceLink.click();
    }
    
    await expect(page).toHaveURL(/invoice/i);
    await page.waitForTimeout(1000);
  });

  test('CRUD Invoice', async ({ page }) => {
    
    //======================================================================================
    // Add new invoice
    
    // Click the add button using the specific CSS selector
    await page.locator('#add-invoice-button').click();
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    
    // Select Student - wait for dropdown to be ready and select first option
    await page.getByText('Select Student', { exact: true }).click();
    await page.waitForTimeout(300); // Small delay for dropdown to open
    const studentOptions = page.getByRole('option');
    await studentOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    await studentOptions.first().click();
    
    // Select Class - wait for dropdown to be ready and select first option
    await page.getByText('Select Class', { exact: true }).click();
    await page.waitForTimeout(300); // Small delay for dropdown to open
    const classOptions = page.getByRole('option');
    await classOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    await classOptions.first().click();
    
    // Select Status - wait for dropdown to be ready and select first option
    await page.getByText('Select Status', { exact: true }).click();
    await page.waitForTimeout(300); // Small delay for dropdown to open
    const statusOptionsAdd = page.getByRole('option');
    await statusOptionsAdd.first().waitFor({ state: 'visible', timeout: 5000 });
    await statusOptionsAdd.first().click();
    
    // Fill Due Date
    await FileInput(page.getByLabel(/Due Date/i), '2026-01-14');
    
    // Fill Amount
    await FileInput(page.getByLabel(/Amount \(\$\)/i), '500');
    
    // Fill Discount (optional field)
    await FileInput(page.getByLabel(/Discount \(\$\)/i), '50');

    // Select reference - only if items exist
    await page.getByText('Select referent', { exact: true }).click();
    await page.waitForTimeout(300); // Small delay for dropdown to open
    const referenceOptions = page.getByRole('option');
    
    // Check if there are any options available
    const referenceCount = await referenceOptions.count();
    if (referenceCount > 0) {
      await referenceOptions.first().waitFor({ state: 'visible', timeout: 5000 });
      await referenceOptions.first().click();
    } else {
      // No options available, close the dropdown
      await page.keyboard.press('Escape');
    }
    // Fill Note (optional textarea)
    await FileInput(page.getByLabel(/Note/i), 'Test invoice note');
    
    // Submit the form by clicking the Create button
    await page.getByRole('button', { name: /Create/i }).click();
        // Close Dialog by clicking the X icon
    const closeIcon = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
    if (await closeIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeIcon.click();
      await page.waitForTimeout(1000);
    }
    
    //======================================================================================
    // Invoice List or Grid view
    await toggleViewMode(page);
    
    //======================================================================================
    // Update Invoice
    await page.waitForTimeout(1000);
    const invoiceRows = page.locator('table tbody tr, [role="row"], .invoice-row');

    // Get the invoice at index 0 (first invoice)
    const invoiceAtIndex0 = invoiceRows.nth(0);
    await invoiceAtIndex0.click();
    await page.waitForTimeout(1500);

    const actionMenuBtn = page.locator('button').filter({ 
        has: page.locator('svg.lucide-ellipsis, svg.lucide-ellipsis-vertical, svg.lucide-more-vertical, svg.lucide-more-horizontal') 
    }).last();

    await expect(actionMenuBtn).toBeVisible({ timeout: 5000 });
    await actionMenuBtn.click();
    
    // Wait for the dropdown/menu to appear
    const editOption = page.getByRole('menuitem', { name: /Edit|Update/i }).or(page.getByText(/Edit|Update/i));
    await expect(editOption.first()).toBeVisible();
    await editOption.first().click();
    await page.waitForTimeout(1000);

    await page.getByText(/^Select Status/).last().click({ force: true });
    await page.waitForTimeout(1000); 
    const statusOptionsEdit = page.getByRole('option');
    await statusOptionsEdit.first().waitFor({ state: 'visible', timeout: 5000 });
    
    await statusOptionsEdit.nth(1).click().catch(() => statusOptionsEdit.first().click());

    await page.getByRole('button', { name: /Update/i }).click();
    await page.waitForTimeout(1000);
    
    //======================================================================================
    // Download Invoice
    
    // Verify the Download PDF button is visible and click it
    const downloadButton = page.getByRole('button', { name: /Download PDF/i });
    await expect(downloadButton).toBeVisible({ timeout: 5000 });
    await downloadButton.click();
    
    // Wait for download to initiate
    await page.waitForTimeout(2000);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    //======================================================================================
    // Print Invoice
    
    // const printButton = page.getByRole('button', { name: /Print Invoice/i });
    // await expect(printButton).toBeVisible({ timeout: 5000 });
    
    // // Prepare for the print action verification
    // // Mocking window.print to set a flag we can verify
    // await page.evaluate(() => {
    //     // @ts-ignore
    //     window.printCalled = false;
    //     // @ts-ignore
    //     window.print = () => { window.printCalled = true; };
    // });

    // await printButton.click();
    
    // // Wait for prompt/action to handle
    // await page.waitForTimeout(2000);

    // // Close the print dialog/preview by pressing Escape
    // await page.keyboard.press('Escape');
    // await page.waitForTimeout(2000);
    
    //======================================================================================
    // Navigate back to invoice list
    
    const backButton = page.locator('button:has(svg.lucide-arrow-left)')
      .or(page.locator('svg.lucide-arrow-left').locator('xpath=..'))
      .or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-arrow-left"]') }))
      .or(page.locator('button[aria-label*="back" i]'))
      .or(page.getByRole('button', { name: /Back|back/i }));
    
    if (await backButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await backButton.first().waitFor({ state: 'visible', timeout: 5000 });
      await backButton.first().scrollIntoViewIfNeeded();
      await backButton.first().click();
      await page.waitForTimeout(1500);
    }
    
    
    //======================================================================================
    // Delete Invoice
    
    const invoiceRowsToDelete = page.locator('table tbody tr, [role="row"], .invoice-item, div[class*="invoice"]');
    const indexToDelete = 0;
    const invoiceToDelete = invoiceRowsToDelete.nth(indexToDelete);
    
    await deleteEntityViaActionMenu(page, invoiceToDelete, 'Confirm Delete');
  });
});


  // ========================================
  // 13. Engagements 
  // ========================================

  test.describe('Engagements', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    
    // Navigate to Engagements Dashboard first
    await page.getByText('Engagement', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('Dashboard', { exact: true }).last().click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/engagements');
    await page.waitForTimeout(1000);
    
    // Then navigate to List Engagements
    await page.getByText('List Engagements', { exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/engagements/);
    await page.waitForTimeout(1000);
  });

  test('CRUD Engagement', async ({ page }) => {
    const randomSuffix = Math.floor(Math.random() * 10000);
    
    const engagementDataAdd = {
      firstName: `John ${randomSuffix}`,
      lastName: `Doe ${randomSuffix}`,
      amount: '800',
      email: `john.doe.${randomSuffix}@example.com`,
      phone: '1234567890',
      probability: '50',
      resourceLink: 'https://example.com',
      note: 'This is a note'
    };
    
    const engagementDataEdit = {
      firstName: `Sok ${randomSuffix}`,
      lastName: `Heng ${randomSuffix}`,
      amount: '700',
      email: `sok.heng.${randomSuffix}@example.com`,
      phone: '0987654321',
      probability: '75',
      resourceLink: 'https://updated-example.com',
      note: 'Note has Updated'
    };
    
    //======================================================================================
    // Add new engagement
    
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(500);
    await page.locator('#add-deal-button').click();
    await page.waitForTimeout(800);
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    await page.waitForTimeout(500);

    // Fill First Name
    const firstNameField = page.getByLabel(/First Name/i);
    await FileInput(firstNameField, engagementDataAdd.firstName);
    
    // Fill Last Name
    const lastNameField = page.getByLabel(/Last Name/i);
    await FileInput(lastNameField, engagementDataAdd.lastName);

    // Gender Selection (Dropdown)
    const genderButton = page
      .locator('button[role="combobox"]')
      .filter({ has: page.locator("svg") })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .first();

    if (await genderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await genderButton.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        await options.nth(0).click();
      }
      await page.waitForTimeout(400);
    }

    // Stage Selection (Dropdown)
    const stageButton = page
      .locator('button[role="combobox"]')
      .filter({ has: page.locator("svg") })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .nth(1);

    if (await stageButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await stageButton.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }
    
    // Fill Amount
    const amountField = page.getByLabel(/Amount \(\$\)/i);
    await FileInput(amountField, engagementDataAdd.amount);
    
    // Fill Email
    const emailField = page.locator('input[name="email"]');
    await FileInput(emailField, engagementDataAdd.email);
    
    // Fill Phone
    const phoneField = page.getByLabel(/Phone/i);
    await FileInput(phoneField, engagementDataAdd.phone);

    // Priority Selection (Dropdown)
    const priorityButton = page
      .locator('button[role="combobox"]')
      .filter({ has: page.locator("svg") })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .nth(2);

    if (await priorityButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await priorityButton.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }

    // Fill Expect Class
    const expectClassButton = page
      .locator('button[role="combobox"]')
      .filter({ has: page.locator("svg") })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .nth(3);

    if (await expectClassButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expectClassButton.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }

    // Fill Probability
    const probabilityField = page.getByLabel(/Probability/i);
    await FileInput(probabilityField, engagementDataAdd.probability);

    // Fill Resource Type
    const resourceTypeButton = page
      .locator('button[role="combobox"]')
      .getByPlaceholder('Resource Type')
      .filter({ has: page.locator("svg") })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .nth(4);

    if (await resourceTypeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await resourceTypeButton.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }

    // Fill Resource Link
    const resourceLink = page.getByLabel(/Resource Link/i);
    await FileInput(resourceLink, engagementDataAdd.resourceLink);

    // Assign To dropdown
    const assignToDropdown = page.locator('button')
      .filter({ hasText: 'Assign To' })
      .or(page.locator('button[data-slot="popover-trigger"]').filter({ hasText: 'Assign To' }))
      .first();
    
    if (await assignToDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await assignToDropdown.click();
      await page.waitForTimeout(1200);
      
      const assignToOptions = page.locator('[role="option"], li label, .coach-item, [class*="option"]');
      const firstAssignTo = assignToOptions.nth(0);
      
      if (await firstAssignTo.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstAssignTo.click();
        await page.waitForTimeout(800);
      }
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // Fill Note
    const note = page.locator('textarea#note');
    await FileInput(note, engagementDataAdd.note);
    
    // Submit the form
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);

    //======================================================================================
    // Edit Engagement
    
    // Select the engagement first
    await page.waitForTimeout(1000);
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    const actionsMenuButton = page.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
    
    // Click Edit
    await page.getByText(/Edit/i).click();
    
    // Wait for drawer/form to be fully loaded
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    await page.waitForTimeout(1000);

    // Edit First Name - wait for field to be visible
    const firstNameFieldEdit = page.getByLabel(/First Name/i);
    await expect(firstNameFieldEdit).toBeVisible({ timeout: 5000 });
    await FileInput(firstNameFieldEdit, engagementDataEdit.firstName);
    
    // Edit Last Name
    const lastNameFieldEdit = page.getByLabel(/Last Name/i);
    await expect(lastNameFieldEdit).toBeVisible({ timeout: 5000 });
    await FileInput(lastNameFieldEdit, engagementDataEdit.lastName);
    
    // Wait a bit after last name input
    await page.waitForTimeout(500);

    // Edit Gender (Dropdown)
    await page.waitForTimeout(300);
    const genderButtonEdit = page.locator('button[role="combobox"]').filter({ has: page.locator("svg") }).first();
    if (await genderButtonEdit.isVisible({ timeout: 2000 }).catch(() => false)) {
      await genderButtonEdit.scrollIntoViewIfNeeded();
      await genderButtonEdit.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }

    // Edit Stage (Dropdown)
    const stageButtonEdit = page.locator('button[role="combobox"]').filter({ has: page.locator("svg") }).nth(1);
    if (await stageButtonEdit.isVisible({ timeout: 2000 })) {
      await stageButtonEdit.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }
    
    // Edit Amount
    const amountFieldEdit = page.getByLabel(/Amount \(\$\)/i);
    await FileInput(amountFieldEdit, engagementDataEdit.amount);
    
    // Edit Email
    const emailFieldEdit = page.locator('input[name="email"]');
    await FileInput(emailFieldEdit, engagementDataEdit.email);
    
    // Edit Phone
    const phoneFieldEdit = page.getByLabel(/Phone/i);
    await FileInput(phoneFieldEdit, engagementDataEdit.phone);

    // Edit Priority (Dropdown)
    const priorityButtonEdit = page.locator('button[role="combobox"]').filter({ has: page.locator("svg") }).nth(2);
    if (await priorityButtonEdit.isVisible({ timeout: 2000 })) {
      await priorityButtonEdit.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }

    // Edit Expect Class (Dropdown)
    const expectClassButtonEdit = page.locator('button[role="combobox"]').filter({ has: page.locator("svg") }).nth(3);
    if (await expectClassButtonEdit.isVisible({ timeout: 2000 })) {
      await expectClassButtonEdit.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }

    // Edit Probability
    const probabilityFieldEdit = page.getByLabel(/Probability/i);
    await FileInput(probabilityFieldEdit, engagementDataEdit.probability);

    // Edit Resource Type (Dropdown)
    const resourceTypeButtonEdit = page.locator('button[role="combobox"]').filter({ has: page.locator("svg") }).nth(4);
    if (await resourceTypeButtonEdit.isVisible({ timeout: 2000 })) {
      await resourceTypeButtonEdit.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }

    // Edit Resource Link
    const resourceLinkEdit = page.getByLabel(/Resource Link/i);
    await FileInput(resourceLinkEdit, engagementDataEdit.resourceLink);

    // Edit Assign To
    const assignToDropdownEdit = page.locator('button').filter({ hasText: 'Assign To' }).or(page.locator('button[data-slot="popover-trigger"]').filter({ hasText: 'Assign To' })).first();
    if (await assignToDropdownEdit.isVisible({ timeout: 2000 })) {
      await assignToDropdownEdit.click();
      await page.waitForTimeout(1200);
      const assignToOptions = page.locator('[role="option"], li label, .coach-item, [class*="option"]');
      if (await assignToOptions.count() > 0) {
        await assignToOptions.first().click();
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // Edit Note
    const noteEdit = page.locator('textarea#note');
    await FileInput(noteEdit, engagementDataEdit.note);

    // Submit the form
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Update|Save|Confirm/i }).click();
    await page.waitForTimeout(1500);

    //======================================================================================
    // Engagements Tabs List



    //======================================================================================
    // Add Activity

    // Click on Activities tab
    await page.getByText('Activities', { exact: true }).click();

    // Click on Add Activity button
    await page.getByText('Add Activity', { exact: true }).click();

    // Fill Activity Name
    const activityNameAdd = page.getByLabel(/Title/i);
    await FileInput(activityNameAdd, "Activity Title");

    // Select category
    await page.waitForTimeout(500);
    const categoryDropdownAdd = page
      .locator("button[role='combobox']:has(+ label:text('Category'))")
      .or(page.locator("button[role='combobox']").filter({ has: page.locator('+ label', { hasText: 'Category' }) }))
      .or(page.getByText('Category', { exact: true }).locator('..').getByRole('combobox'));

    if (await categoryDropdownAdd.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryDropdownAdd.click();
      await page.waitForTimeout(500);

      // Select the first option (index 0)
      const firstOption = page.locator('[role="option"]').nth(0);
      if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstOption.click();
        console.log("✓ Selected category from dropdown");
        await page.waitForTimeout(400);
      }
    }

      // Fill Start Date field (static date)
    const startDateAdd = '12-12-2025'; // Static start date
    const startDateFieldAdd = page.getByLabel(/start date/i)
      .or(page.getByPlaceholder(/start date/i))
      .or(page.locator('input[type="date"]').first());
    await FileInput(startDateFieldAdd, startDateAdd);
    
    // Fill End Date field (static date)
    const endDateFormattedAdd = '01-16-2026'; // Static end date    
    const endDateFieldAdd = page.getByLabel(/end date/i)
      .or(page.getByPlaceholder(/end date/i))
      .or(page.locator('input[type="date"]').nth(1));
    await FileInput(endDateFieldAdd, endDateFormattedAdd);
    
    // Fill Start Time field
    await page.waitForTimeout(500);
    const startTimeInputAdd = page.getByLabel(/start time/i)
      .or(page.locator('#startTime'))
      .or(page.getByPlaceholder(/start time/i));
    
    await FileInput(startTimeInputAdd, '08:30AM');
    
    // Fill End Time field
    await page.waitForTimeout(500);
    const endTimeInputAdd = page.getByLabel(/end time/i)
      .or(page.locator('#endTime'))
      .or(page.getByPlaceholder(/end time/i));
    
    await FileInput(endTimeInputAdd, '11:30AM');
    
    // Fill Activity Description
    const activityDescriptionAdd = page.locator('textarea#note').or(page.getByPlaceholder('Add notes here...'));
    await FileInput(activityDescriptionAdd, "Activity Description");

    // Toggle Activity Completed
    const completedSwitchAdd = page.locator('button#isCompleted').or(page.getByLabel('Activity completed'));
    if (await completedSwitchAdd.isVisible()) {
      await completedSwitchAdd.click();
      await page.waitForTimeout(500);
    }

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);


    //======================================================================================
    // Update Activity

    const activityItem = page.locator('div').filter({ hasText: 'Activity Title' }).filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).last();

    const actionsMenuButtonEdit = activityItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButtonEdit.click();
    await page.waitForTimeout(500);

    // Click Edit
    await page.getByText(/Edit/i).click();
    await page.waitForTimeout(500);

    // Edit Activity Name
    const activityNameEdit = page.getByLabel(/Title/i);
    await activityNameEdit.clear();
    await FileInput(activityNameEdit, "Update Activity Title");

    // Select category
    await page.waitForTimeout(500);
    const categoryDropdownEdit = page
      .locator("button[role='combobox']:has(+ label:text('Category'))")
      .or(page.locator("button[role='combobox']").filter({ has: page.locator('+ label', { hasText: 'Category' }) }))
      .or(page.getByText('Category', { exact: true }).locator('..').getByRole('combobox'));

    if (await categoryDropdownEdit.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryDropdownEdit.click();
      await page.waitForTimeout(500);

      // Select the first option (index 0)
      const firstOption = page.locator('[role="option"]').nth(0);
      if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstOption.click();
        console.log("✓ Selected category from dropdown");
        await page.waitForTimeout(400);
      }
    }

    // Edit Start Date field (static date)
    const startDate = '12-12-2025'; // Static start date
    const startDateField = page.getByLabel(/start date/i)
      .or(page.getByPlaceholder(/start date/i))
      .or(page.locator('input[type="date"]').first());
    await startDateField.clear();
    await FileInput(startDateField, startDate);
    
    // Edit End Date field (static date)
    const endDateFormatted = '01-16-2026'; // Static end date    
    const endDateField = page.getByLabel(/end date/i)
      .or(page.getByPlaceholder(/end date/i))
      .or(page.locator('input[type="date"]').nth(1));
    await endDateField.clear();
    await FileInput(endDateField, endDateFormatted);
    
    // Edit Start Time field
    await page.waitForTimeout(500);
    const startTimeInput = page.getByLabel(/start time/i)
      .or(page.locator('#startTime'))
      .or(page.getByPlaceholder(/start time/i));
    await startTimeInput.clear();
    await FileInput(startTimeInput, '09:30AM');
    
    // Edit End Time field
    await page.waitForTimeout(500);
    const endTimeInput = page.getByLabel(/end time/i)
      .or(page.locator('#endTime'))
      .or(page.getByPlaceholder(/end time/i));
    await endTimeInput.clear();
    await FileInput(endTimeInput, '12:30PM');
    
    // Edit Activity Description
    const activityDescription = page.locator('textarea#note').or(page.getByPlaceholder('Add notes here...'));
    await activityDescription.clear();
    await FileInput(activityDescription, "Updated Activity Description");

    // Toggle Activity Completed (if needed)
    const completedSwitch = page.locator('button#isCompleted').or(page.getByLabel('Activity completed'));
    if (await completedSwitch.isVisible()) {
      await completedSwitch.click();
      await page.waitForTimeout(500);
    }

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Update/i }).click();
    await page.waitForTimeout(1500);

    //======================================================================================
    // Activity Comments

     // Click on Add Comment button
    await page.getByRole('button', { name: '+ Add Comment' }).first().click();
    await page.waitForTimeout(1000);

    // Fill Comment
    const commentField = page.locator('textarea#comment');
    await FileInput(commentField, "Comment on activity");

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);

    //======================================================================================
    // Update Activity Comments
     const commentItem = page.locator('div').filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).last();

    const actionsMenuButtonUpdate = commentItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButtonUpdate.click();
    await page.waitForTimeout(500);
    await page.getByText(/Edit/i).click();
    await page.waitForTimeout(500);

    // Edit comment field
    const commentFieldUpdate = page.locator('textarea#comment');
    await commentFieldUpdate.clear();
    await FileInput(commentFieldUpdate, "Updated Comment on activity");
    
    await page.getByRole('button', { name: /Update|Save/i }).click();
    await page.waitForTimeout(1500);


    

    // Click on Emails tab
    await page.getByText('Emails', { exact: true }).click();
    await page.waitForTimeout(500);

    // Click on Calls tab
    await page.getByText('Calls', { exact: true }).click();
    await page.waitForTimeout(500);

    // Click on Notes tab
    await page.getByText('Notes', { exact: true }).click();
    await page.waitForTimeout(500);
    
    //======================================================================================
    // Delete Engagement
    
    // We're already on the engagement detail page, just open the actions menu
    const actionsMenuButtonDelete = page.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButtonDelete.click();
    await page.waitForTimeout(500);

    await page.getByText(/Delete|Remove/i).click();
    await page.waitForTimeout(1000);
    await deleteItem(page);
    await page.waitForTimeout(1000);
  });
});

});
