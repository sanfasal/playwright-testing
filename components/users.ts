import { Page, expect } from '@playwright/test';
import { FileInput } from '../utils/form-helper';
import { uploadThumbnail } from '../utils/upload-thumbnail-helper';
import { generateTestmailAddress } from '../utils/email-helper';
import path from 'path';

/**
 * Creates a user by filling out the form.
 * @param page - Playwright Page object
 * @param userData - Object containing user data
 */
export async function createUser(page: Page, userData: any) {
    // Wait for the form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 5000 });

    // Upload Profile Image
    await uploadThumbnail(page, "file-input-profile || selected-exist-profile", {
      imagePath: path.join(__dirname, '..', 'public', 'images', 'profile-create.png')
    });

    // Fill First Name
    const firstNameField = page.getByLabel(/First Name/i)
      .or(page.locator('#firstName, input[name="firstName"]'));
    await FileInput(firstNameField, userData.firstName);

    // Fill Last Name
    const lastNameField = page.getByLabel(/Last Name/i)
      .or(page.locator('#lastName, input[name="lastName"]'));
    await FileInput(lastNameField, userData.lastName);

    // Fill Email
    // Logic to handle auto-generated email if needed, or use userData.email
    const emailField = page.getByLabel(/email/i)
      .or(page.getByPlaceholder(/email/i))
      .or(page.locator('input[type="email"]'));
    
    if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
        let emailToUse = userData.email;
        // If email is not provided or looks like a template, we might want to generate one
        // But usually userData passed from full-test should be ready. 
        // We'll trust userData.email first.
        await FileInput(emailField, emailToUse);
    }

    // Gender Selection (Dropdown) - Optional if in userData
    if (userData.gender) {
        const genderButton = page.locator('button[role="combobox"]').filter({ has: page.locator('svg') })
          .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
          .first();
        
        if (await genderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await genderButton.click();
          await page.waitForTimeout(500);
          // Try to match text, otherwise pick first
          const option = page.locator('[role="option"]').filter({ hasText: userData.gender }).first();
          if (await option.isVisible({ timeout: 1000 }).catch(() => false)) {
              await option.click();
          } else {
              const firstOption = page.locator('[role="option"]').first();
              await firstOption.click();
          }
          await page.waitForTimeout(400);
        }
    } else {
        // Default to first option if not specified but field exists
        const genderButton = page.locator('button[role="combobox"]').filter({ has: page.locator('svg') })
          .first();
        if (await genderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await genderButton.click();
            await page.waitForTimeout(500);
            await page.locator('[role="option"]').first().click();
            await page.waitForTimeout(400);
        }
    }

    // Fill Date of Birth
    const dobField = page.getByLabel(/Date of Birth|DOB|Birth Date/i)
      .or(page.locator('#dob, input[name="dob"], input[type="date"]'));
    
    if (await dobField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dobField.click();
        await page.waitForTimeout(300);
        await dobField.fill(userData.dob);
        await page.waitForTimeout(400);
    }

    // Fill Phone
    const phoneField = page.locator("#phone")
      .or(page.getByLabel(/Phone Number/i))
      .or(page.getByPlaceholder(/012345678/i));
    if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(phoneField, userData.phone);
    }

    // Select Role
    await page.waitForTimeout(500);
    const roleDropdown = page.getByRole("combobox", { name: /Select a role/i })
      .or(page.locator('button:has-text("Select a role")'))
      .or(page.locator('[aria-label="Select a role"]'));

    if (await roleDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await roleDropdown.click();
      await page.waitForTimeout(500);

      // Select based on userData.role or default to first
      if (userData.role) {
          const roleOption = page.locator('[role="option"]').filter({ hasText: userData.role }).first();
          if (await roleOption.isVisible({ timeout: 1000 }).catch(() => false)) {
              await roleOption.click();
          } else {
               await page.locator('[role="option"]').nth(0).click();
          }
      } else {
          await page.locator('[role="option"]').nth(0).click();
      }
      await page.waitForTimeout(400);
    }

    // Address
    // Village
    const villageField = page.getByPlaceholder("Village")
      .or(page.locator('input[name="address.village"]'))
      .or(page.getByLabel(/Village/i));
    if (await villageField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(villageField, userData.address.village);
      await page.waitForTimeout(1000);
    }

    // Commune
    const communeField = page.getByPlaceholder("Commune")
      .or(page.locator('input[name="address.commune"]'))
      .or(page.locator("#commune"));
    if (await communeField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await communeField.scrollIntoViewIfNeeded();
      const isDisabled = await communeField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await page.waitForTimeout(300);
        await FileInput(communeField, userData.address.commune);
      }
    }

    // District
    const districtField = page.getByPlaceholder("District")
      .or(page.locator('input[name="address.district"]'))
      .or(page.locator("#district"));
    if (await districtField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await districtField.scrollIntoViewIfNeeded();
      const isDisabled = await districtField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await page.waitForTimeout(300);
        await FileInput(districtField, userData.address.district);
      }
    }

    // City
    const cityField = page.getByPlaceholder("Province")
      .or(page.locator('input[name="address.city"]'))
      .or(page.locator("#city"));
    if (await cityField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cityField.scrollIntoViewIfNeeded();
      const isDisabled = await cityField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await page.waitForTimeout(300);
        await FileInput(cityField, userData.address.city);
      }
    }

    // Active Toggle (ensure it matches userData.isActive if provided, otherwise default to true/click if unchecked)
    const activeToggle = page.locator("#isActive").or(page.getByLabel("Active User"));
    if (await activeToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      const isChecked = await activeToggle.getAttribute("aria-checked").catch(() => "false");
      // If we want it active (default) and it's false, click it.
      // If user passed explicit isActive=false, we might want to uncheck it.
      // For now, let's assume we want to ensure it is Active for creation unless specified otherwise
      const shouldBeActive = userData.isActive !== false; // default true
      
      if (shouldBeActive && isChecked === "false") {
        await activeToggle.click();
      } else if (!shouldBeActive && isChecked === "true") {
        await activeToggle.click();
      }
      await page.waitForTimeout(500);
    }

    // Submit
    await page.waitForTimeout(500);
    const submitButton = page.getByRole("button", { name: /Add|Create|Submit/i });
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }
}

