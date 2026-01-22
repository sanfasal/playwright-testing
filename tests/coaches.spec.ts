import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { fillFieldWithDelay } from '../utils/form-helper';
import { deleteEntityViaActionMenu } from '../utils/delete-helper';

import { uploadThumbnail } from '../utils/upload-thumbnail-helper';
import { toggleViewMode } from '../utils/view-helper';
import { generateTestmailAddress } from '../utils/email-helper';



// Test data for adding a new coach
const coachDataAdd = {
  firstName: 'Michael',
  lastName: 'Johnson',
  email: 'michael2.johnson@gmail.com',
  phone: '0975566888',
  telegram: '@coach_michael',
  idNumber: '1234567890',
  abaAccountName: 'Michael Johnson',
  abaAccountNumber: '001234567890',
  major: 'Computer Science',
  costPerHour: '10',
}

// Test data for editing a coach (different values to verify edit works)
const coachDataEdit = {
  firstName: 'Sarah',
  lastName: 'Williams',
  email: 'sarah.williams@gmail.com',
  phone: '0987654321',
  telegram: '@coach_sarah',
  idNumber: '0987654321',
  abaAccountName: 'Sarah Williams',
  abaAccountNumber: '009876543210',
  major: 'Mathematics',
  costPerHour: '15',
}

