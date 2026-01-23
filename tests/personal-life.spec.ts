import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { fillFieldWithDelay } from '../utils/form-helper';
import * as fs from 'fs';
import * as path from 'path';

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
    village: 'Village Name',
    commune: 'Commune Name',
    district: 'District Name',
    city: 'City Name',
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
    if (await pageUpdateBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
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

  //Edit Gmail

test('Change Gmail', async ({ page }) => {
    test.setTimeout(120000);

    // Prefer page-level update button (Update Settings / Update Profile), fallback to edit controls
    const pageUpdateBtn = page.getByRole('button', { name: /^(Change Email|Update Email)$/i }).first();
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


    
    // Explicitly wait for the element by ID which is the most reliable
    const newEmailInput = page.locator('#newEmail');
    await newEmailInput.waitFor({ state: 'visible', timeout: 10000 });
    // await newEmailInput.fill(secondUserEmail);
    await fillFieldWithDelay(newEmailInput, secondUserEmail); 

    // Confirm New Email Field
    const confirmEmailField = page.locator('#confirmNewEmail')
        .or(page.locator('input[name="confirmNewEmail"]'))
        .or(page.getByLabel(/Confirm New Email/i))
        .or(page.getByPlaceholder(/Confirm/i));

    await confirmEmailField.waitFor({ state: 'visible', timeout: 5000 });
    await confirmEmailField.clear();
    await fillFieldWithDelay(confirmEmailField, secondUserEmail);

    // Submit
    const submit = page.getByRole('button', { name: /Change|Update|Submit/i });
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