/**
 * Updates a user by filling out the form.
 * @param page - Playwright Page object
 * @param userData - Object containing user data
 */
export async function updateUser(page: Page, userData: any) {
     // Wait for the form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 5000 });

    // Upload Profile Image
    await uploadThumbnail(page, "file-input-profile || selected-exist-profile", {
      imagePath: path.join(__dirname, '..', 'public', 'images', 'profile-update.png')
    });

    // Update First Name
    const firstNameField = page.getByLabel(/First Name/i)
      .or(page.locator('#firstName, input[name="firstName"]'));
    if (await firstNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstNameField.clear();
      await FileInput(firstNameField, userData.firstName);
    }

    // Update Last Name
    const lastNameField = page.getByLabel(/Last Name/i)
      .or(page.locator('#lastName, input[name="lastName"]'));
    if (await lastNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await lastNameField.clear();
      await FileInput(lastNameField, userData.lastName);
    }

     // Update Gender
    if (userData.gender) {
        const genderButton = page.locator('button[role="combobox"]').filter({ has: page.locator('svg') })
          .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
          .first();
        
        if (await genderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await genderButton.click();
          await page.waitForTimeout(500);
          const option = page.locator('[role="option"]').filter({ hasText: userData.gender }).first();
          if (await option.isVisible({ timeout: 1000 }).catch(() => false)) {
             await option.click();
          } else {
             // Fallback
             await page.locator('[role="option"]').nth(0).click();
          }
          await page.waitForTimeout(400);
        }
    }

    
    // Update DOB
    const dobField = page.getByLabel(/Date of Birth|DOB|Birth Date/i)
      .or(page.locator('#dob, input[name="dob"], input[type="date"]'));
    if (await dobField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dobField.click();
      await page.waitForTimeout(300);
      await dobField.fill(userData.dob);
      await page.waitForTimeout(400);
    }

    // Update Phone
    const phoneField = page.locator("#phone")
      .or(page.getByLabel(/Phone Number/i))
      .or(page.getByPlaceholder(/012345678/i));
    if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await phoneField.clear();
      await FileInput(phoneField, userData.phone);
    }

    // Update Role
    const roleDropdown = page.locator('button[role="combobox"]')
      .filter({ has: page.locator('svg.lucide-chevron-down') })
      .filter({ hasText: /Admin|Manager|User|Select a role/i })
      .first();

    if (await roleDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await roleDropdown.click();
      await page.waitForTimeout(500);
       if (userData.role) {
          const roleOption = page.locator('[role="option"]').filter({ hasText: userData.role }).first();
           if (await roleOption.isVisible({ timeout: 1000 }).catch(() => false)) {
              await roleOption.click();
          } else {
               await page.locator('[role="option"]').nth(0).click();
          }
      } else {
           await page.locator('[role="option"]').nth(0).click();
      }
      await page.waitForTimeout(400);
    }

     // Address
    // Village
    const villageField = page.getByPlaceholder("Village")
      .or(page.locator('input[name="address.village"]'))
      .or(page.getByLabel(/Village/i));
    if (await villageField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await villageField.clear();
      await FileInput(villageField, userData.address.village);
      await page.waitForTimeout(1000);
    }

    // Commune
    const communeField = page.getByPlaceholder("Commune")
      .or(page.locator('input[name="address.commune"]'))
      .or(page.locator("#commune"));
    if (await communeField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await communeField.scrollIntoViewIfNeeded();
      const isDisabled = await communeField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await communeField.clear();
        await FileInput(communeField, userData.address.commune);
      }
    }

    // District
    const districtField = page.getByPlaceholder("District")
      .or(page.locator('input[name="address.district"]'))
      .or(page.locator("#district"));
    if (await districtField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await districtField.scrollIntoViewIfNeeded();
      const isDisabled = await districtField.isDisabled().catch(() => false);
      if (!isDisabled) {
        await districtField.clear();
        await FileInput(districtField, userData.address.district);
      }
    }

    // City
    const cityField = page.getByPlaceholder("Province")
      .or(page.locator('input[name="address.city"]'))
      .or(page.locator("#city"));
    if (await cityField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cityField.scrollIntoViewIfNeeded();
        const isDisabled = await cityField.isDisabled().catch(() => false);
        if (!isDisabled) {
        await cityField.clear();
        await FileInput(cityField, userData.address.city);
        }
    }

    // Active Toggle (Update if needed)
    const activeToggle = page.locator("#isActive").or(page.getByLabel("Active User"));
    if (await activeToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
       // logic for updating active state if userData specifies it
    }

    // Submit
    await page.waitForTimeout(500);
    const submitButton = page.getByRole("button", { name: /Update|Save|Submit/i });
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }
}
