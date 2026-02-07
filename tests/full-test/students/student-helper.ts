import { Page, expect } from '@playwright/test';
import { FileInput } from '../../../utils/form-helper';
import { uploadThumbnail } from '../../../utils/upload-thumbnail-helper';
import path from 'path';

/**
 * Creates a student by filling out the multi-step form.
 * @param page - Playwright Page object
 * @param studentData - Object containing student data (including address, guardian, emergency)
 */
export async function createStudent(page: Page, studentData: any) {
    // Wait for the form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 5000 });

    // Upload Profile Image
    await uploadThumbnail(page, "file-input-profile || selected-exist-profile", {
      imagePath: path.join(__dirname, '../../..', 'public', 'images', 'profile-create.png')
    });
    
    // Fill First Name
    const firstNameField = page.getByLabel(/First Name/i)
      .or(page.locator('#firstName, input[name="firstName"]'));
    await FileInput(firstNameField, studentData.firstName);
    
    // Fill Last Name
    const lastNameField = page.getByLabel(/Last Name/i)
      .or(page.locator('#lastName, input[name="lastName"]'));
    await FileInput(lastNameField, studentData.lastName);
    
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
    
    // Fill Email
    const emailField = page.getByLabel(/Email/i)
      .or(page.locator('#email, input[name="email"]'));
    // Use the email provided in data
    await FileInput(emailField, studentData.email);

    // Fill Date of Birth
    const dobField = page.getByLabel(/Date of Birth|DOB|Birth Date/i)
      .or(page.locator('#dob, input[name="dob"], input[name="dateOfBirth"], input[type="date"]'));
    
    if (await dobField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dobField.click();
        await page.waitForTimeout(300);
        await dobField.fill(studentData.dob);
        await page.waitForTimeout(400);
    }
    
    // Fill Phone
    const phoneField = page.getByLabel(/Phone/i)
      .or(page.locator('input[name="phone"]'));
    if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(phoneField, studentData.phone);
    }
    
    // Telegram
    const telegramField = page.getByPlaceholder(/Telegram/i)
      .or(page.locator('input[name="telegram"]'));
    if (await telegramField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(telegramField, studentData.telegram);
    }
    
    // Village
    const villageField = page.getByPlaceholder('Village')
      .or(page.locator('input[name="address.village"]'))
      .or(page.getByLabel(/Village/i));
    if (await villageField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(villageField, studentData.address.village);
      await villageField.press('Tab'); 
      await page.waitForTimeout(1000);
    }

    // Commune
    const communeField = page.getByRole('textbox', { name: /Commune/i })
      .or(page.getByRole('combobox', { name: /Commune/i }))
      .or(page.getByPlaceholder(/Commune/i))
      .or(page.locator('input[name="address.commune"]'))
      .or(page.locator('#commune'));
      
    const targetCommune = communeField.first();
    const isCommuneVisible = await targetCommune.isVisible({ timeout: 3000 }).catch((e) => {
      console.log('Ignore: Commune visibility check failed:', e);
      return false;
    });

    if (isCommuneVisible) {
      try {
        await expect(targetCommune).toBeEnabled({ timeout: 5000 });
      } catch (e) {
        console.log('Warning: Commune field did not become enabled:', e);
      }

      await targetCommune.click();
      await page.waitForTimeout(300);
      await FileInput(targetCommune, studentData.address.commune);
      await targetCommune.blur();
      await page.waitForTimeout(500);
    }

    // District
    const districtField = page.getByPlaceholder('District / Khan')
      .or(page.locator('input[name="address.district"]'))
      .or(page.locator('#district'));
    if (await districtField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await districtField.scrollIntoViewIfNeeded();
      
      const isDisabled = await districtField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await page.waitForTimeout(300);
        await FileInput(districtField, studentData.address.district);
      }
    }

    // City
    const cityField = page.getByPlaceholder('City / Province')
      .or(page.locator('input[name="address.city"]'))
      .or(page.locator('#city'));
    if (await cityField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cityField.scrollIntoViewIfNeeded();
      
      const isDisabled = await cityField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await page.waitForTimeout(300);
        await FileInput(cityField, studentData.address.city);
      }
    }
    
    // Next Button
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
      await FileInput(guardianNameField, studentData.guardian.name);
    }

    // Guardian Phone
    const guardianPhoneField = page.locator('input[name="guardian.phone"]')
      .or(page.getByPlaceholder('Phone Number'))
      .or(page.getByLabel(/Phone/i));
    if (await guardianPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianPhoneField.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await FileInput(guardianPhoneField, studentData.guardian.phone);
    }

    // Guardian Relation
    const guardianRelationField = page.locator('input[name="guardian.relation"]')
      .or(page.getByPlaceholder('Relation'))
      .or(page.getByLabel(/Relation/i));
    if (await guardianRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianRelationField.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await FileInput(guardianRelationField, studentData.guardian.relation);
    }

    // Guardian Email
    const guardianEmailField = page.locator('input[name="guardian.email"]')
      .or(page.getByPlaceholder('Email'))
      .or(page.getByLabel(/Email/i));
    if (await guardianEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianEmailField.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await FileInput(guardianEmailField, studentData.guardian.email);
    }

    // Guardian Village
    const guardianVillageField = page.locator('input[name="guardian.address.village"]')
      .or(page.getByPlaceholder('Village'))
      .or(page.getByLabel(/Village/i));
    if (await guardianVillageField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianVillageField.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await FileInput(guardianVillageField, studentData.guardian.address.village);
      await guardianVillageField.press('Tab'); 
      await page.waitForTimeout(1000);
    }

    // Guardian Commune
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
      await FileInput(finalGuardianCommune, studentData.guardian.address.commune);
      await finalGuardianCommune.blur();
      await page.waitForTimeout(500);
    }

    // Guardian District
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
        await FileInput(guardianDistrictField, studentData.guardian.address.district);
      }
    }

    // Guardian City
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
        await FileInput(guardianCityField, studentData.guardian.address.city);
      }
    }

    // Next Button 2
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
      await FileInput(emergencyNameField, studentData.emergency.name);
    }

    // Emergency Phone
    const emergencyPhoneField = page.locator('input[name="emergency.phone"]')
      .or(page.getByPlaceholder('Phone Number'))
      .or(page.getByLabel(/Phone/i));
    if (await emergencyPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyPhoneField.scrollIntoViewIfNeeded();
      await emergencyPhoneField.click();
      await page.waitForTimeout(200);
      await FileInput(emergencyPhoneField, studentData.emergency.phone);
    }

    // Emergency Relation
    const emergencyRelationField = page.locator('input[name="emergency.relation"]')
      .or(page.getByPlaceholder('Relation'))
      .or(page.getByLabel(/Relation/i));
    if (await emergencyRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyRelationField.scrollIntoViewIfNeeded();
      await emergencyRelationField.click();
      await page.waitForTimeout(200);
      await FileInput(emergencyRelationField, studentData.emergency.relation);
    }

    // Emergency Email
    const emergencyEmailField = page.locator('input[name="emergency.email"]')
      .or(page.getByPlaceholder('Email'))
      .or(page.getByLabel(/Email/i));
    if (await emergencyEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyEmailField.scrollIntoViewIfNeeded();
      await emergencyEmailField.click();
      await page.waitForTimeout(200);
      await FileInput(emergencyEmailField, studentData.emergency.email);
    }

    // Emergency Village
    const emergencyVillageField = page.locator('input[name="emergency.address.village"]')
      .or(page.getByPlaceholder('Village'))
      .or(page.getByLabel(/Village/i));
    if (await emergencyVillageField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyVillageField.scrollIntoViewIfNeeded();
      await emergencyVillageField.click();
      await page.waitForTimeout(200);
      await FileInput(emergencyVillageField, studentData.emergency.address.village);
      await emergencyVillageField.press('Tab'); 
      await page.waitForTimeout(1000);
    }

    // Emergency Commune
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
      await FileInput(emergencyCommune, studentData.emergency.address.commune);
      await emergencyCommune.blur();
      await page.waitForTimeout(500);
    }

    // Emergency District
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
        await FileInput(emergencyDistrictField, studentData.emergency.address.district);
      }
    }

    // Emergency City
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
        await FileInput(emergencyCityField, studentData.emergency.address.city);
      }
    }

    // Click Create
    await page.waitForTimeout(1000);
    const createButton = page.getByRole('button', { name: /Create/i });
    await createButton.scrollIntoViewIfNeeded();
    await createButton.click();
    await page.waitForTimeout(1000);
}

