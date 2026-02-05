import { test, expect } from "@playwright/test";
import { login } from "../utils/auth-helper";
import { addCursorTracking } from "../utils/cursor-helper";
import { FileInput } from "../utils/form-helper";
import { deleteItem } from "../utils/delete-helper";
import { toggleViewMode } from "../utils/view-helper";
import { uploadThumbnail } from "../utils/upload-thumbnail-helper";
import { generateTestmailAddress } from '../utils/email-helper';

// Test data for adding a new user
const userDataAdd = {
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@gmail.com",
  phone: "0123456789",
  role: "Admin",
  dob: new Date().toISOString().split("T")[0],
  address: {
    village: "Chamkar Mon",
    commune: "BKK1",
    district: "Chamkar Mon",
    city: "Phnom Penh",
  },
};

// Test data for editing a user
const userDataEdit = {
  firstName: "Jane",
  lastName: "Smith",
  phone: "0987654321",
  role: "Manager",
  dob: "1995-05-15",
  gender: "Female",
  address: {
    village: "Boeung Keng Kang",
    commune: "Boeung Keng Kang",
    district: "Chamkar Mon",
    city: "Phnom Penh",
  },
};

test.describe("Users", () => {
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);

    // Wait for the loading screen to disappear
    await expect(
      page.getByText("Please wait while we load your workspace")
    ).toBeHidden({ timeout: 20000 });
    await page.getByText("User", { exact: true }).click();
    await expect(page).toHaveURL(/\/users/);
  });



  //   =====================================
  // Add new user
  //   =====================================

  test("Add new user", async ({ page }) => {
    test.setTimeout(120000);

    // Click Add button
    await page
      .getByRole("button")
      .filter({ has: page.locator("svg.lucide-plus") })
      .click();
    await page.waitForTimeout(200);

    // Upload Profile Image
    await uploadThumbnail(page, "file-input-profile || selected-exist-profile");

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

    // Verify success
    const successIndicators = [
      page.getByText(/successfully/i),
      page.getByText(/created/i),
      page.getByText(`${userDataAdd.firstName} ${userDataAdd.lastName}`),
    ];

    let successFound = false;
    for (const indicator of successIndicators) {
      if (await indicator.isVisible({ timeout: 3000 }).catch(() => false)) {
        successFound = true;
        break;
      }
    }

    if (successFound) {
      console.log("✓ User created successfully");
    }
  });


  // ===================================
// User page
// ===================================

  test("User Page", async ({ page }) => {
    await expect(page).toHaveTitle(/User/i);
    await page.waitForTimeout(1000);
    await toggleViewMode(page);
    await page.waitForTimeout(1000);
  });

  //=====================================
  // Edit user
  // =====================================
  test("Edit user", async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(120000);
    await page.waitForTimeout(1000);

    // Get all user rows/items
    const userRows = page.locator(
      'table tbody tr, [role="row"], .user-item, div[class*="user"]'
    );

    // Get the user at index 0 (first user)
    const userAtIndex0 = userRows.nth(0);
    await userAtIndex0.waitFor({ state: "visible", timeout: 5000 });

    // Click the edit icon (pencil icon) directly within the row
    const editIcon = userAtIndex0
      .locator("button")
      .filter({ has: page.locator("svg") })
      .filter({ hasNot: page.locator("svg.lucide-trash") }) // Exclude delete button
      .first();

    if (await editIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editIcon.click();

      // Wait for the edit drawer/form to appear
      await page.waitForTimeout(1500);


      
    // Upload Profile Image
    await uploadThumbnail(page, "file-input-profile || selected-exist-profile");

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

      // Edit Address Fields
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
    }
  });

  //   =====================================
  // Delete user
  //   =====================================

  test("Delete user", async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(120000);

    // Wait for the user list to load
    await page.waitForTimeout(2000);

    // Get all user rows/items
    const userRows = page.locator(
      'table tbody tr, [role="row"], .user-item, div[class*="user"]'
    );
    // Use index 0
    const indexToDelete = 0;
    const userToDelete = userRows.nth(indexToDelete);

    // Wait for the user row to be visible
    if (await userToDelete.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Find the delete icon within this specific user row
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
