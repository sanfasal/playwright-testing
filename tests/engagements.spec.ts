import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { fillFieldWithDelay } from '../utils/form-helper';
import { deleteItem } from '../utils/delete-helper';

// Test suite for Engagement Dashboard
test.describe('Engagement Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Engagement', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('Dashboard', { exact: true }).last().click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/engagements');
    await page.waitForTimeout(1000);
  });

  test('Dashboard page loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
  });
});


// Test suite for Engagement List
test.describe('Engagement List', () => {
  test.setTimeout(120000);
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Engagement', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('List Engagements', { exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/engagements/);
    await page.waitForTimeout(1000);
  });

  // ============================
  // Add new engagement
  //=============================

  test('Add new engagement', async ({ page }) => {
    // Verify we're on the engagements list page
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(500);

    // === OPEN ADD ENGAGEMENT DRAWER ===
    await page.locator('#add-deal-button').click();
    await page.waitForTimeout(800);
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    await page.waitForTimeout(500);
    
    // Fill First Name
    const firstNameField = page.getByLabel(/First Name/i);
    await fillFieldWithDelay(firstNameField, 'John');
    
    // Fill Last Name
    const lastNameField = page.getByLabel(/Last Name/i);
    await fillFieldWithDelay(lastNameField, 'Doe');

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

     // Stage Selection (Dropdown)
    const stageButton = page
      .locator('button[role="combobox"]')
      .filter({ has: page.locator("svg") })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .nth(1);

    if (await stageButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await stageButton.click();
      await page.waitForTimeout(500);
      const firstOption = page.locator('[role="option"]').first();
      await firstOption.click();
      await page.waitForTimeout(400);
    }
    
    // Fill Amount
    const amountField = page.getByLabel(/Amount \(\$\)/i);
    await fillFieldWithDelay(amountField, '5000');
    
    // Fill Email
    const emailField = page.getByLabel(/Email/i);
    await fillFieldWithDelay(emailField, 'john.doe@example.com');
    
    // Fill Phone
    const phoneField = page.getByLabel(/Phone/i);
    await fillFieldWithDelay(phoneField, '1234567890');

         // Priority Selection (Dropdown)
    const priorityButton = page
      .locator('button[role="combobox"]')
      .filter({ has: page.locator("svg") })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .nth(2);

    if (await priorityButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await priorityButton.click();
      await page.waitForTimeout(500);
      const firstOption = page.locator('[role="option"]').first();
      await firstOption.click();
      await page.waitForTimeout(400);
    }

        // Fill Expect Class
        const expectClassButton = page
      .locator('button[role="combobox"]')
      .filter({ has: page.locator("svg") })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .nth(3);

    if (await expectClassButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expectClassButton.click();
      await page.waitForTimeout(500);
      const firstOption = page.locator('[role="option"]').first();
      await firstOption.click();
      await page.waitForTimeout(400);
    }

        // Fill Probability
    const probabilityField = page.getByLabel(/Probability/i);
    await fillFieldWithDelay(probabilityField, '50');

            // Fill Resource Type
        const resourceTypeButton = page
      .locator('button[role="combobox"]')
      .getByPlaceholder('Resource Type')
      .filter({ has: page.locator("svg") })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .nth(4);

    if (await resourceTypeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await resourceTypeButton.click();
      await page.waitForTimeout(500);
      const firstOption = page.locator('[role="option"]').first();
      await firstOption.click();
      await page.waitForTimeout(400);
    }

            // Fill Resource Link
    const resourceLink = page.getByLabel(/Resource Link/i);
    await fillFieldWithDelay(resourceLink, 'https://example.com');

    // Step 2: Click to open the assign to dropdown
    const assignToDropdown = page.locator('button')
      .filter({ hasText: 'Assign To' })
      .or(page.locator('button[data-slot="popover-trigger"]').filter({ hasText: 'Assign To' }))
      .first();
    
    // Click the dropdown to open it
    if (await assignToDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await assignToDropdown.click();
      await page.waitForTimeout(1200);
      
      // Click on the first assign to option (index 0)
      await page.waitForTimeout(500);
      
      // Select the first assign to from the dropdown
      const assignToOptions = page.locator('[role="option"], li label, .coach-item, [class*="option"]');
      const firstAssignTo = assignToOptions.nth(0);
      
      if (await firstAssignTo.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstAssignTo.click();
        await page.waitForTimeout(800);
      }
      
      // Close the dropdown by clicking outside or pressing Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
            // Fill Note
    const note = page.getByLabel(/Note/i);
    await fillFieldWithDelay(note, 'This is a note');
    
    // Submit the form
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);
    
    // Verify the engagement was created (drawer should close)
    // const firstTextbox = page.getByRole('textbox').first();
    // await expect(firstTextbox).toBeHidden({ timeout: 5000 });
    // await page.waitForTimeout(500);
  });


  // ============================
  // Edit Engagement
  // ============================

  test('Edit Engagement', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    await page.locator('span.bg-yellow-500').nth(0).click();
    await page.waitForTimeout(1000);
    const actionsMenuButton = page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical') }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
    await page.getByText(/Edit/i).click();
    await page.waitForTimeout(1000);
    const firstNameField = page.getByLabel(/First Name/i);
    await fillFieldWithDelay(firstNameField, 'John Updated');
    const amountField = page.getByLabel(/Amount \(\$\)/i);
    await fillFieldWithDelay(amountField, '6000');

    // Submit the form
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Update|Save|Confirm/i }).click();
    await page.waitForTimeout(1500);
  });

  // ============================
  // Delete Engagement
  // ============================

  test('Delete Engagement', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    await page.locator('span.bg-yellow-500').nth(0).click();
    await page.waitForTimeout(1000);
    const actionsMenuButton = page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical') }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
    await page.getByText(/Delete|Remove/i).click();
    await page.waitForTimeout(1000);
    await deleteItem(page);
    await page.waitForTimeout(1000);
  });
});
