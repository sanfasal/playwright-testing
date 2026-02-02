import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { FileInput } from '../utils/form-helper';
import { deleteItem } from '../utils/delete-helper';

// Test suite for Engagement Dashboard
const randomSuffix = Math.floor(Math.random() * 10000);

const engagementDataAdd = {
  firstName: `John ${randomSuffix}`,
  lastName: `Doe ${randomSuffix}`,
  amount: '800',
  email: `john.doe.${randomSuffix}@example.com`,
  phone: '1234567890',
  probability: '50',
  resourceLink: 'https://example.com',
  note: 'This is a note'
};

const engagementDataEdit = {
  firstName: `Sok ${randomSuffix}`,
  lastName: `Heng ${randomSuffix}`,
  amount: '700',
  email: `sok.heng.${randomSuffix}@example.com`,
  phone: '0987654321',
  probability: '75',
  resourceLink: 'https://updated-example.com',
  note: 'Note has Updated'
};

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
test.describe('Engagement', () => {
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
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(500);
    await page.locator('#add-deal-button').click();
    await page.waitForTimeout(800);
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    await page.waitForTimeout(500);

    const firstNameField = page.getByLabel(/First Name/i);
    await FileInput(firstNameField, engagementDataAdd.firstName);
    
    // Fill Last Name
    const lastNameField = page.getByLabel(/Last Name/i);
    await FileInput(lastNameField, engagementDataAdd.lastName);

    // Gender Selection (Dropdown)
    const genderButton = page
      .locator('button[role="combobox"]')
      .filter({ has: page.locator("svg") })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .first();

    if (await genderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await genderButton.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        // Select the first option (index 0)
        await options.nth(0).click();
      }
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
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }
    
    // Fill Amount
    const amountField = page.getByLabel(/Amount \(\$\)/i);
    await FileInput(amountField, engagementDataAdd.amount);
    
    // Fill Email
    // Use exact name match or specific input locator to avoid matching "Emails" tab
    const emailField = page.locator('input[name="email"]');
    await FileInput(emailField, engagementDataAdd.email);
    
    // Fill Phone
    const phoneField = page.getByLabel(/Phone/i);
    await FileInput(phoneField, engagementDataAdd.phone);

         // Priority Selection (Dropdown)
    const priorityButton = page
      .locator('button[role="combobox"]')
      .filter({ has: page.locator("svg") })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .nth(2);

    if (await priorityButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await priorityButton.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }
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
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }

    // Fill Probability
    const probabilityField = page.getByLabel(/Probability/i);
    await FileInput(probabilityField, engagementDataAdd.probability);

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
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }

            // Fill Resource Link
    const resourceLink = page.getByLabel(/Resource Link/i);
    await FileInput(resourceLink, engagementDataAdd.resourceLink);

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
    // Use specific ID or name locator to avoid matching "Notes" tab
    const note = page.locator('textarea#note');
    await FileInput(note, engagementDataAdd.note);
    
    // Submit the form
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);

  });

  //=============================
  // View Detail Engagement
  //=============================
  test('View Detail Engagement', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Activities', { exact: true }).click();
    await page.waitForTimeout(500);

    // Click on Emails tab
    await page.getByText('Emails', { exact: true }).click();
    await page.waitForTimeout(500);

    // Click on Calls tab
    await page.getByText('Calls', { exact: true }).click();
    await page.waitForTimeout(500);

    // Click on Notes tab
    await page.getByText('Notes', { exact: true }).click();
    await page.waitForTimeout(500);

  });

  // ============================
  // Edit Engagement
  // ============================

  test('Edit Engagement', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    const actionsMenuButton = page.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
    
    // Click Edit
    await page.getByText(/Edit/i).click();
    
    // Wait for drawer/form
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    await page.waitForTimeout(500);

    // Edit First Name
    const firstNameField = page.getByLabel(/First Name/i);
    await FileInput(firstNameField, engagementDataEdit.firstName);
    
    // Edit Last Name
    const lastNameField = page.getByLabel(/Last Name/i);
    await FileInput(lastNameField, engagementDataEdit.lastName);

    // Edit Gender (Dropdown)
    const genderButton = page.locator('button[role="combobox"]').filter({ has: page.locator("svg") }).first();
    if (await genderButton.isVisible({ timeout: 2000 })) {
      await genderButton.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
          const randomIndex = Math.floor(Math.random() * count);
          await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }

    // Edit Stage (Dropdown)
    const stageButton = page.locator('button[role="combobox"]').filter({ has: page.locator("svg") }).nth(1);
    if (await stageButton.isVisible({ timeout: 2000 })) {
      await stageButton.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
          const randomIndex = Math.floor(Math.random() * count);
          await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }
    
    // Edit Amount
    const amountField = page.getByLabel(/Amount \(\$\)/i);
    await FileInput(amountField, engagementDataEdit.amount);
    
    // Edit Email
    const emailField = page.locator('input[name="email"]');
    await FileInput(emailField, engagementDataEdit.email);
    
    // Edit Phone
    const phoneField = page.getByLabel(/Phone/i);
    await FileInput(phoneField, engagementDataEdit.phone);

    // Edit Priority (Dropdown)
    const priorityButton = page.locator('button[role="combobox"]').filter({ has: page.locator("svg") }).nth(2);
    if (await priorityButton.isVisible({ timeout: 2000 })) {
      await priorityButton.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }

    // Edit Expect Class (Dropdown)
    const expectClassButton = page.locator('button[role="combobox"]').filter({ has: page.locator("svg") }).nth(3);
    if (await expectClassButton.isVisible({ timeout: 2000 })) {
      await expectClassButton.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }

    // Edit Probability
    const probabilityField = page.getByLabel(/Probability/i);
    await FileInput(probabilityField, engagementDataEdit.probability);

    // Edit Resource Type (Dropdown)
    const resourceTypeButton = page.locator('button[role="combobox"]').filter({ has: page.locator("svg") }).nth(4);
    if (await resourceTypeButton.isVisible({ timeout: 2000 })) {
      await resourceTypeButton.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }
      await page.waitForTimeout(400);
    }

    // Edit Resource Link
    const resourceLink = page.getByLabel(/Resource Link/i);
    await FileInput(resourceLink, engagementDataEdit.resourceLink);

    // Edit Assign To
    const assignToDropdown = page.locator('button').filter({ hasText: 'Assign To' }).or(page.locator('button[data-slot="popover-trigger"]').filter({ hasText: 'Assign To' })).first();
    if (await assignToDropdown.isVisible({ timeout: 2000 })) {
      await assignToDropdown.click();
      await page.waitForTimeout(1200);
      const assignToOptions = page.locator('[role="option"], li label, .coach-item, [class*="option"]');
      if (await assignToOptions.count() > 0) {
           await assignToOptions.first().click();
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // Edit Note
    const note = page.locator('textarea#note');
    await FileInput(note, engagementDataEdit.note);

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
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    const actionsMenuButton = page.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    await page.getByText(/Delete|Remove/i).click();
    await page.waitForTimeout(1000);
    await deleteItem(page);
    await page.waitForTimeout(1000);
  });
});