/**
 * Updates a student by filling out the multi-step form.
 * @param page - Playwright Page object
 * @param studentData - Object containing student data (including address, guardian, emergency)
 */
export async function updateStudent(page: Page, studentData: any) {
    // Wait for the form to appear (Edit mode)
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 5000 });

    // Update Profile Image
    await uploadThumbnail(page, "file-input-profile || selected-exist-profile", {
      imagePath: path.join(__dirname, '../../..', 'public', 'images', 'profile-create.png')
    });
    
    // Update First Name
    const firstNameField = page.getByLabel(/First Name/i)
      .or(page.locator('#firstName, input[name="firstName"]'));
    await firstNameField.clear();
    await FileInput(firstNameField, studentData.firstName);
    
    // Update Last Name
    const lastNameField = page.getByLabel(/Last Name/i)
      .or(page.locator('#lastName, input[name="lastName"]'));
    await lastNameField.clear();
    await FileInput(lastNameField, studentData.lastName);
    
    // Update Email
    const emailField = page.getByLabel(/Email/i)
      .or(page.locator('#email, input[name="email"]'));
    if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emailField.clear();
        await FileInput(emailField, studentData.email);
    }

    // Update Phone
    const phoneField = page.getByLabel(/Phone/i)
      .or(page.locator('input[name="phone"]'));
    if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await phoneField.clear();
      await FileInput(phoneField, studentData.phone);
    }
    
    // Update Telegram
    const telegramField = page.getByPlaceholder(/Telegram/i)
      .or(page.locator('input[name="telegram"]'));
    if (await telegramField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await telegramField.scrollIntoViewIfNeeded();
      await telegramField.clear();
      await FileInput(telegramField, studentData.telegram);
    }
    
    // Update Date of Birth
    const dobField = page.getByLabel(/Date of Birth|DOB|Birth Date/i)
      .or(page.locator('#dob, input[name="dob"], input[name="dateOfBirth"], input[type="date"]'));
    
    if (await dobField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dobField.click();
        await page.waitForTimeout(300);
        await dobField.fill(studentData.dob);
        await page.waitForTimeout(400);
    }

    // Update Village
    const villageField = page.getByPlaceholder('Village')
      .or(page.locator('input[name="address.village"]'))
      .or(page.getByLabel(/Village/i));
    if (await villageField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await villageField.clear();
      await FileInput(villageField, studentData.address.village);
      await villageField.press('Tab'); 
      await page.waitForTimeout(1000);
    }

    // Update Commune
    const communeField = page.getByRole('textbox', { name: /Commune/i })
      .or(page.getByRole('combobox', { name: /Commune/i }))
      .or(page.getByPlaceholder(/Commune/i))
      .or(page.locator('input[name="address.commune"]'))
      .or(page.locator('#commune'));
      
    const targetCommune = communeField.first();
    const isCommuneVisible = await targetCommune.isVisible({ timeout: 3000 }).catch((e) => {
      console.log('Ignore: Commune visibility check failed:', e);
      return false;
    });

    if (isCommuneVisible) {
      try {
        await expect(targetCommune).toBeEnabled({ timeout: 5000 });
      } catch (e) {
        console.log('Warning: Commune field did not become enabled:', e);
      }

      await targetCommune.click();
      await page.waitForTimeout(300);
      await targetCommune.clear(); // Clear before filling
      await FileInput(targetCommune, studentData.address.commune);
      await targetCommune.blur();
      await page.waitForTimeout(500);
    }

    // Update District
    const districtField = page.getByPlaceholder('District / Khan')
      .or(page.locator('input[name="address.district"]'))
      .or(page.locator('#district'));
    if (await districtField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await districtField.scrollIntoViewIfNeeded();
      
      const isDisabled = await districtField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await page.waitForTimeout(300);
        await districtField.clear();
        await FileInput(districtField, studentData.address.district);
      }
    }

    // Update City
    const cityField = page.getByPlaceholder('City / Province')
      .or(page.locator('input[name="address.city"]'))
      .or(page.locator('#city'));
    if (await cityField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cityField.scrollIntoViewIfNeeded();
      
      const isDisabled = await cityField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await page.waitForTimeout(300);
        await cityField.clear();
        await FileInput(cityField, studentData.address.city);
      }
    }
    
    // Next Button
    await page.waitForTimeout(1000);
    const nextButton = page.getByRole('button', { name: /Next|next/i });
    if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nextButton.scrollIntoViewIfNeeded();
        await nextButton.click();
        await page.waitForTimeout(2000);
    }

    // ===== GUARDIAN TAB =====
    // Update Guardian Name
    const guardianNameField = page.locator('input[name="guardian.name"]')
      .or(page.getByPlaceholder('Name'))
      .or(page.getByLabel(/Name/i));
    if (await guardianNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianNameField.scrollIntoViewIfNeeded();
      await guardianNameField.clear();
      await page.waitForTimeout(200);
      await FileInput(guardianNameField, studentData.guardian.name);
    }

    // Update Guardian Phone
    const guardianPhoneField = page.locator('input[name="guardian.phone"]')
      .or(page.getByPlaceholder('Phone Number'))
      .or(page.getByLabel(/Phone/i));
    if (await guardianPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianPhoneField.scrollIntoViewIfNeeded();
      await guardianPhoneField.clear();
      await page.waitForTimeout(200);
      await FileInput(guardianPhoneField, studentData.guardian.phone);
    }

    // Update Guardian Relation
    const guardianRelationField = page.locator('input[name="guardian.relation"]')
      .or(page.getByPlaceholder('Relation'))
      .or(page.getByLabel(/Relation/i));
    if (await guardianRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianRelationField.scrollIntoViewIfNeeded();
      await guardianRelationField.clear();
      await page.waitForTimeout(200);
      await FileInput(guardianRelationField, studentData.guardian.relation);
    }

    // Update Guardian Email
    const guardianEmailField = page.locator('input[name="guardian.email"]')
      .or(page.getByPlaceholder('Email'))
      .or(page.getByLabel(/Email/i));
    if (await guardianEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianEmailField.scrollIntoViewIfNeeded();
      await guardianEmailField.clear();
      await page.waitForTimeout(200);
      await FileInput(guardianEmailField, studentData.guardian.email);
    }

    // Update Guardian Village
    const guardianVillageField = page.locator('input[name="guardian.address.village"]')
      .or(page.getByPlaceholder('Village'))
      .or(page.getByLabel(/Village/i));
    if (await guardianVillageField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guardianVillageField.scrollIntoViewIfNeeded();
      await guardianVillageField.clear();
      await page.waitForTimeout(200);
      await FileInput(guardianVillageField, studentData.guardian.address.village);
      await guardianVillageField.press('Tab'); 
      await page.waitForTimeout(1000);
    }

    // Update Guardian Commune
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
      
      await guardianCommuneField.click();
      await page.waitForTimeout(200);
      await guardianCommuneField.clear();
      await FileInput(guardianCommuneField, studentData.guardian.address.commune);
      await guardianCommuneField.blur();
      await page.waitForTimeout(500);
    }

    // Update Guardian District
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
        await guardianDistrictField.clear();
        await FileInput(guardianDistrictField, studentData.guardian.address.district);
      }
    }

    // Update Guardian City
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
        await guardianCityField.clear();
        await FileInput(guardianCityField, studentData.guardian.address.city);
      }
    }

    // Next Button 2
    await page.waitForTimeout(1000);
    const nextButton2 = page.getByRole('button', { name: /Next|next/i });
    if (await nextButton2.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nextButton2.scrollIntoViewIfNeeded();
        await nextButton2.click();
        await page.waitForTimeout(2000);
    }

    // ===== EMERGENCY TAB =====
    // Update Emergency Name
    const emergencyNameField = page.locator('input[name="emergency.name"]')
      .or(page.getByPlaceholder('Name'))
      .or(page.getByLabel(/Name/i));
    if (await emergencyNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyNameField.scrollIntoViewIfNeeded();
      await emergencyNameField.clear();
      await page.waitForTimeout(200);
      await FileInput(emergencyNameField, studentData.emergency.name);
    }

    // Update Emergency Phone
    const emergencyPhoneField = page.locator('input[name="emergency.phone"]')
      .or(page.getByPlaceholder('Phone Number'))
      .or(page.getByLabel(/Phone/i));
    if (await emergencyPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyPhoneField.scrollIntoViewIfNeeded();
      await emergencyPhoneField.clear();
      await page.waitForTimeout(200);
      await FileInput(emergencyPhoneField, studentData.emergency.phone);
    }

    // Update Emergency Relation
    const emergencyRelationField = page.locator('input[name="emergency.relation"]')
      .or(page.getByPlaceholder('Relation'))
      .or(page.getByLabel(/Relation/i));
    if (await emergencyRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyRelationField.scrollIntoViewIfNeeded();
      await emergencyRelationField.clear();
      await page.waitForTimeout(200);
      await FileInput(emergencyRelationField, studentData.emergency.relation);
    }

    // Update Emergency Email
    const emergencyEmailField = page.locator('input[name="emergency.email"]')
      .or(page.getByPlaceholder('Email'))
      .or(page.getByLabel(/Email/i));
    if (await emergencyEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyEmailField.scrollIntoViewIfNeeded();
      await emergencyEmailField.clear();
      await page.waitForTimeout(200);
      await FileInput(emergencyEmailField, studentData.emergency.email);
    }

    // Update Emergency Village
    const emergencyVillageField = page.locator('input[name="emergency.address.village"]')
      .or(page.getByPlaceholder('Village'))
      .or(page.getByLabel(/Village/i));
    if (await emergencyVillageField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emergencyVillageField.scrollIntoViewIfNeeded();
      await emergencyVillageField.clear();
      await page.waitForTimeout(200);
      await FileInput(emergencyVillageField, studentData.emergency.address.village);
      await emergencyVillageField.press('Tab'); 
      await page.waitForTimeout(1000);
    }

    // Update Emergency Commune
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
      await emergencyCommune.clear();
      await FileInput(emergencyCommune, studentData.emergency.address.commune);
      await emergencyCommune.blur();
      await page.waitForTimeout(500);
    }

    // Update Emergency District
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
        await emergencyDistrictField.clear();
        await FileInput(emergencyDistrictField, studentData.emergency.address.district);
      }
    }

    // Update Emergency City
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
        await emergencyCityField.clear();
        await FileInput(emergencyCityField, studentData.emergency.address.city);
      }
    }

    // Click Save/Update
    await page.waitForTimeout(1000);
    const saveButton = page.getByRole('button', { name: /Save|Update/i });
    if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveButton.scrollIntoViewIfNeeded();
        await saveButton.click();
        await page.waitForTimeout(1000);
    }
}
