import { Page, expect } from '@playwright/test';
import { FileInput } from '../utils/form-helper';
import { uploadThumbnail } from '../utils/upload-thumbnail-helper';
import path from 'path';

export interface AddressData {
    village?: string;
    commune?: string;
    district?: string;
    city?: string;
}

export interface WorkHistoryData {
    position: string;
    organization: string;
    startDate: string;
    endDate: string;
}

export interface EducationBackgroundData {
    schoolName: string;
    major: string;
    startDate: string;
    endDate: string;
}

export interface GuardianData {
    name: string;
    phone: string;
    relation: string;
    email: string;
    address: AddressData;
}

export interface EmergencyData {
    name: string;
    phone: string;
    relation: string;
    email: string;
    address: AddressData;
}

export interface CoachData {
    firstName: string;
    lastName: string;
    gender?: string;
    dob?: string;
    email: string;
    phone: string;
    telegram: string;
    idNumber: string;
    abaAccountName: string;
    abaAccountNumber: string;
    joinDate?: string;
    major: string;
    costPerHour: string;
    address: AddressData;
    workHistory?: WorkHistoryData[];
    educationBackground?: EducationBackgroundData[];
    guardian?: GuardianData;
    emergency?: EmergencyData;
}

/**
 * Creates a coach by filling out the multi-tab form.
 * @param page - Playwright Page object
 * @param coachData - Object containing coach data
 */
