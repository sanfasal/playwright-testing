import { test, expect } from '@playwright/test';
import path from 'path';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { FileInput } from '../utils/form-helper';
import { deleteEntityViaActionMenu } from '../utils/delete-helper';
import { toggleViewMode } from '../utils/view-helper';
import { uploadThumbnail } from '../utils/upload-thumbnail-helper';
import { generateTestmailAddress } from '../utils/email-helper';

// Test data for adding a new student
const randomSuffix = Math.floor(Math.random() * 10000);

const studentDataAdd = {
  firstName: `John`,
  lastName: `Doe ${randomSuffix}`,
  email: `john.doe.${randomSuffix}@gmail.com`,
  phone: '0975566777',
  telegram: `@sim_lina${randomSuffix}`,
  dob: new Date().toISOString().split('T')[0], 
  address: {
    village: 'Toul Kork',
    commune: 'Prek leab',
    district: 'Phnom Penh',
    city: 'Phnom Penh',
  },
  guardian: {
    name: 'Dara Sok',
    phone: '0987654321',
    relation: 'Father',
    email: `darasok${randomSuffix}@gmail.com `,
    address: {
      village: 'Toul Kork',
      commune: 'Toul Kork',
      district: 'Phnom Penh',
      city: 'Phnom Penh',
    },
  },
  emergency: {
    name: 'Heng Leakana',
    phone: '0123456789',
    relation: 'Mother',
    email: `leakana.heng${randomSuffix}@gmail.com`,
    address: {
      village: 'Toul Kork',
      commune: 'Toul Kork ',
      district: 'Phnom Penh',
      city: 'Phnom Penh',
    },
  },
}

// Test data for editing a student (different values to verify edit works)
const studentDataEdit = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: `jane.smith${randomSuffix}@gmail.com`,
  phone: '0987654321',
  telegram: `@sim_lina${randomSuffix}`,
  dob: new Date().toISOString().split('T')[0], 
  address: {
    village: 'Boeung Keng Kang',
    commune: 'Boeung Keng Kang',
    district: 'Chamkar Mon',
    city: 'Phnom Penh',
  },
  guardian: {
    name: 'Updated Guardian',
    phone: '0123456789',
    relation: 'Uncle',
    email: `updated.guardian${randomSuffix}@gmail.com `,
    address: {
      village: 'Boeung Keng Kang',
      commune: 'Boeung Keng Kang',
      district: 'Chamkar Mon',
      city: 'Phnom Penh',
    },
  },
  emergency: {
    name: 'Updated Emergency Contact',
    phone: '0999888777',
    relation: 'Aunt',
    email: `updated.emergency${randomSuffix}@gmail.com `,
    address: {
      village: 'Boeung Keng Kang',
      commune: 'Boeung Keng Kang',
      district: 'Chamkar Mon',
      city: 'Phnom Penh',
    },
  },
}

// Test suite for Student Dashboard
test.describe('Student Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Student', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('Dashboard', { exact: true }).last().click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/students/);
    await page.waitForTimeout(1000);
  });

  test('Dashboard page loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Student/i);
    await page.waitForTimeout(1000);
  });
});


// Test suite for Student List
test.describe('Students', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Student', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('List Students', { exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/students/);
    await page.waitForTimeout(1000);
  });



  // ===================================
  // Add new student
  // ===================================
  test('Add new student', async ({ page }) => {
    await page.locator('body > div > div.flex-1.flex.gap-10 > div.flex-1.min-w-\\[600px\\].overflow-auto > div > button').click();
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 1000 });

    test.setTimeout(120000);

    // Upload Profile Image
    await uploadThumbnail(page, "file-input-profile || selected-exist-profile", {
      imagePath: path.join(__dirname, '..', 'public', 'images', 'profile-create.png')
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
    await page.waitForTimeout(2000);
  });

    // ===================================
  // View students page
  // ===================================
  test('Students List', async ({ page }) => {
    // Verify we're on the students list page
    await expect(page).toHaveTitle(/Student/i);
    await page.waitForTimeout(1000);
    await toggleViewMode(page);
    await page.waitForTimeout(1000);
  });
  
  // ===================================
  // Edit student
  // ===================================
  test('Edit student', async ({ page }) => {
    test.setTimeout(120000);

    // Get all student rows
    const studentRows = page.locator('table tbody tr, [role="row"], .student-row, div[class*="student"]');
    
    // Wait for at least one student to be visible
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
      imagePath: path.join(__dirname, '..', 'public', 'images', 'profile-update.png')
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
      await page.waitForTimeout(2000);
    } else {
      console.log('Edit functionality not found');
    }
  });

  // ===================================
  // Delete student
  // ===================================
  test('Delete student', async ({ page }) => {
    const studentRows = page.locator('table tbody tr, [role="row"], .student-row, div[class*="student"]');
    await studentRows.count();
    const indexToDelete = 0;
    const studentToDelete = studentRows.nth(indexToDelete);
    await studentToDelete.waitFor({ state: 'visible', timeout: 5000 });
    await studentToDelete.click();
    await page.waitForTimeout(1500);
    await deleteEntityViaActionMenu(page, null, 'Confirm Delete');
    await page.waitForTimeout(2000);
  });
});
