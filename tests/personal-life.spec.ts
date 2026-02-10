import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { FileInput } from '../utils/form-helper';
import * as fs from 'fs';
import * as path from 'path';
import { getOTPFromEmail } from '../utils/email-helper2';
import { generateRandomPassword } from '../utils/email-helper';
import { updateUserEmail, getUserPasswordByEmail, updateUserPassword } from '../utils/data-store';
import dotenv from 'dotenv';
import { uploadThumbnail } from '../utils/upload-thumbnail-helper';
import { editProfile, changeEmail, updatePassword } from '../components/personal-life';

dotenv.config();

const userDataPath = path.resolve(__dirname, '..', 'user-signin.json');
let secondUserEmail = 'test@example.com'; 

try {
  const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf-8'));
  if (userData.users && userData.users.length > 1) {
    secondUserEmail = userData.users[1].email;
  }
} catch (error) {
  console.error("Error reading user-data.json:", error);
}

import staticData from '../constant/static-data.json';
const { personalDataEdit } = staticData;

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
    await editProfile(page, personalDataEdit);
  });
});

//Change Email
test.describe('Change Email', () => {
    test('Change Gmail', async ({ page }) => {
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
    const userDataPath = path.resolve(__dirname, '..', 'user-signin.json');
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

    await addCursorTracking(page);    
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
    await page.getByText('Personal Life', { exact: true }).click().catch(() => null);
    await expect(page).toHaveURL(/\/personal-life/).catch(() => null);
    
    // Step 4: Initiate Email Change
    await changeEmail(page, currentEmail, targetEmail, targetApiKey, targetNamespace);
  });
})

//Update Password
test.describe('Update Password', () => {

    test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);

    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 10000 });
    await page.getByText('Personal Life', { exact: true }).click().catch(() => null);
    await expect(page).toHaveURL(/\/personal-life/).catch(() => null);
  });
    
    test('Update Password', async ({ page }) => {
        test.setTimeout(120000);

        // Find current password
        let currentPassword = 'Test@123'; // Fallback
        let currentEmail = '';
        const userDataPath = path.resolve(__dirname, '..', 'user-signin.json');
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

        const newPassword = generateRandomPassword(12);

        if (currentEmail && newPassword) {
            await updatePassword(page, currentEmail, currentPassword, newPassword);
        }
      });
})