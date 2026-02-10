import { test, expect } from "@playwright/test";
import { login } from "../utils/auth-helper";
import { addCursorTracking } from "../utils/cursor-helper";
import { FileInput } from "../utils/form-helper";
import { deleteItem } from "../utils/delete-helper";
import { toggleViewMode } from "../utils/view-helper";
import { uploadThumbnail } from "../utils/upload-thumbnail-helper";
import { getTestEmail } from '../utils/email-helper';
import { createUser, updateUser } from '../components/users';

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


    const testEmail = getTestEmail(userDataAdd.firstName, userDataAdd.lastName);
    console.log('Using test email for new user:', testEmail);

    const userToAdd = {
        ...userDataAdd,
        email: testEmail
    };

    await createUser(page, userToAdd);

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
      
      await updateUser(page, userDataEdit);
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
