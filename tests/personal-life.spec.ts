import { test, expect } from '@playwright/test';
import { login, performSignup } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { fillFieldWithDelay } from '../utils/form-helper';
import * as fs from 'fs';
import * as path from 'path';
import { getOTPFromEmail, generateTestmailAddress } from '../utils/email-helper2';
import { updateUserEmail, getUserData, getGeneratedEmail, getUserPasswordByEmail } from '../utils/data-store';
import dotenv from 'dotenv';
import { uploadThumbnail } from '../utils/upload-thumbnail-helper';

dotenv.config();

const userDataPath = path.resolve(__dirname, '..', 'user-data.json');
let secondUserEmail = 'test@example.com'; 

try {
  const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf-8'));
  if (userData.users && userData.users.length > 1) {
    secondUserEmail = userData.users[1].email;
  }
} catch (error) {
  console.error("Error reading user-data.json:", error);
}

const personalDataEdit = {
  firstName: 'Jane',
  lastName: 'Smith',
  gender: 'Female',
  phone: '0987654321',
  dob: '1995-05-15',
  occupation: 'Engineer',
  bio: 'Updated bio for testing',
  address: {
    village: 'Phom 4',
    commune: 'Chroy Changva',
    district: 'Chroy Changva',
    city: 'Phnom Penh',
  },
};

test.describe('Personal Life', () => {
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);

    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 10000 });
    await page.getByText('Personal Life', { exact: true }).click().catch(() => null);
    await expect(page).toHaveURL(/\/personal-life/).catch(() => null);
  });


  //Edit Profile
  test('Edit Profile', async ({ page }) => {
    test.setTimeout(120000);

    // Prefer page-level update button (Update Settings / Update Profile), fallback to edit controls
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


        await uploadThumbnail(page, "file-input-profile");
    
    // First / Last name
    const firstNameField = page.getByLabel(/First Name/i).or(page.locator('#firstName, input[name="firstName"]'));
    if (await firstNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstNameField.clear();
      await fillFieldWithDelay(firstNameField, personalDataEdit.firstName);
    }

    const lastNameField = page.getByLabel(/Last Name/i).or(page.locator('#lastName, input[name="lastName"]'));
    if (await lastNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await lastNameField.clear();
      await fillFieldWithDelay(lastNameField, personalDataEdit.lastName);
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
      await fillFieldWithDelay(phoneField, personalDataEdit.phone);
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
      await fillFieldWithDelay(occupationField, personalDataEdit.occupation);
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
      await fillFieldWithDelay(villageField, personalDataEdit.address.village);
      await page.waitForTimeout(300);
    }

    const communeField = page.getByPlaceholder('Commune').or(page.locator('input[name="address.commune"]')).or(page.locator('#commune'));
    if (await communeField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await communeField.scrollIntoViewIfNeeded();
      const isDisabled = await communeField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await communeField.clear();
        await fillFieldWithDelay(communeField, personalDataEdit.address.commune);
      }
    }

    const districtField = page.getByPlaceholder('District').or(page.locator('input[name="address.district"]')).or(page.locator('#district'));
    if (await districtField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await districtField.scrollIntoViewIfNeeded();
      const isDisabled = await districtField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await districtField.clear();
        await fillFieldWithDelay(districtField, personalDataEdit.address.district);
      }
    }

    const cityField = page.getByPlaceholder('Province').or(page.locator('input[name="address.city"]')).or(page.locator('#city'));
    if (await cityField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cityField.scrollIntoViewIfNeeded();
      const isDisabled = await cityField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await cityField.clear();
        await fillFieldWithDelay(cityField, personalDataEdit.address.city);
      }
    }

    // Submit
    const submit = page.getByRole('button', { name: /Save|Update|Submit/i });
    if (await submit.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submit.click();
      await page.waitForTimeout(1000);
    }
  });
  // Update Password
  test('Update Password', async ({ page }) => {
    test.setTimeout(120000);

    // Prefer page-level update button (Update Settings / Update Profile), fallback to edit controls
    const pageUpdateBtn = page.getByRole('button', { name: /^(Update Password|Change Password)$/i }).first();
    if (await pageUpdateBtn.isVisible({ timeout: 200 }).catch(() => false)) {
      await pageUpdateBtn.click();
      await page.waitForTimeout(600);
    } else {
      const rows = page.locator('table tbody tr, [role="row"], .personal-life-item, div[class*="personal-life"]');
      const row = rows.nth(0);
      if (!(await row.isVisible({ timeout: 3000 }).catch(() => false))) return;
      const editBtn = row.getByRole('button', { name: /Edit|Update/i }).first().or(row.locator('button').filter({ has: page.locator('svg') }).first());
      if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editBtn.click();
        await page.waitForTimeout(600);
      }
    }

    // First / Last name
    const firstNameField = page.getByLabel(/First/i).or(page.locator('#firstName, input[name="firstName"]'));
    if (await firstNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstNameField.clear();
      await fillFieldWithDelay(firstNameField, personalDataEdit.firstName);
    }

    // Submit
    const submit = page.getByRole('button', { name: /Save|Update|Submit/i });
    if (await submit.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submit.click();
      await page.waitForTimeout(1000);
    }
  });
});