export async function createCoach(page: Page, coachData: CoachData) {
    // Wait for the form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 5000 });

    // Upload Profile Image
    await uploadThumbnail(page, "file-input-profile || selected-exist-profile", {
      imagePath: path.join(__dirname, '..', 'public', 'images', 'profile-create.png')
    });
    
    // Personal Details
    const firstNameField = page.getByLabel(/First Name/i).or(page.locator('#firstName, input[name="firstName"]'));
    await FileInput(firstNameField, coachData.firstName);
    
    const lastNameField = page.getByLabel(/Last Name/i).or(page.locator('#lastName, input[name="lastName"]'));
    await FileInput(lastNameField, coachData.lastName);
    
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
        await dobField.fill(coachData.dob || '1998-05-20');
        await page.waitForTimeout(400);
    }

    // Contact Information
    const emailField = page.getByLabel(/Email/i).or(page.locator('#email, input[name="email"]'));
    await FileInput(emailField, coachData.email);
    
    const phoneField = page.getByLabel(/Phone/i).or(page.locator('input[name="phone"]'));
    if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(phoneField, coachData.phone);
    }
    
    const telegramField = page.getByPlaceholder(/Telegram/i).or(page.locator('input[name="telegram"]'));
    if (await telegramField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(telegramField, coachData.telegram);
    }

    // Professional & Banking Information
    const idNumberField = page.getByLabel(/ID Number/i).or(page.locator('input[name="idNumber"]'));
    if (await idNumberField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(idNumberField, coachData.idNumber);
    }

    const abaAccountNameField = page.getByLabel(/ABA Account Name/i).or(page.locator('input[name="ABAAccountName"]'));
    if (await abaAccountNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(abaAccountNameField, coachData.abaAccountName);
    }

    const abaAccountNumberField = page.getByLabel(/ABA Account Number/i).or(page.locator('input[name="ABAAccountNumber"]'));
    if (await abaAccountNumberField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(abaAccountNumberField, coachData.abaAccountNumber);
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
      await FileInput(majorField, coachData.major);
    }

    const coursePerHourField = page.getByLabel(/Course Per Hour/i).or(page.locator('input[name="costPerHour"]'));
    if (await coursePerHourField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(coursePerHourField, coachData.costPerHour);
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
    
    // Address - Village
    const villageField = page.getByPlaceholder('Village')
      .or(page.locator('input[name="address.village"]'))
      .or(page.getByLabel(/Village/i));
    if (await villageField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(villageField, coachData.address?.village || "");
      await villageField.press('Tab'); 
      await page.waitForTimeout(1000);
    }

    // Commune / Songkat 
    const communeField = page.getByRole('textbox', { name: /Commune/i })
      .or(page.getByRole('combobox', { name: /Commune/i }))
      .or(page.getByPlaceholder(/Commune/i))
      .or(page.locator('input[name="address.commune"]'))
      .or(page.locator('#commune'));
      
    const targetCommune = communeField.first();
    const isCommuneVisible = await targetCommune.isVisible({ timeout: 3000 }).catch((e) => {
      console.log('Ignore: Commune visibility check failed (might be hidden or optional):', e);
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
      await FileInput(targetCommune, coachData.address?.commune || "");
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
        await FileInput(districtField, coachData.address?.district || "");
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
        await FileInput(cityField, coachData.address?.city || "");
      }
    }

    // Work History
    if (coachData.workHistory && coachData.workHistory.length > 0) {
      const addWorkHistoryButton = page.getByRole('button', { name: /Add Work History/i })
        .or(page.locator('button:has-text("Add Work History")'))
        .or(page.locator('button:has(svg.lucide-plus)').filter({ hasText: /Work History/i }));
      
      if (await addWorkHistoryButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addWorkHistoryButton.scrollIntoViewIfNeeded();
        await addWorkHistoryButton.click();
        await page.waitForTimeout(800);
        
        const item = coachData.workHistory[0];

        const positionField = page.getByPlaceholder('Position')
          .or(page.locator('input[name="workHistory.0.position"]'))
          .or(page.getByLabel(/Position/i));
        if (await positionField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await FileInput(positionField, item.position);
        }
        
        const organizationField = page.getByPlaceholder('Organization')
          .or(page.locator('input[name="workHistory.0.organization"]'))
          .or(page.getByLabel(/Organization/i));
        if (await organizationField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await FileInput(organizationField, item.organization);
        }
        
        const startDateField = page.getByPlaceholder('Start Date')
          .or(page.locator('input[name="workHistory.0.startDate"]'))
          .or(page.getByLabel(/Start Date/i));
        if (await startDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await startDateField.click();
          await page.waitForTimeout(300);
          await startDateField.fill(item.startDate);
          await page.waitForTimeout(400);
        }
        
        const endDateField = page.getByPlaceholder('End Date')
          .or(page.locator('input[name="workHistory.0.endDate"]'))
          .or(page.getByLabel(/End Date/i));
        if (await endDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await endDateField.click();
          await page.waitForTimeout(300);
          await endDateField.fill(item.endDate);
          await page.waitForTimeout(400);
        }
      }
    }

    // Education Background
    if (coachData.educationBackground && coachData.educationBackground.length > 0) {
      const addEducationBackgroundButton = page.getByRole('button', { name: /Add Education Background/i })
        .or(page.locator('button:has-text("Add Education Background")'))
        .or(page.locator('button:has(svg.lucide-plus)').filter({ hasText: /Education Background/i }));
      
      if (await addEducationBackgroundButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addEducationBackgroundButton.scrollIntoViewIfNeeded();
        await addEducationBackgroundButton.click();
        await page.waitForTimeout(800);
        
        const item = coachData.educationBackground[0];

        const schoolNameField = page.getByPlaceholder('School Name')
          .or(page.locator('input[name="educationBackground.0.schoolName"]'))
          .or(page.getByLabel(/School Name/i));
        await schoolNameField.fill(item.schoolName);
        
        const majorEdField = page.locator('input[name="educationBackground.0.major"]');
        await FileInput(majorEdField, item.major);
        
        const startDateField = page.locator('input[name="educationBackground.0.startDate"]');
        if (await startDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await startDateField.click();
          await page.waitForTimeout(300);
          await startDateField.fill(item.startDate);
          await page.waitForTimeout(400);
        }
        
        const endDateField = page.locator('input[name="educationBackground.0.endDate"]');
        if (await endDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await endDateField.click();
          await page.waitForTimeout(300);
          await endDateField.fill(item.endDate);
          await page.waitForTimeout(400);
        }
      }
    }
    
    // Click Next button to proceed to Guardian tab
    await page.waitForTimeout(1000);
    const nextButton = page.getByRole('button', { name: /Next|next/i });
    await nextButton.scrollIntoViewIfNeeded();
    await nextButton.click();
    await page.waitForTimeout(2000);

    // ===== GUARDIAN TAB =====    
    if (coachData.guardian) {
        const guardianNameField = page.locator('input[name="guardian.name"]')
          .or(page.getByPlaceholder('Name'))
          .or(page.getByLabel(/Name/i));
        if (await guardianNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await guardianNameField.scrollIntoViewIfNeeded();
          await page.waitForTimeout(200);
          await FileInput(guardianNameField, coachData.guardian.name);
        }

        const guardianPhoneField = page.locator('input[name="guardian.phone"]')
          .or(page.getByPlaceholder('Phone Number'))
          .or(page.getByLabel(/Phone/i));
        if (await guardianPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await guardianPhoneField.scrollIntoViewIfNeeded();
          await page.waitForTimeout(200);
          await FileInput(guardianPhoneField, coachData.guardian.phone);
        }

        const guardianRelationField = page.locator('input[name="guardian.relation"]')
          .or(page.getByPlaceholder('Relation'))
          .or(page.getByLabel(/Relation/i));
        if (await guardianRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await guardianRelationField.scrollIntoViewIfNeeded();
          await page.waitForTimeout(200);
          await FileInput(guardianRelationField, coachData.guardian.relation);
        }

        const guardianEmailField = page.locator('input[name="guardian.email"]')
          .or(page.getByPlaceholder('Email'))
          .or(page.getByLabel(/Email/i));
        if (await guardianEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await guardianEmailField.scrollIntoViewIfNeeded();
          await page.waitForTimeout(200);
          await FileInput(guardianEmailField, coachData.guardian.email);
        }
        
        if (coachData.guardian.address) {
            const guardianVillageField = page.locator('input[name="guardian.address.village"]')
              .or(page.getByPlaceholder('Village'))
              .or(page.getByLabel(/Village/i));
            if (await guardianVillageField.isVisible({ timeout: 2000 }).catch(() => false)) {
              await guardianVillageField.scrollIntoViewIfNeeded();
              await page.waitForTimeout(200);
              await FileInput(guardianVillageField, coachData.guardian?.address?.village || "");
              await guardianVillageField.press('Tab'); 
              await page.waitForTimeout(1000);
            }

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
              await FileInput(finalGuardianCommune, coachData.guardian?.address?.commune || "");
              await finalGuardianCommune.blur();
              await page.waitForTimeout(500);
            }

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
                await FileInput(guardianDistrictField, coachData.guardian?.address?.district || "");
              }
            }

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
                await FileInput(guardianCityField, coachData.guardian?.address?.city || "");
              }
            }
        }
    }

    // Click Next button to proceed to Emergency tab
    await page.waitForTimeout(1000);
    const nextButton2 = page.getByRole('button', { name: /Next|next/i });
    await nextButton2.scrollIntoViewIfNeeded();
    await nextButton2.click();
    await page.waitForTimeout(2000);

    // ===== EMERGENCY TAB =====
    if (coachData.emergency) {
        const emergencyNameField = page.locator('input[name="emergency.name"]')
          .or(page.getByPlaceholder('Name'))
          .or(page.getByLabel(/Name/i));
        if (await emergencyNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await emergencyNameField.scrollIntoViewIfNeeded();
          await emergencyNameField.click();
          await page.waitForTimeout(200);
          await FileInput(emergencyNameField, coachData.emergency.name);
        }

        const emergencyPhoneField = page.locator('input[name="emergency.phone"]')
          .or(page.getByPlaceholder('Phone Number'))
          .or(page.getByLabel(/Phone/i));
        if (await emergencyPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await emergencyPhoneField.scrollIntoViewIfNeeded();
          await emergencyPhoneField.click();
          await page.waitForTimeout(200);
          await FileInput(emergencyPhoneField, coachData.emergency.phone);
        }

        const emergencyRelationField = page.locator('input[name="emergency.relation"]')
          .or(page.getByPlaceholder('Relation'))
          .or(page.getByLabel(/Relation/i));
        if (await emergencyRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await emergencyRelationField.scrollIntoViewIfNeeded();
          await emergencyRelationField.click();
          await page.waitForTimeout(200);
          await FileInput(emergencyRelationField, coachData.emergency.relation);
        }

        const emergencyEmailField = page.locator('input[name="emergency.email"]')
          .or(page.getByPlaceholder('Email'))
          .or(page.getByLabel(/Email/i));
        if (await emergencyEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await emergencyEmailField.scrollIntoViewIfNeeded();
          await emergencyEmailField.click();
          await page.waitForTimeout(200);
          await FileInput(emergencyEmailField, coachData.emergency.email);
        }
        
        if (coachData.emergency.address) {
            const emergencyVillageField = page.locator('input[name="emergency.address.village"]')
              .or(page.getByPlaceholder('Village'))
              .or(page.getByLabel(/Village/i));
            if (await emergencyVillageField.isVisible({ timeout: 2000 }).catch(() => false)) {
              await emergencyVillageField.scrollIntoViewIfNeeded();
              await emergencyVillageField.click();
              await page.waitForTimeout(200);
              await FileInput(emergencyVillageField, coachData.emergency?.address?.village || "");
              await emergencyVillageField.press('Tab'); 
              await page.waitForTimeout(1000);
            }

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
              await FileInput(emergencyCommune, coachData.emergency?.address?.commune || "");
              await emergencyCommune.blur();
              await page.waitForTimeout(500);
            }

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
                await FileInput(emergencyDistrictField, coachData.emergency?.address?.district || "");
              }
            }

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
                await FileInput(emergencyCityField, coachData.emergency?.address?.city || "");
              }
            }
        }
    }

    // Click Create button to submit the form
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1000);
}

