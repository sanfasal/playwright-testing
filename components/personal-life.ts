import { Page, expect } from '@playwright/test';
import { FileInput } from '../utils/form-helper';
import { uploadThumbnail } from '../utils/upload-thumbnail-helper';
import { getOTPFromEmail } from '../utils/email-helper';
import { updateUserEmail, updateUserPassword } from '../utils/data-store';
import path from 'path';

const ICONS = {
  eyeOff: '.lucide-eye-off',
  eye: '.lucide-eye',
} as const;

/**
 * Edits the profile of the current user.
 * @param page - Playwright Page object
 * @param personalDataEdit - Object containing new profile data
 */
export async function editProfile(page: Page, personalDataEdit: any) {
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
    await uploadThumbnail(page, "file-input-profile || selected-exist-profile", {
          imagePath: path.join(__dirname, '..', 'public', 'images', 'profile-update.png')
        });  
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
}

/**
 * Changes the user's email.
 * @param page - Playwright Page object
 * @param currentEmail - The current email address
 * @param targetEmail - The new email address
 * @param targetApiKey - API key for the new email's OTP service
 * @param targetNamespace - Namespace for the new email's OTP service
 */
export async function changeEmail(page: Page, currentEmail: string, targetEmail: string, targetApiKey: string, targetNamespace: string) {
    // Initiate Email Change
    const pageUpdateBtn = page.getByRole('button', { name: /^(Change Email|Update Email)$/i }).first();
    if (await pageUpdateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await pageUpdateBtn.click();
    await page.waitForTimeout(600);
    } else {
    const rows = page.locator('table tbody tr, [role="row"], .personal-life-item, div[class*="personal-life"]');
    const row = rows.nth(0);
    if (!(await row.isVisible({ timeout: 3000 }).catch(() => false))) {
        // console.warn("Could not find Personal Life row/table. Test might fail.");
    }
    const editBtn = row.getByRole('button', { name: /Edit|Update/i }).first().or(row.locator('button').filter({ has: page.locator('svg') }).first());
    if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editBtn.click();
        await page.waitForTimeout(600);
    }
    }

    // Fill New Email
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

    // Verify OTP
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
}

/**
 * Updates the user's password.
 * @param page - Playwright Page object
 * @param currentEmail - The current email address
 * @param currentPassword - The current password
 * @param newPassword - The new password
 */
export async function updatePassword(page: Page, currentEmail: string, currentPassword: string, newPassword: string) {
    // Prefer page-level update button (Update Settings / Update Profile), fallback to edit controls
    const updatePwdBtn = page.getByRole('button', { name: /^(Update Password|Change Password)$/i });
    await updatePwdBtn.scrollIntoViewIfNeeded().catch(() => null);
    await updatePwdBtn.click().catch(() => null);

    // Current Password
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
}