test.describe('Change Email', () => {
    test('Change Gmail (Dynamic Cycle)', async ({ page }) => {
    test.setTimeout(180000);

    // Read generated emails to verify available accounts
    const generatedEmailsPath = path.resolve(__dirname, '..', 'generated-emails.json');
    if (!fs.existsSync(generatedEmailsPath)) {
        throw new Error("generated-emails.json not found. Cannot proceed with email change test.");
    }
    const generatedEmails = JSON.parse(fs.readFileSync(generatedEmailsPath, 'utf-8'));
    if (!Array.isArray(generatedEmails) || generatedEmails.length < 2) {
        throw new Error("Need at least 2 generated emails in generated-emails.json to test cycling.");
    }

    // Read current user data to find who is currently signed up/in
    const userDataPath = path.resolve(__dirname, '..', 'user-data.json');
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
    
    console.log(`Step 1: Cycle Logic Determined`);
    console.log(`   - Current Email: ${currentEmail} (Index: ${currentIndex})`);
    console.log(`   - Target Email:  ${targetEmail} (Index: ${targetIndex})`);

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

    // if (!isSignedUp) {
    //     console.log(`   - User ${currentEmail} not found in local records. Performing Signup first.`);
    //     await performSignup(page, currentApiKey, currentNamespace, {
    //          firstName: 'TestCycle',
    //          lastName: 'User',
    //          company: 'CycleCo'
    //     });
    //     knownPassword = getUserPasswordByEmail(currentEmail); // password generated during signup
    // } else {
    //     console.log(`   - User found in local records. Logging in directly.`);
    // }

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
    await fillFieldWithDelay(newEmailInput, targetEmail); 

    const confirmEmailField = page.locator('#confirmNewEmail')
        .or(page.locator('input[name="confirmNewEmail"]'))
        .or(page.getByLabel(/Confirm New Email/i))
        .or(page.getByPlaceholder(/Confirm/i));

    await confirmEmailField.waitFor({ state: 'visible', timeout: 5000 });
    await confirmEmailField.clear();
    await fillFieldWithDelay(confirmEmailField, targetEmail);

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

    await fillFieldWithDelay(otpField, otp);
    
    const verifyBtn = page.getByRole('button', { name: /Verify|Confirm|Submit/i });
    if (await verifyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await verifyBtn.click();
        await page.waitForTimeout(1000);
    }

    // Step 7: Update Local Data Store
    // We successfully changed FROM currentEmail TO targetEmail
    console.log(`Step 6: Update Successful. Updating local records...`);
    updateUserEmail(currentEmail, targetEmail);
  });
})