/**
 * Updates a coach by filling out the multi-tab form.
 * @param page - Playwright Page object
 * @param coachData - Object containing coach data
 */
export async function updateCoach(page: Page, coachData: CoachData) {
    // Wait for edit form to appear
    await page.waitForTimeout(1000);
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 5000 });
    
    // Upload Profile Image
    await uploadThumbnail(page, "file-input-profile || selected-exist-profile", {
      imagePath: path.join(__dirname, '..', 'public', 'images', 'profile-update.png')
    });
      
    // Edit First Name
    const firstNameField = page.getByLabel(/First Name/i)
    .or(page.locator('#firstName, input[name="firstName"]'));
    if (await firstNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
    await firstNameField.clear();
    await FileInput(firstNameField, coachData.firstName);
    }
      
    // Edit Last Name
    const lastNameField = page.getByLabel(/Last Name/i)
    .or(page.locator('#lastName, input[name="lastName"]'));
    if (await lastNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
    await lastNameField.clear();
    await FileInput(lastNameField, coachData.lastName);
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
    await dobField.fill(coachData.dob || '1995-05-20');
    await page.waitForTimeout(400);
    }

    // Edit Email
    const emailField = page.getByLabel(/Email/i)
    .or(page.locator('#email, input[name="email"]'));
    if (await emailField.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailField.clear();
    await FileInput(emailField, coachData.email);
    }
      
    // Edit Phone
    const phoneField = page.getByLabel(/Phone/i)
    .or(page.locator('input[name="phone"]'));
    if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await phoneField.clear();
    await FileInput(phoneField, coachData.phone);
    }
      
    // Edit Telegram
    const telegramField = page.getByPlaceholder(/Telegram/i)
    .or(page.locator('input[name="telegram"]'));
    if (await telegramField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await telegramField.clear();
    await FileInput(telegramField, coachData.telegram);
    }
      
    // Edit ID Number
    const idNumberField = page.getByLabel(/ID Number/i)
    .or(page.locator('input[name="idNumber"]'));
    if (await idNumberField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await idNumberField.clear();
        await FileInput(idNumberField, coachData.idNumber);
    }
      
    // Edit ABA Account Name
    const abaAccountNameField = page.getByLabel(/ABA Account Name/i)
    .or(page.locator('input[name="ABAAccountName"]'));
    if (await abaAccountNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await abaAccountNameField.clear();
        await FileInput(abaAccountNameField, coachData.abaAccountName);
    }
      
    // Edit ABA Account Number
    const abaAccountNumberField = page.getByLabel(/ABA Account Number/i)
    .or(page.locator('input[name="ABAAccountNumber"]'));
    if (await abaAccountNumberField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await abaAccountNumberField.clear();
        await FileInput(abaAccountNumberField, coachData.abaAccountNumber);
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
        await FileInput(majorField, coachData.major);
    }
      
    // Edit Cost Per Hour
    const costPerHourField = page.getByLabel(/Course Per Hour|Cost Per Hour/i)
    .or(page.locator('input[name="costPerHour"]'));
    if (await costPerHourField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await costPerHourField.clear();
        await FileInput(costPerHourField, coachData.costPerHour);
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

    // Address - Village
    const villageField = page.getByPlaceholder('Village')
      .or(page.locator('input[name="address.village"]'))
      .or(page.getByLabel(/Village/i));
    if (await villageField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await villageField.clear();
      await FileInput(villageField, coachData.address?.village || "");
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

    if (isCommuneVisible) {
      // Explicitly wait for the field to be enabled in case it depends on Village
      try {
        await expect(targetCommune).toBeEnabled({ timeout: 5000 });
      } catch (e) {
        console.log('Warning: Commune field did not become enabled:', e);
      }

      await targetCommune.click();
      await page.waitForTimeout(300);
      await targetCommune.clear(); // Clear existing value
      await FileInput(targetCommune, coachData.address?.commune || "");
      await targetCommune.blur();
      await page.waitForTimeout(500);
    }

    // District / Khan (Update)
    const districtField = page.getByPlaceholder('District / Khan')
      .or(page.locator('input[name="address.district"]'))
      .or(page.locator('#district'));
    if (await districtField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await districtField.scrollIntoViewIfNeeded();
      
      const isDisabled = await districtField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await page.waitForTimeout(300);
        await districtField.clear();
        await FileInput(districtField, coachData.address?.district || "");
      }
    }

    // City / Province (Update)
    const cityField = page.getByPlaceholder('City / Province')
      .or(page.locator('input[name="address.city"]'))
      .or(page.locator('#city'));
    if (await cityField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cityField.scrollIntoViewIfNeeded();
      
      const isDisabled = await cityField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await page.waitForTimeout(300);
        await cityField.clear();
        await FileInput(cityField, coachData.address?.city || "");
      }
    }

    // Work History
    if (coachData.workHistory && coachData.workHistory.length > 0) {
      const addWorkHistoryButton = page.getByRole('button', { name: /Add Work History/i })
        .or(page.locator('button:has-text("Add Work History")'))
        .or(page.locator('button:has(svg.lucide-plus)').filter({ hasText: /Work History/i }));
      
      if (await addWorkHistoryButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addWorkHistoryButton.scrollIntoViewIfNeeded();
        // Check if there is already a work history item, if so we don't click add, we edit existing.
        // But if the form is empty for some reason, click add.
        const existingField = page.locator('input[name="workHistory.0.position"]');
        if (!(await existingField.isVisible({ timeout: 1000 }).catch(() => false))) {
           await addWorkHistoryButton.click();
           await page.waitForTimeout(800);
        }
      }
      
      // Update first item
      const item = coachData.workHistory[0];
      
      const workPositionField = page.getByPlaceholder('Position')
        .or(page.locator('input[name="workHistory.0.position"]'))
        .or(page.getByLabel(/Position/i));
      if (await workPositionField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await workPositionField.clear();
        await FileInput(workPositionField, item.position);
      }
      
      const workOrgField = page.getByPlaceholder('Organization')
        .or(page.locator('input[name="workHistory.0.organization"]'))
        .or(page.getByLabel(/Organization/i));
      if (await workOrgField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await workOrgField.clear();
        await FileInput(workOrgField, item.organization);
      }
      
      const workStartDateField = page.locator('input[name="workHistory.0.startDate"]')
        .or(page.getByPlaceholder('Start Date'))
        .or(page.getByLabel(/Start Date/i)).first();
      if (await workStartDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await workStartDateField.clear();
        await workStartDateField.click();
        await page.waitForTimeout(300);
        await workStartDateField.fill(item.startDate);
        await page.waitForTimeout(400);
      }
      
      const workEndDateField = page.locator('input[name="workHistory.0.endDate"]')
        .or(page.getByPlaceholder('End Date'))
        .or(page.getByLabel(/End Date/i)).first();
      if (await workEndDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await workEndDateField.clear();
        await workEndDateField.click();
        await page.waitForTimeout(300);
        await workEndDateField.fill(item.endDate);
        await page.waitForTimeout(400);
      }
    }

    // Education Background
    if (coachData.educationBackground && coachData.educationBackground.length > 0) {
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
      
      // Update first item
      const item = coachData.educationBackground[0];
      
      const schoolNameField = page.getByPlaceholder('School Name')
        .or(page.locator('input[name="educationBackground.0.schoolName"]'))
        .or(page.getByLabel(/School Name/i));
      if (await schoolNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await schoolNameField.clear();
        await FileInput(schoolNameField, item.schoolName);
      }
      
      const majorEduField = page.locator('input[name="educationBackground.0.major"]');
      if (await majorEduField.isVisible({ timeout: 2000 }).catch(() => false)) {
         await majorEduField.clear();
         await FileInput(majorEduField, item.major);
      }
      
      const eduStartDateField = page.locator('input[name="educationBackground.0.startDate"]');
      if (await eduStartDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await eduStartDateField.clear();
        await eduStartDateField.click();
        await page.waitForTimeout(300);
        await eduStartDateField.fill(item.startDate);
        await page.waitForTimeout(400);
      }
      
      const eduEndDateField = page.locator('input[name="educationBackground.0.endDate"]');
      if (await eduEndDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await eduEndDateField.clear();
        await eduEndDateField.click();
        await page.waitForTimeout(300);
        await eduEndDateField.fill(item.endDate);
        await page.waitForTimeout(400);
      }
    }
    
    // Click Next button to proceed to Guardian tab
    await page.waitForTimeout(1000);
    const nextButton = page.getByRole('button', { name: /Next|next/i }).first();
    if (await nextButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nextButton.scrollIntoViewIfNeeded();
      await nextButton.click();
      await page.waitForTimeout(2000);
    }
    
    // ===== GUARDIAN TAB =====
    if (coachData.guardian) {
      const guardianNameField = page.locator('input[name="guardian.name"]')
        .or(page.getByPlaceholder('Name'))
        .or(page.getByLabel(/Name/i));
      if (await guardianNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guardianNameField.scrollIntoViewIfNeeded();
        await guardianNameField.clear();
        await page.waitForTimeout(200);
        await FileInput(guardianNameField, coachData.guardian.name);
      }
      
      const guardianPhoneField = page.locator('input[name="guardian.phone"]')
      .or(page.locator('#phone'))
        .or(page.getByPlaceholder('Phone Number'));
      if (await guardianPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guardianPhoneField.clear();
        await FileInput(guardianPhoneField, coachData.guardian.phone);
      }
      
      const guardianRelationField = page.locator('#relation')
        .or(page.locator('input[name="guardian.relation"]'))
        .or(page.getByPlaceholder('Relation'));
      if (await guardianRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guardianRelationField.clear();
        await FileInput(guardianRelationField, coachData.guardian.relation);
      }
      
      const guardianEmailField = page.locator('input[name="guardian.email"]')
        .or(page.getByPlaceholder('Email'));
      if (await guardianEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guardianEmailField.clear();
        await FileInput(guardianEmailField, coachData.guardian.email);
      }
      
      if (coachData.guardian.address) {
        const guardianVillageField = page.locator('input[name="guardian.address.village"]')
          .or(page.getByPlaceholder('Village'))
          .or(page.getByLabel(/Village/i));
        if (await guardianVillageField.isVisible({ timeout: 3000 }).catch(() => false)) {
          await guardianVillageField.scrollIntoViewIfNeeded();
          await guardianVillageField.clear();
          await page.waitForTimeout(200);
          await FileInput(guardianVillageField, coachData.guardian?.address?.village || '');
          await guardianVillageField.press('Tab');
          await page.waitForTimeout(1000);
        }
        
        const guardianCommuneField = page.locator('input[name="guardian.address.commune"]')
          .or(page.locator('#commune'))
          .or(page.getByPlaceholder(/Khum\/Sangkat|Commune/i))
          .or(page.getByLabel(/Commune/i));
        if (await guardianCommuneField.isVisible({ timeout: 3000 }).catch(() => false)) {
          try {
            await expect(guardianCommuneField).toBeEnabled({ timeout: 5000 });
          } catch (e) {
            console.log('Warning: Guardian Commune field did not become enabled:', e);
          }
          await guardianCommuneField.scrollIntoViewIfNeeded();
          await guardianCommuneField.clear();
          await guardianCommuneField.click();
          await page.waitForTimeout(200);
          await FileInput(guardianCommuneField, coachData.guardian?.address?.commune || "");
          await guardianCommuneField.blur();
          await page.waitForTimeout(500);
        }
        
        const guardianDistrictField = page.locator('input[name="guardian.address.district"]')
          .or(page.getByPlaceholder('District / Khan'))
          .or(page.getByLabel(/District|Khan/i));
        if (await guardianDistrictField.isVisible({ timeout: 3000 }).catch(() => false)) {
          const isDisabled = await guardianDistrictField.isDisabled().catch(() => false);
          if (!isDisabled) {
            await guardianDistrictField.scrollIntoViewIfNeeded();
            await guardianDistrictField.clear();
            await page.waitForTimeout(200);
            await FileInput(guardianDistrictField, coachData.guardian?.address?.district || "");
          }
        }
        
        const guardianCityField = page.locator('input[name="guardian.address.city"]')
          .or(page.getByPlaceholder('City / Province'))
          .or(page.getByLabel(/City|Province/i));
        if (await guardianCityField.isVisible({ timeout: 3000 }).catch(() => false)) {
          const isDisabled = await guardianCityField.isDisabled().catch(() => false);
          if (!isDisabled) {
            await guardianCityField.scrollIntoViewIfNeeded();
            await guardianCityField.clear();
            await page.waitForTimeout(200);
            await FileInput(guardianCityField, coachData.guardian?.address?.city || "");
          }
        }
      }
    }
    
    // Click Next button to proceed to Emergency tab
    await page.waitForTimeout(1000);
    const nextButton2 = page.getByRole('button', { name: /Next|next/i }).first();
    if (await nextButton2.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nextButton2.scrollIntoViewIfNeeded();
      await nextButton2.click();
      await page.waitForTimeout(2000);
    }
    
    // ===== EMERGENCY CONTACT TAB =====
    if (coachData.emergency) {
      const emergencyNameField = page.locator('input[name="emergency.name"]')
      .or(page.locator('#name'))
        .or(page.getByPlaceholder('Name'));
      if (await emergencyNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emergencyNameField.scrollIntoViewIfNeeded();
        await emergencyNameField.clear();
        await page.waitForTimeout(200);
        await FileInput(emergencyNameField, coachData.emergency.name);
      }
      
      const emergencyPhoneField = page.locator('input[name="emergency.phone"]')
      .or(page.locator('#phone'))
        .or(page.getByPlaceholder('Phone Number'));
      if (await emergencyPhoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emergencyPhoneField.clear();
        await FileInput(emergencyPhoneField, coachData.emergency.phone);
      }
      
      const emergencyRelationField = page.locator('input[name="emergency.relation"]')
      .or(page.locator('#relation'))
        .or(page.getByPlaceholder('Relation'));
      if (await emergencyRelationField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emergencyRelationField.clear();
        await FileInput(emergencyRelationField, coachData.emergency.relation);
      }
      
      const emergencyEmailField = page.locator('input[name="emergency.email"]')
        .or(page.getByPlaceholder('Email'));
      if (await emergencyEmailField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emergencyEmailField.clear();
        await FileInput(emergencyEmailField, coachData.emergency.email);
      }
      
      if (coachData.emergency.address) {
        const emergencyVillageField = page.locator('input[name="emergency.address.village"]')
          .or(page.getByPlaceholder('Village'))
          .or(page.getByLabel(/Village/i));
        if (await emergencyVillageField.isVisible({ timeout: 3000 }).catch(() => false)) {
          await emergencyVillageField.scrollIntoViewIfNeeded();
          await emergencyVillageField.clear();
          await page.waitForTimeout(200);
          await FileInput(emergencyVillageField, coachData.emergency?.address?.village || "");
          await emergencyVillageField.press('Tab');
          await page.waitForTimeout(1000);
        }
        
        const emergencyCommuneField = page.locator('input[name="emergency.address.commune"]')
          .or(page.locator('#commune'))
          .or(page.getByPlaceholder(/Khum\/Sangkat|Commune/i))
          .or(page.getByLabel(/Commune/i));
        if (await emergencyCommuneField.isVisible({ timeout: 3000 }).catch(() => false)) {
          try {
            await expect(emergencyCommuneField).toBeEnabled({ timeout: 5000 });
          } catch (e) {
            console.log('Warning: Emergency Commune field did not become enabled:', e);
          }
          await emergencyCommuneField.scrollIntoViewIfNeeded();
          await emergencyCommuneField.clear();
          await emergencyCommuneField.click();
          await page.waitForTimeout(200);
          await FileInput(emergencyCommuneField, coachData.emergency?.address?.commune || "");
          await emergencyCommuneField.blur();
          await page.waitForTimeout(500);
        }
        
        const emergencyDistrictField = page.locator('input[name="emergency.address.district"]')
          .or(page.getByPlaceholder('District / Khan'))
          .or(page.getByLabel(/District|Khan/i));
        if (await emergencyDistrictField.isVisible({ timeout: 3000 }).catch(() => false)) {
          const isDisabled = await emergencyDistrictField.isDisabled().catch(() => false);
          if (!isDisabled) {
            await emergencyDistrictField.scrollIntoViewIfNeeded();
            await emergencyDistrictField.clear();
            await page.waitForTimeout(200);
            await FileInput(emergencyDistrictField, coachData.emergency?.address?.district || '');
          }
        }
        
        const emergencyCityField = page.locator('input[name="emergency.address.city"]')
          .or(page.getByPlaceholder('City / Province'))
          .or(page.getByLabel(/City|Province/i));
        if (await emergencyCityField.isVisible({ timeout: 3000 }).catch(() => false)) {
          const isDisabled = await emergencyCityField.isDisabled().catch(() => false);
          if (!isDisabled) {
            await emergencyCityField.scrollIntoViewIfNeeded();
            await emergencyCityField.clear();
            await page.waitForTimeout(200);
            await FileInput(emergencyCityField, coachData.emergency?.address?.city || '');
          }
        }
      }
    }

    // Save/Update
    await page.waitForTimeout(1000);
    const saveButton = page.getByRole('button', { name: /Save|Update/i });
    if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveButton.scrollIntoViewIfNeeded();
        await saveButton.click();
        await page.waitForTimeout(1000);
    }
}