// Test suite for Coach List
test.describe('Coach List', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    
    // Verify we are on dashboard
    await expect(page).toHaveURL(/dashboard/);

    // Wait for the loading screen to disappear
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    
    // Click on Coach to navigate to Coaches page
    await page.getByText('Coach', { exact: true }).click();
    await expect(page).toHaveURL(/\/coaches/);
    await page.waitForTimeout(1000);
  });

  // ===================================
  // View coaches page
  // ===================================
  test('Coach Page', async ({ page }) => {
    await expect(page).toHaveTitle(/Coach/i);
    await page.waitForTimeout(1000);
    await toggleViewMode(page);
    await page.waitForTimeout(1000);
  });

  // ===================================
  // Add new coach
  // ===================================
  test('Add new coach', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes for complex multi-tab form
    
    // Click Add button
    await page.getByRole('button').filter({ has: page.locator('svg.lucide-plus') }).click();
    await page.waitForTimeout(1000);

    // ===== BASIC INFORMATION TAB =====
    
    // Upload Profile Image
    await uploadThumbnail(page, 'upload profile');
    
    // Personal Details
    const firstNameField = page.getByLabel(/First Name/i).or(page.locator('#firstName, input[name="firstName"]'));
    await fillFieldWithDelay(firstNameField, coachDataAdd.firstName);
    
    const lastNameField = page.getByLabel(/Last Name/i).or(page.locator('#lastName, input[name="lastName"]'));
    await fillFieldWithDelay(lastNameField, coachDataAdd.lastName);
    
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
    
    // Contact Information
    const emailField = page.getByLabel(/Email/i).or(page.locator('#email, input[name="email"]'));
    // Generate a unique email for this test run. Use gmail-style alias if requested via env.
    const useGmail = (process.env.TESTMAIL_USE_GMAIL || '').toLowerCase() === 'true';
    const testEmail = useGmail
      ? `${coachDataAdd.firstName.toLowerCase()}.${coachDataAdd.lastName.toLowerCase()}+${Date.now()}@gmail.com`
      : generateTestmailAddress(process.env.TESTMAIL_NAMESPACE || 'coachName', String(Date.now()));
    console.log('Using test email for new coach:', testEmail);
    await fillFieldWithDelay(emailField, testEmail);

    const dobField = page.getByLabel(/Date of Birth/i).or(page.locator('input[name="dateOfBirth"]'));
    if (await dobField.isVisible({ timeout: 2000 }).catch(() => false)) {
      const today = new Date();
      const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      await dobField.scrollIntoViewIfNeeded();
      await dobField.click();
      await page.waitForTimeout(300);
      await dobField.fill(todayFormatted);
      await page.waitForTimeout(400);
    }
    
    const phoneField = page.getByLabel(/Phone/i).or(page.locator('input[name="phone"]'));
    if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fillFieldWithDelay(phoneField, coachDataAdd.phone);
    }
    
    const telegramField = page.getByPlaceholder(/Telegram/i).or(page.locator('input[name="telegram"]'));
    if (await telegramField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fillFieldWithDelay(telegramField, coachDataAdd.telegram);
    }

    // Professional & Banking Information
    const idNumberField = page.getByLabel(/ID Number/i).or(page.locator('input[name="idNumber"]'));
    if (await idNumberField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fillFieldWithDelay(idNumberField, coachDataAdd.idNumber);
    }

    const abaAccountNameField = page.getByLabel(/ABA Account Name/i).or(page.locator('input[name="ABAAccountName"]'));
    if (await abaAccountNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fillFieldWithDelay(abaAccountNameField, coachDataAdd.abaAccountName);
    }

    const abaAccountNumberField = page.getByLabel(/ABA Account Number/i).or(page.locator('input[name="ABAAccountNumber"]'));
    if (await abaAccountNumberField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fillFieldWithDelay(abaAccountNumberField, coachDataAdd.abaAccountNumber);
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
      await fillFieldWithDelay(majorField, coachDataAdd.major);
    }

    const coursePerHourField = page.getByLabel(/Course Per Hour/i).or(page.locator('input[name="costPerHour"]'));
    if (await coursePerHourField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fillFieldWithDelay(coursePerHourField, coachDataAdd.costPerHour);
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
      await fillFieldWithDelay(villageField, 'Toul Kork');
      // Use Tab to ensure natural user behavior and trigger blur events
      await villageField.press('Tab'); 
      // Wait for address fields to become enabled
      await page.waitForTimeout(1000);
    }

    // Commune / Songkat (if exists)
    // Handle both text inputs and comboboxes (dropdowns)
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
      await fillFieldWithDelay(targetCommune, 'Prek leab');
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
        await fillFieldWithDelay(districtField, 'Phnom Penh');
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
        await fillFieldWithDelay(cityField, 'Phnom Penh');
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
        await fillFieldWithDelay(positionField, 'Senior Developer');
      }
      
      // Fill Organization
      const organizationField = page.getByPlaceholder('Organization')
        .or(page.locator('input[name="workHistory.0.organization"]'))
        .or(page.getByLabel(/Organization/i));
      if (await organizationField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fillFieldWithDelay(organizationField, 'Tech Company Ltd');
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
      
      // Fill Title
      const positionField = page.getByPlaceholder('Title')
        .or(page.locator('input[name="educationBackground.0.title"]'))
        .or(page.getByLabel(/Title/i));
      if (await positionField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fillFieldWithDelay(positionField, 'Senior Developer');
      }
      
      // Fill Organization
      const organizationField = page.getByPlaceholder('Organization')
        .or(page.locator('input[name="educationBackground.0.organization"]'))
        .or(page.getByLabel(/Organization/i));
      if (await organizationField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fillFieldWithDelay(organizationField, 'Tech Company Ltd');
      }
      
      // Fill Start Date
      const startDateField = page.getByPlaceholder('Start Date')
        .or(page.locator('input[name="educationBackground.0.startDate"]'))
        .or(page.getByLabel(/Start Date/i));
      if (await startDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await startDateField.click();
        await page.waitForTimeout(300);
        await startDateField.fill('2020-01-15');
        await page.waitForTimeout(400);
      }
      
      // Fill End Date
      const endDateField = page.getByPlaceholder('End Date')
        .or(page.locator('input[name="educationBackground.0.endDate"]'))
        .or(page.getByLabel(/End Date/i));
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
      await fillFieldWithDelay(guardianNameField, 'Dara Sok');
    }

    // Guardian Phone Number
    const guardianPhoneField = page.locator('input[name="guardian.phone"]')
      .or(page.getByPlaceholder('Phone Number'))
      .or(page.getByLabel(/Phone/i));
    if (await guardianPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianPhoneField.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await fillFieldWithDelay(guardianPhoneField, '0987654321');
    }

    // Guardian Relation
    const guardianRelationField = page.locator('input[name="guardian.relation"]')
      .or(page.getByPlaceholder('Relation'))
      .or(page.getByLabel(/Relation/i));
    if (await guardianRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianRelationField.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await fillFieldWithDelay(guardianRelationField, 'Father');
    }

    // Guardian Email
    const guardianEmailField = page.locator('input[name="guardian.email"]')
      .or(page.getByPlaceholder('Email'))
      .or(page.getByLabel(/Email/i));
    if (await guardianEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianEmailField.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await fillFieldWithDelay(guardianEmailField, 'darasok@gmail.com');
    }

    // Guardian Village
    const guardianVillageField = page.locator('input[name="guardian.address.village"]')
      .or(page.getByPlaceholder('Village'))
      .or(page.getByLabel(/Village/i));
    if (await guardianVillageField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianVillageField.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await fillFieldWithDelay(guardianVillageField, 'Toul Kork');
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
      await fillFieldWithDelay(finalGuardianCommune, 'Toul Kork');
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
        await fillFieldWithDelay(guardianDistrictField, 'Phnom Penh');
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
        await fillFieldWithDelay(guardianCityField, 'Phnom Penh');
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
      await fillFieldWithDelay(emergencyNameField, 'Heng Leakana');
    }

    // Emergency Phone Number
    const emergencyPhoneField = page.locator('input[name="emergency.phone"]')
      .or(page.getByPlaceholder('Phone Number'))
      .or(page.getByLabel(/Phone/i));
    if (await emergencyPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyPhoneField.scrollIntoViewIfNeeded();
      await emergencyPhoneField.click();
      await page.waitForTimeout(200);
      await fillFieldWithDelay(emergencyPhoneField, '0123456789');
    }

    // Emergency Relation
    const emergencyRelationField = page.locator('input[name="emergency.relation"]')
      .or(page.getByPlaceholder('Relation'))
      .or(page.getByLabel(/Relation/i));
    if (await emergencyRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyRelationField.scrollIntoViewIfNeeded();
      await emergencyRelationField.click();
      await page.waitForTimeout(200);
      await fillFieldWithDelay(emergencyRelationField, 'Mother');
    }

    // Emergency Email
    const emergencyEmailField = page.locator('input[name="emergency.email"]')
      .or(page.getByPlaceholder('Email'))
      .or(page.getByLabel(/Email/i));
    if (await emergencyEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyEmailField.scrollIntoViewIfNeeded();
      await emergencyEmailField.click();
      await page.waitForTimeout(200);
      await fillFieldWithDelay(emergencyEmailField, 'leakana.heng@gmail.com');
    }

    // Emergency Village
    const emergencyVillageField = page.locator('input[name="emergency.address.village"]')
      .or(page.getByPlaceholder('Village'))
      .or(page.getByLabel(/Village/i));
    if (await emergencyVillageField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyVillageField.scrollIntoViewIfNeeded();
      await emergencyVillageField.click();
      await page.waitForTimeout(200);
      await fillFieldWithDelay(emergencyVillageField, 'Toul Kork');
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
      await fillFieldWithDelay(emergencyCommune, 'Toul Kork ');
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
        await fillFieldWithDelay(emergencyDistrictField, 'Phnom Penh');
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
        await fillFieldWithDelay(emergencyCityField, 'Phnom Penh');
      }
    }

    // Click Create button to submit the form
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1000);
  });
  
  // ===================================
  // Edit coach
  // ===================================
  test('Edit coach', async ({ page }) => {
    // Set longer timeout for this complex form
    test.setTimeout(180000); // 3 minutes

    // Get all coach rows
    const coachRows = page.locator('table tbody tr, [role="row"], .coach-row, div[class*="coach"]');
    
    // Wait for at least one coach to be visible
    await coachRows.first().waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
    
    // Click on the first coach
    const firstCoach = coachRows.nth(0);
    await firstCoach.waitFor({ state: 'visible', timeout: 5000 });
    await firstCoach.click();
    await page.waitForTimeout(1500);
    
    // Open the actions menu (three-dot icon)
    const actionsMenuButton = page.getByRole('button', { name: /more options|actions|menu/i })
      .or(page.locator('button[aria-haspopup="menu"]')).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
    
    // Look for Edit button in the dropdown menu
    const editButton = page.getByRole('menuitem', { name: /Edit/i })
      .or(page.getByRole('button', { name: /Edit/i }));
    
    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editButton.click();
      
      // Wait for edit form to appear
      await page.waitForTimeout(1000);
      
      // Edit First Name
      const firstNameField = page.getByLabel(/First Name/i)
        .or(page.locator('#firstName, input[name="firstName"]'));
      if (await firstNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstNameField.clear();
        await fillFieldWithDelay(firstNameField, coachDataEdit.firstName);
      }
      
      // Edit Last Name
      const lastNameField = page.getByLabel(/Last Name/i)
        .or(page.locator('#lastName, input[name="lastName"]'));
      if (await lastNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await lastNameField.clear();
        await fillFieldWithDelay(lastNameField, coachDataEdit.lastName);
      }
      
      // Edit Email
      const emailField = page.getByLabel(/Email/i)
        .or(page.locator('#email, input[name="email"]'));
      if (await emailField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await emailField.clear();
        await fillFieldWithDelay(emailField, coachDataEdit.email);
      }
      
      // Edit Date of Birth
      const dobField = page.locator('input[name="dateOfBirth"]')
        .or(page.getByLabel(/Date of Birth/i))
        .or(page.getByPlaceholder(/Date of Birth/i));
      if (await dobField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dobField.scrollIntoViewIfNeeded();
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
        await fillFieldWithDelay(phoneField, coachDataEdit.phone);
      }
      
      // Edit Telegram
      const telegramField = page.getByPlaceholder(/Telegram/i)
        .or(page.locator('input[name="telegram"]'));
      if (await telegramField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await telegramField.clear();
        await fillFieldWithDelay(telegramField, coachDataEdit.telegram);
      }
      
      // Edit ID Number
      const idNumberField = page.getByLabel(/ID Number/i)
        .or(page.locator('input[name="idNumber"]'));
      if (await idNumberField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await idNumberField.clear();
        await fillFieldWithDelay(idNumberField, coachDataEdit.idNumber);
      }
      
      // Edit ABA Account Name
      const abaAccountNameField = page.getByLabel(/ABA Account Name/i)
        .or(page.locator('input[name="ABAAccountName"]'));
      if (await abaAccountNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await abaAccountNameField.clear();
        await fillFieldWithDelay(abaAccountNameField, coachDataEdit.abaAccountName);
      }
      
      // Edit ABA Account Number
      const abaAccountNumberField = page.getByLabel(/ABA Account Number/i)
        .or(page.locator('input[name="ABAAccountNumber"]'));
      if (await abaAccountNumberField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await abaAccountNumberField.clear();
        await fillFieldWithDelay(abaAccountNumberField, coachDataEdit.abaAccountNumber);
      }
      
      // Edit Join Date
      const joinDateField = page.getByLabel(/Join Date/i)
        .or(page.locator('input[name="joinDate"]'));
      if (await joinDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await joinDateField.scrollIntoViewIfNeeded();
        await joinDateField.click();
        await page.waitForTimeout(300);
        await joinDateField.fill('2021-03-15');
        await page.waitForTimeout(400);
      }
      
      // Edit Major
      const majorField = page.getByLabel(/Major/i)
        .or(page.locator('input[name="major"]'));
      if (await majorField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await majorField.clear();
        await fillFieldWithDelay(majorField, coachDataEdit.major);
      }
      
      // Edit Cost Per Hour
      const costPerHourField = page.getByLabel(/Course Per Hour|Cost Per Hour/i)
        .or(page.locator('input[name="costPerHour"]'));
      if (await costPerHourField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await costPerHourField.clear();
        await fillFieldWithDelay(costPerHourField, coachDataEdit.costPerHour);
      }

      // Edit Village
      const villageField = page.getByPlaceholder('Village')
        .or(page.locator('input[name="address.village"]'))
        .or(page.getByLabel(/Village/i));
      if (await villageField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await villageField.clear();
        await fillFieldWithDelay(villageField, 'Boeung Keng Kang');
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
        await fillFieldWithDelay(targetCommune, 'Boeung Keng Kang');
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
          await fillFieldWithDelay(districtField, 'Chamkar Mon');
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
          await fillFieldWithDelay(cityField, 'Phnom Penh');
        }
      }
      
      // Edit Work History - Click "Add Work History" button if needed
      const addWorkHistoryButton = page.getByRole('button', { name: /Add Work History/i })
        .or(page.locator('button:has-text("Add Work History")'))
        .or(page.locator('button:has(svg.lucide-plus)').filter({ hasText: /Work History/i }));
      
      if (await addWorkHistoryButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addWorkHistoryButton.scrollIntoViewIfNeeded();
        await addWorkHistoryButton.click();
        await page.waitForTimeout(800);
      }
      
      // Edit Work History fields (if they exist)
      const workPositionField = page.getByPlaceholder('Position')
        .or(page.locator('input[name="workHistory.0.position"]'));
      if (await workPositionField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await workPositionField.clear();
        await fillFieldWithDelay(workPositionField, 'Lead Developer');
      }
      
      const workOrgField = page.getByPlaceholder('Organization')
        .or(page.locator('input[name="workHistory.0.organization"]'));
      if (await workOrgField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await workOrgField.clear();
        await fillFieldWithDelay(workOrgField, 'Software Solutions Inc');
      }
      
      const workStartDateField = page.getByPlaceholder('Start Date')
        .or(page.locator('input[name="workHistory.0.startDate"]'));
      if (await workStartDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await workStartDateField.click();
        await page.waitForTimeout(300);
        await workStartDateField.fill('2019-06-01');
        await page.waitForTimeout(400);
      }
      
      const workEndDateField = page.getByPlaceholder('End Date')
        .or(page.locator('input[name="workHistory.0.endDate"]'));
      if (await workEndDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
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
        await addEducationButton.click();
        await page.waitForTimeout(800);
      }
      
      // Edit Education Background fields (if they exist)
      const eduTitleField = page.getByPlaceholder('Title')
        .or(page.locator('input[name="educationBackground.0.title"]'));
      if (await eduTitleField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await eduTitleField.clear();
        await fillFieldWithDelay(eduTitleField, 'Master of Science');
      }
      
      const eduOrgField = page.locator('input[name="educationBackground.0.organization"]')
        .or(page.getByPlaceholder('Organization').nth(1));
      if (await eduOrgField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await eduOrgField.clear();
        await fillFieldWithDelay(eduOrgField, 'State University');
      }
      
      const eduStartDateField = page.locator('input[name="educationBackground.0.startDate"]');
      if (await eduStartDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await eduStartDateField.click();
        await page.waitForTimeout(300);
        await eduStartDateField.fill('2015-09-01');
        await page.waitForTimeout(400);
      }
      
      const eduEndDateField = page.locator('input[name="educationBackground.0.endDate"]');
      if (await eduEndDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
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
        await fillFieldWithDelay(guardianNameField, 'Updated Guardian');
      }
      
      // Guardian Phone
      const guardianPhoneField = page.locator('input[name="guardian.phone"]')
        .or(page.getByPlaceholder('Phone Number'));
      if (await guardianPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guardianPhoneField.clear();
        await fillFieldWithDelay(guardianPhoneField, '0999888777');
      }
      
      // Guardian Relation
      const guardianRelationField = page.locator('input[name="guardian.relation"]')
        .or(page.getByPlaceholder('Relation'));
      if (await guardianRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guardianRelationField.clear();
        await fillFieldWithDelay(guardianRelationField, 'Mother');
      }
      
      // Guardian Email
      const guardianEmailField = page.locator('input[name="guardian.email"]')
        .or(page.getByPlaceholder('Email'));
      if (await guardianEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guardianEmailField.clear();
        await fillFieldWithDelay(guardianEmailField, 'guardian@email.com');
      }
      
      // Guardian Village
      const guardianVillageField = page.locator('input[name="guardian.address.village"]')
        .or(page.getByPlaceholder('Village'))
        .or(page.getByLabel(/Village/i));
      if (await guardianVillageField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await guardianVillageField.scrollIntoViewIfNeeded();
        await guardianVillageField.clear();
        await page.waitForTimeout(200);
        await fillFieldWithDelay(guardianVillageField, 'Toul Kork');
        await guardianVillageField.press('Tab');
        await page.waitForTimeout(1000);
      }
      
      // Guardian Commune
      const guardianCommuneField = page.locator('input[name="guardian.address.commune"]')
        .or(page.getByPlaceholder('Commune'))
        .or(page.getByLabel(/Commune/i));
      if (await guardianCommuneField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await guardianCommuneField.scrollIntoViewIfNeeded();
        await guardianCommuneField.clear();
        await page.waitForTimeout(200);
        await fillFieldWithDelay(guardianCommuneField, 'Toul Kork');
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
          await fillFieldWithDelay(guardianDistrictField, 'Toul Kork');
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
          await fillFieldWithDelay(guardianCityField, 'Phnom Penh');
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
        .or(page.getByPlaceholder('Name'));
      if (await emergencyNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emergencyNameField.scrollIntoViewIfNeeded();
        await emergencyNameField.clear();
        await page.waitForTimeout(200);
        await fillFieldWithDelay(emergencyNameField, 'Emergency Contact');
      }
      
      // Emergency Phone
      const emergencyPhoneField = page.locator('input[name="emergency.phone"]')
        .or(page.getByPlaceholder('Phone Number'));
      if (await emergencyPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emergencyPhoneField.clear();
        await fillFieldWithDelay(emergencyPhoneField, '0111222333');
      }
      
      // Emergency Relation
      const emergencyRelationField = page.locator('input[name="emergency.relation"]')
        .or(page.getByPlaceholder('Relation'));
      if (await emergencyRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emergencyRelationField.clear();
        await fillFieldWithDelay(emergencyRelationField, 'Sibling');
      }
      
      // Emergency Email
      const emergencyEmailField = page.locator('input[name="emergency.email"]')
        .or(page.getByPlaceholder('Email'));
      if (await emergencyEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emergencyEmailField.clear();
        await fillFieldWithDelay(emergencyEmailField, 'emergency@email.com');
      }
      
      // Emergency Village
      const emergencyVillageField = page.locator('input[name="emergency.address.village"]')
        .or(page.getByPlaceholder('Village'))
        .or(page.getByLabel(/Village/i));
      if (await emergencyVillageField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await emergencyVillageField.scrollIntoViewIfNeeded();
        await emergencyVillageField.clear();
        await page.waitForTimeout(200);
        await fillFieldWithDelay(emergencyVillageField, 'Daun Penh');
        await emergencyVillageField.press('Tab');
        await page.waitForTimeout(1000);
      }
      
      // Emergency Commune
      const emergencyCommuneField = page.locator('input[name="emergency.address.commune"]')
        .or(page.getByPlaceholder('Commune'))
        .or(page.getByLabel(/Commune/i));
      if (await emergencyCommuneField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await emergencyCommuneField.scrollIntoViewIfNeeded();
        await emergencyCommuneField.clear();
        await page.waitForTimeout(200);
        await fillFieldWithDelay(emergencyCommuneField, 'Daun Penh');
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
          await fillFieldWithDelay(emergencyDistrictField, 'Daun Penh');
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
          await fillFieldWithDelay(emergencyCityField, 'Phnom Penh');
        }
      }

      // Click Update/Save button to submit the form
      await page.waitForTimeout(1000);
      const updateButton = page.getByRole('button', { name: /Update|Save/i });
      await updateButton.scrollIntoViewIfNeeded();
      await updateButton.click();
      await page.waitForTimeout(2000);
    }
  });

  // ===================================
  // Delete coach
  // ===================================
  test('Delete coach', async ({ page }) => {
    // Get all coach rows
    const coachRows = page.locator('table tbody tr, [role="row"], .coach-row, div[class*="coach"]');
    
    // Wait for at least one coach to be visible
    await coachRows.first().waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
    
    // Click on the first coach
    const firstCoach = coachRows.nth(0);
    await firstCoach.waitFor({ state: 'visible', timeout: 5000 });
    await firstCoach.click();
    await page.waitForTimeout(1500);
    
    // Use the delete helper function
    await deleteEntityViaActionMenu(page);
    
    // Wait to see the result
    await page.waitForTimeout(2000);
  });
});