test.describe('Engagement Tabs List', () => {
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
  //  Activity
  // ============================

  // Create Activity
  test('Create Activity', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Activities', { exact: true }).click();

    // Click on Add Activity button
    await page.getByText('Add Activity', { exact: true }).click();

    // Fill Activity Name
    const activityName = page.getByLabel(/Title/i);
    await FileInput(activityName, "Activity Title");

    // Select category
    await page.waitForTimeout(500);
    const categoryDropdown = page
      .locator("button[role='combobox']:has(+ label:text('Category'))")
      .or(page.locator("button[role='combobox']").filter({ has: page.locator('+ label', { hasText: 'Category' }) }))
      .or(page.getByText('Category', { exact: true }).locator('..').getByRole('combobox'));

    if (await categoryDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryDropdown.click();
      await page.waitForTimeout(500);

      // Select the first option (index 0)
      const firstOption = page.locator('[role="option"]').nth(0);
      if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstOption.click();
        console.log("✓ Selected category from dropdown");
        await page.waitForTimeout(400);
      }
    }

      // Fill Start Date field (static date)
    const startDate = '12-12-2025'; // Static start date
    const startDateField = page.getByLabel(/start date/i)
      .or(page.getByPlaceholder(/start date/i))
      .or(page.locator('input[type="date"]').first());
    await FileInput(startDateField, startDate);
    
    // Fill End Date field (static date)
    const endDateFormatted = '01-16-2026'; // Static end date    
    const endDateField = page.getByLabel(/end date/i)
      .or(page.getByPlaceholder(/end date/i))
      .or(page.locator('input[type="date"]').nth(1));
    await FileInput(endDateField, endDateFormatted);
    
    // Fill Start Time field
    await page.waitForTimeout(500);
    const startTimeInput = page.getByLabel(/start time/i)
      .or(page.locator('#startTime'))
      .or(page.getByPlaceholder(/start time/i));
    
    await FileInput(startTimeInput, '08:30AM');
    
    // Fill End Time field
    await page.waitForTimeout(500);
    const endTimeInput = page.getByLabel(/end time/i)
      .or(page.locator('#endTime'))
      .or(page.getByPlaceholder(/end time/i));
    
    await FileInput(endTimeInput, '11:30AM');
    
    // Fill Activity Description
    const activityDescription = page.locator('textarea#note').or(page.getByPlaceholder('Add notes here...'));
    await FileInput(activityDescription, "Activity Description");

    // Toggle Activity Completed
    const completedSwitch = page.locator('button#isCompleted').or(page.getByLabel('Activity completed'));
    if (await completedSwitch.isVisible()) {
      await completedSwitch.click();
      await page.waitForTimeout(500);
    }

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);

  });

  // Edit Activity
  test('Edit Activity', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);

    
    // Click on Activities tab
    await page.getByText('Activities', { exact: true }).click();
    const activityItem = page.locator('div').filter({ hasText: 'Activity Title' }).filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).last();

    const actionsMenuButton = activityItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Edit
    await page.getByText(/Edit/i).click();
    await page.waitForTimeout(500);

    // Edit Activity Name
    const activityName = page.getByLabel(/Title/i);
    await activityName.clear();
    await FileInput(activityName, "Update Activity Title");

    // Select category
    await page.waitForTimeout(500);
    const categoryDropdown = page
      .locator("button[role='combobox']:has(+ label:text('Category'))")
      .or(page.locator("button[role='combobox']").filter({ has: page.locator('+ label', { hasText: 'Category' }) }))
      .or(page.getByText('Category', { exact: true }).locator('..').getByRole('combobox'));

    if (await categoryDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryDropdown.click();
      await page.waitForTimeout(500);

      // Select the first option (index 0)
      const firstOption = page.locator('[role="option"]').nth(0);
      if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstOption.click();
        console.log("✓ Selected category from dropdown");
        await page.waitForTimeout(400);
      }
    }

    // Edit Start Date field (static date)
    const startDate = '12-12-2025'; // Static start date
    const startDateField = page.getByLabel(/start date/i)
      .or(page.getByPlaceholder(/start date/i))
      .or(page.locator('input[type="date"]').first());
    await startDateField.clear();
    await FileInput(startDateField, startDate);
    
    // Edit End Date field (static date)
    const endDateFormatted = '01-16-2026'; // Static end date    
    const endDateField = page.getByLabel(/end date/i)
      .or(page.getByPlaceholder(/end date/i))
      .or(page.locator('input[type="date"]').nth(1));
    await endDateField.clear();
    await FileInput(endDateField, endDateFormatted);
    
    // Edit Start Time field
    await page.waitForTimeout(500);
    const startTimeInput = page.getByLabel(/start time/i)
      .or(page.locator('#startTime'))
      .or(page.getByPlaceholder(/start time/i));
    await startTimeInput.clear();
    await FileInput(startTimeInput, '09:30AM');
    
    // Edit End Time field
    await page.waitForTimeout(500);
    const endTimeInput = page.getByLabel(/end time/i)
      .or(page.locator('#endTime'))
      .or(page.getByPlaceholder(/end time/i));
    await endTimeInput.clear();
    await FileInput(endTimeInput, '12:30PM');
    
    // Edit Activity Description
    const activityDescription = page.locator('textarea#note').or(page.getByPlaceholder('Add notes here...'));
    await activityDescription.clear();
    await FileInput(activityDescription, "Updated Activity Description");

    // Toggle Activity Completed (if needed)
    const completedSwitch = page.locator('button#isCompleted').or(page.getByLabel('Activity completed'));
    if (await completedSwitch.isVisible()) {
      await completedSwitch.click();
      await page.waitForTimeout(500);
    }

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Update/i }).click();
    await page.waitForTimeout(1500);
  });

  // Create Comment
  test('Comment on Activity', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Activities', { exact: true }).click();
    await page.waitForTimeout(500);

    // Click on Add Comment button
    await page.getByRole('button', { name: '+ Add Comment' }).first().click();
    await page.waitForTimeout(1000);

    // Fill Comment
    const commentField = page.locator('textarea#comment');
    await FileInput(commentField, "Comment on activity");

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);
  });

  // Edit Comment
  test('Edit on Comment Activity', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Activities', { exact: true }).click();
    await page.waitForTimeout(500);

    const commentItem = page.locator('div').filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).last();

    const actionsMenuButton = commentItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
    await page.getByText(/Edit/i).click();
    await page.waitForTimeout(500);

    // Edit comment field
    const commentFieldUpdate = page.locator('textarea#comment');
    await commentFieldUpdate.clear();
    await FileInput(commentFieldUpdate, "Updated Comment on activity");
    
    await page.getByRole('button', { name: /Update|Save/i }).click();
    await page.waitForTimeout(1500);
  });

  // Delete Comment
  test('Delete Comment on Activity', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Activities', { exact: true }).click();
    await page.waitForTimeout(500);

    // Delete the comment
    const commentItem = page.locator('div').filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).last();

    const actionsMenuButton = commentItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Delete
    await page.getByText(/Delete|Remove/i).click();
    await page.waitForTimeout(500);
    await deleteItem(page);
    await page.waitForTimeout(1000);
  });

    // Delete Activity
  test('Delete Activity', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Activities', { exact: true }).click();
  
    const activityItem = page.locator('div').filter({ hasText: 'Activity Title' }).filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).last();

    const actionsMenuButton = activityItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Delete
    await page.getByText(/Delete|Remove/i).click();
    await page.waitForTimeout(500);
    await deleteItem(page);
    await page.waitForTimeout(1000);

  });


  // ============================
  //  Emails
  // ============================

  // Create Email
    test('Create Email', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    await page.getByText('Emails', { exact: true }).click();
    await page.getByText('Add Emails', { exact: true }).click();

    // Fill recipient
    const recipient = page.getByLabel(/recipient/i);
    await FileInput(recipient, "recipient.tech@email.com");

        // Fill subject
    const subject = page.getByLabel(/subject/i);
    await FileInput(subject, "Web development");
   
    // Fill Body
    const body = page.locator('textarea#body').or(page.getByPlaceholder('Body'));
    await FileInput(body, "body of email");

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);

  });

  // Edit Email
  test('Edit Email', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    await page.getByText('Emails', { exact: true }).click();


        // Click on Activities tab
    await page.getByText('Emails', { exact: true }).click();
    const activityItem = page.locator('div').filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).last();
        const actionsMenuButton = activityItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Edit
    await page.getByText(/Edit/i).click();
    await page.waitForTimeout(500);

    // Edit recipient
    const recipient = page.getByLabel(/recipient/i);
    await recipient.clear();
    await FileInput(recipient, "updated.recipient@email.com");

    // Edit subject
    const subject = page.getByLabel(/subject/i);
    await subject.clear();
    await FileInput(subject, "Updated Web development");
   
    // Edit Body
    const body = page.locator('textarea#body').or(page.getByPlaceholder('Body'));
    await body.clear();
    await FileInput(body, "Updated body of email");

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Update/i }).click();
    await page.waitForTimeout(1500);
  });

    // Create Comment
  test('Comment on Email', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Emails', { exact: true }).click();
    await page.waitForTimeout(500);

    // Click on Add Comment button
    await page.getByRole('button', { name: '+ Add Comment' }).first().click();
    await page.waitForTimeout(1000);

    // Fill Comment
    const commentField = page.locator('textarea#comment');
    await FileInput(commentField, "Comment on email");

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);
  });

  // Edit Comment
  test('Edit Comment on Email', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Emails', { exact: true }).click();
    await page.waitForTimeout(500);

    const commentItem = page.locator('div').filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).last();

    const actionsMenuButton = commentItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
    await page.getByText(/Edit/i).click();
    await page.waitForTimeout(500);

    // Edit comment field
    const commentFieldUpdate = page.locator('textarea#comment');
    await commentFieldUpdate.clear();
    await FileInput(commentFieldUpdate, "Updated Comment on email");
    
    await page.getByRole('button', { name: /Update|Save/i }).click();
    await page.waitForTimeout(1500);
  });

  // Delete Comment
  test('Delete Comment on Email', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Emails', { exact: true }).click();
    await page.waitForTimeout(500);

    // Delete the comment
    const commentItem = page.locator('div').filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).last();

    const actionsMenuButton = commentItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Delete
    await page.getByText(/Delete|Remove/i).click();
    await page.waitForTimeout(500);
    await deleteItem(page);
    await page.waitForTimeout(1000);
  });

  // Delete Email
  test('Delete Email', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    await page.getByText('Emails', { exact: true }).click();
    const activityItem = page.locator('div').filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).nth(0);
    const actionsMenuButton = activityItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).last();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Delete
    await page.getByText(/Delete|Remove/i).click();
    await page.waitForTimeout(500);
    await deleteItem(page);
    await page.waitForTimeout(1000);
  });

  // ============================
  //  Calls
  // ============================

  // Create Calls
  test('Create Calls', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    await page.getByText('Calls', { exact: true }).click();
    await page.getByText('Call Log', { exact: true }).click();

    // Select outcome
    await page.waitForTimeout(500);
    const outcomeDropdown = page.locator("button[role='combobox']").filter({ hasText: 'Select outcome' });

    if (await outcomeDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await outcomeDropdown.click();
      await page.waitForTimeout(500);

          // Select the last option
          const lastOption = page.locator('[role="option"]').last();
          if (await lastOption.isVisible({ timeout: 2000 }).catch(() => false)) {
            await lastOption.click();
            console.log("✓ Selected last outcome from dropdown");
            await page.waitForTimeout(400);
          }
        }

        // Fill Call date field 
        const today = new Date();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); 
        const dd = String(today.getDate()).padStart(2, '0');
        const yyyy = today.getFullYear();
        const endDateFormatted = `${mm}-${dd}-${yyyy}`; // Format: MM-DD-YYYY
    
    const endDateField = page.getByLabel(/Call date/i)
      .or(page.getByPlaceholder(/Call date/i))
      .or(page.locator('input[type="date"]').nth(1));
    await FileInput(endDateField, endDateFormatted);

    // Fill call note
    const callNote = page.locator('textarea#note').or(page.getByPlaceholder('Add notes here...'));
    await FileInput(callNote, "call note");

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);

  });

  // Edit Calls
  test('Edit Calls', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    await page.getByText('Calls', { exact: true }).click();

    const activityItem = page.locator('div').filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).nth(0);
        const actionsMenuButton = activityItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).last();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Edit
    await page.getByText(/Edit/i).click();
    await page.waitForTimeout(500);

    // Select outcome
    await page.waitForTimeout(500);
    const outcomeDropdown = page.locator("button[role='combobox']").filter({ hasText: 'Select outcome' });

    if (await outcomeDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await outcomeDropdown.click();
      await page.waitForTimeout(500);

          // Select the last option
          const lastOption = page.locator('[role="option"]').last();
          if (await lastOption.isVisible({ timeout: 2000 }).catch(() => false)) {
            await lastOption.click();
            console.log("✓ Selected last outcome from dropdown");
            await page.waitForTimeout(400);
          }
        }

    // Edit Call date field 
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); 
    const dd = String(today.getDate()).padStart(2, '0');
    const yyyy = today.getFullYear();
    const endDateFormatted = `${mm}-${dd}-${yyyy}`;

    const endDateField = page.getByLabel(/Call date/i)
      .or(page.getByPlaceholder(/Call date/i))
      .or(page.locator('input[type="date"]').nth(1));
    await endDateField.clear();
    await FileInput(endDateField, endDateFormatted);

    // Edit call note
    const callNote = page.locator('textarea#note').or(page.getByPlaceholder('Add notes here...'));
    await callNote.clear();
    await FileInput(callNote, "Updated call note");
    
    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Update|Save/i }).click();
    await page.waitForTimeout(1500);

  });

  // Create Comment
  test('Comment on Calls', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Calls', { exact: true }).click();
    await page.waitForTimeout(500);

    // Click on Add Comment button
    await page.getByRole('button', { name: '+ Add Comment' }).click();
    await page.waitForTimeout(1000);

    // Fill Comment
    const commentField = page.locator('textarea#comment');
    await FileInput(commentField, "Comment on calls");

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);
  });

  // Edit Comment
  test('Edit Comment on Calls', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Calls', { exact: true }).click();
    await page.waitForTimeout(500);

    const commentItem = page.locator('div').filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).last();

    const actionsMenuButton = commentItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
    await page.getByText(/Edit/i).click();

    const commentFieldUpdate = page.locator('textarea#comment');
    await FileInput(commentFieldUpdate, "Updated Comment on calls");
    
    await page.getByRole('button', { name: /Update|Save/i }).click();
    await page.waitForTimeout(1500);
  });

  // Delete Comment
  test('Delete Comment on Calls', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Calls', { exact: true }).click();
    await page.waitForTimeout(500);

    // Delete the comment
    const commentItem = page.locator('div').filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).last();

    const actionsMenuButton = commentItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Delete
    await page.getByText(/Delete|Remove/i).click();
    await page.waitForTimeout(500);
    await deleteItem(page);
    await page.waitForTimeout(1000);
  });

  //Delete Call
  test('Delete Call', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    await page.getByText('Calls', { exact: true }).click();

    const activityItem = page.locator('div').filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).last();
    const actionsMenuButton = activityItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Delete
    await page.getByText(/Delete|Remove/i).click();
    await page.waitForTimeout(500);
    await deleteItem(page);
    await page.waitForTimeout(1000);
  });

  // ============================
  //  Notes
  // ============================

  // Create Note
  test('Create Note', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
  
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Notes', { exact: true }).click();
    await page.waitForTimeout(500);
    // Click on Add Note button
    await page.getByRole('button', { name: 'Add Note' }).click();
    await page.waitForTimeout(1000);

    // Fill Note
    const noteField = page.locator('textarea#note');
    await FileInput(noteField, "Note on engagement");

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);
  });

  // Edit Note
  test('Edit Note', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Notes', { exact: true }).click();
    await page.waitForTimeout(500);



    // Edit Note locator
    const noteItem = page.locator('div').filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).last();

    const actionsMenuButton = noteItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Edit
    await page.getByText(/Edit/i).click();

    const noteFieldUpdate = page.locator('textarea#note');
    await FileInput(noteFieldUpdate, "Updated Note on engagement");
    
    await page.getByRole('button', { name: /Update|Save/i }).click();
    await page.waitForTimeout(1500);
  });

  // Create Comment
  test('Comment on Notes', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Notes', { exact: true }).click();
    await page.waitForTimeout(500);

    // Click on Add Comment button
    await page.getByRole('button', { name: '+ Add Comment' }).click();
    await page.waitForTimeout(1000);

    // Fill Comment
    const commentField = page.locator('textarea#comment');
    await FileInput(commentField, "Comment on Notes");

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);
  });

  // Edit Comment
  test('Edit Comment on Notes', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Notes', { exact: true }).click();
    await page.waitForTimeout(500);

    const commentItem = page.locator('div').filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).last();

    const actionsMenuButton = commentItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
    await page.getByText(/Edit/i).click();

    const commentFieldUpdate = page.locator('textarea#comment');
    await FileInput(commentFieldUpdate, "Updated Comment on Notes");
    
    await page.getByRole('button', { name: /Update|Save/i }).click();
    await page.waitForTimeout(1500);
  });

  // Delete Comment
  test('Delete Comment on Notes', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Notes', { exact: true }).click();
    await page.waitForTimeout(500);

    // Delete the comment
    const commentItem = page.locator('div').filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).last();

    const actionsMenuButton = commentItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Delete
    await page.getByText(/Delete|Remove/i).click();
    await page.waitForTimeout(500);
    await deleteItem(page);
    await page.waitForTimeout(1000);
  });

    // Delete Note
  test('Delete Note', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Notes', { exact: true }).click();
    await page.waitForTimeout(500);

    // Delete the note
    const noteItem = page.locator('div').filter({ 
      has: page.locator('button').filter({ has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) })
    }).last();

    const actionsMenuButton = noteItem.locator('button').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical').or(page.locator('svg.lucide-ellipsis-horizontal')) 
    }).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Delete
    await page.getByText(/Delete|Remove/i).click();
    await page.waitForTimeout(500);
    await deleteItem(page);
    await page.waitForTimeout(1000);
  });

});
