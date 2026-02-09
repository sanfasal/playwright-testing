
import { Page, expect } from '@playwright/test';
import { FileInput } from '../utils/form-helper';
import { openActionMenu } from '../utils/action-menu-helper';
import { deleteItem } from '../utils/delete-helper';

export interface EngagementData {
    firstName: string;
    lastName: string;
    amount: string;
    email: string;
    phone: string;
    probability: string;
    resourceLink: string;
    note: string;
}

export interface ActivityData {
    title?: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    originalTitle?: string;
}

export interface EmailData {
    recipient: string;
    subject: string;
    body: string;
    originalSubject?: string;
}

export interface CallData {
    date?: string;
    note: string;
    originalNote?: string;
}

export interface NoteData {
    note: string;
    originalNote?: string;
}

// Helper to select the first engagement in the list
export async function selectFirstEngagement(page: Page) {
    // If already on detail page (Activities tab is visible), skip selection
    if (await page.getByText('Activities', { exact: true }).isVisible()) {
        await page.waitForTimeout(500);
        return;
    }
    
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
}

export async function createEngagement(page: Page, data: EngagementData) {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(500);
    await page.locator('#add-deal-button').click();
    await page.waitForTimeout(800);
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    await page.waitForTimeout(500);

    const firstNameField = page.getByLabel(/First Name/i);
    await FileInput(firstNameField, data.firstName);
    
    // Fill Last Name
    const lastNameField = page.getByLabel(/Last Name/i);
    await FileInput(lastNameField, data.lastName);

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
        await options.nth(0).click();
      }
      await page.waitForTimeout(400);
    }
    
    // Fill Amount
    const amountField = page.getByLabel(/Amount \(\$\)/i);
    await FileInput(amountField, data.amount);
    
    // Fill Email
    const emailField = page.locator('input[name="email"]');
    await FileInput(emailField, data.email);
    
    // Fill Phone
    const phoneField = page.getByLabel(/Phone/i);
    await FileInput(phoneField, data.phone);

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
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(400);
    }

    // Fill Probability
    const probabilityField = page.getByLabel(/Probability/i);
    await FileInput(probabilityField, data.probability);

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
    await FileInput(resourceLink, data.resourceLink);

    // Step 2: Click to open the assign to dropdown
    const assignToDropdown = page.locator('button')
      .filter({ hasText: 'Assign To' })
      .or(page.locator('button[data-slot="popover-trigger"]').filter({ hasText: 'Assign To' }))
      .first();
    
    // Click the dropdown to open it
    if (await assignToDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await assignToDropdown.click();
      await page.waitForTimeout(1200);
      
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
    const note = page.locator('textarea#note');
    await FileInput(note, data.note);
    
    // Submit the form
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);
}

export async function editEngagement(page: Page, data: EngagementData) {
    await selectFirstEngagement(page);
  
    // Open the actions menu (three-dot icon)
    await openActionMenu(page);
    
    // Click Edit
    await page.getByText(/Edit/i).click();
    
    // Wait for drawer/form
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    await page.waitForTimeout(500);

    // Edit First Name
    const firstNameField = page.getByLabel(/First Name/i);
    await FileInput(firstNameField, data.firstName);
    
    // Edit Last Name
    const lastNameField = page.getByLabel(/Last Name/i);
    await FileInput(lastNameField, data.lastName);

    // Edit Gender (Dropdown)
    const genderButton = page
      .locator('button[role="combobox"]')
      .filter({ has: page.locator("svg") })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .first();
    if (await genderButton.isVisible({ timeout: 2000 })) {
      await genderButton.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        await options.nth(1).click();
      }
      await page.waitForTimeout(400);
    }

    // Edit Stage (Dropdown)
    const stageButton = page
      .locator('button[role="combobox"]')
      .filter({ has: page.locator("svg") })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .nth(1);
    if (await stageButton.isVisible({ timeout: 2000 })) {
      await stageButton.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
          await options.nth(1).click();
      }
      await page.waitForTimeout(400);
    }
    
    // Edit Amount
    const amountField = page.getByLabel(/Amount \(\$\)/i);
    await FileInput(amountField, data.amount);
    
    // Edit Email
    const emailField = page.locator('input[name="email"]');
    await FileInput(emailField, data.email);
    
    // Edit Phone
    const phoneField = page.getByLabel(/Phone/i);
    await FileInput(phoneField, data.phone);

    // Edit Priority (Dropdown)
    const priorityButton = page
      .locator('button[role="combobox"]')
      .filter({ has: page.locator("svg") })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .nth(2);
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
    const expectClassButton = page
      .locator('button[role="combobox"]')
      .filter({ has: page.locator("svg") })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .nth(3);
    if (await expectClassButton.isVisible({ timeout: 2000 })) {
      await expectClassButton.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        await options.nth(randomIndex).click();
      }else{
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(400);
    }

    // Edit Probability
    const probabilityField = page.getByLabel(/Probability/i);
    await FileInput(probabilityField, data.probability);

    // Edit Resource Type (Dropdown)
    const resourceTypeButton = page
      .locator('button[role="combobox"]')
      .filter({ has: page.locator("svg") })
      .or(page.locator('button[role="combobox"][aria-controls*="radix"]'))
      .nth(4);
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
    await FileInput(resourceLink, data.resourceLink);

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
    await FileInput(note, data.note);

    // Submit the form
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Update|Save|Confirm/i }).click();
    await page.waitForTimeout(1500);
}

export async function deleteEngagement(page: Page) {
    await selectFirstEngagement(page);
    
    // Scroll to top to ensure the actions menu is visible
    await page.evaluate(() => window.scrollTo(0, 0));
    // Also use mouse wheel up just in case
    await page.mouse.wheel(0, -2000);
    await page.waitForTimeout(500);

    // Open the actions menu (three-dot icon)
    await openActionMenu(page);

    // Use first() or getByRole to avoid strict mode violation with success/error toasts
    const deleteOption = page.getByRole('menuitem', { name: /Delete|Remove/i })
        .or(page.getByRole('button', { name: /Delete|Remove/i }))
        .or(page.getByText(/Delete|Remove/i));
        
    await deleteOption.first().click();
    await page.waitForTimeout(1000);
    await deleteItem(page);
    await page.waitForTimeout(1000);
}

export async function createActivity(page: Page, data: ActivityData) {
    await selectFirstEngagement(page);
    
    // Click on Activities tab
    await page.getByText('Activities', { exact: true }).click();

    // Click on Add Activity button
    await page.getByText('Add Activity', { exact: true }).click();

    // Fill Activity Name
    const activityName = page.getByLabel(/Title/i);
    await FileInput(activityName, data.title || "Activity Title");

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
        await page.waitForTimeout(400);
      }
    }

      // Fill Start Date field
    const startDate = data.startDate || '12-12-2025'; 
    const startDateField = page.getByLabel(/start date/i)
      .or(page.getByPlaceholder(/start date/i))
      .or(page.locator('input[type="date"]').first());
    await FileInput(startDateField, startDate);
    
    // Fill End Date field
    const endDateFormatted = data.endDate || '01-16-2026'; 
    const endDateField = page.getByLabel(/end date/i)
      .or(page.getByPlaceholder(/end date/i))
      .or(page.locator('input[type="date"]').nth(1));
    await FileInput(endDateField, endDateFormatted);
    
    // Fill Start Time field
    await page.waitForTimeout(500);
    const startTimeInput = page.getByLabel(/start time/i)
      .or(page.locator('#startTime'))
      .or(page.getByPlaceholder(/start time/i));
    
    await FileInput(startTimeInput, data.startTime || '08:30AM');
    
    // Fill End Time field
    await page.waitForTimeout(500);
    const endTimeInput = page.getByLabel(/end time/i)
      .or(page.locator('#endTime'))
      .or(page.getByPlaceholder(/end time/i));
    
    await FileInput(endTimeInput, data.endTime || '11:30AM');
    
    // Fill Activity Description
    const activityDescription = page.locator('textarea#note').or(page.getByPlaceholder('Add notes here...'));
    await FileInput(activityDescription, data.description || "Activity Description");

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
}

export async function editActivity(page: Page, data: ActivityData) {
    await selectFirstEngagement(page);
    
    // Click on Activities tab
    // Click on Activities tab if not already active
    const activitiesTab = page.getByText('Activities', { exact: true });
    if (await activitiesTab.isVisible() && await activitiesTab.getAttribute('aria-selected') !== 'true') {
        await activitiesTab.click();
    }
    
    // Wait for the activity text to ensure the list is loaded
    await expect(page.getByText(data.originalTitle || 'Activity Title').first()).toBeVisible();
    
    const activityItem = page.locator('div')
      .filter({ has: page.getByText(data.originalTitle || 'Activity Title') })
      .filter({ has: page.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal') })
      .last();

    const actionsMenuButton = activityItem.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal').first();

    await expect(actionsMenuButton).toBeVisible();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Edit
    await page.getByText(/Edit/i).click();
    await page.waitForTimeout(500);

    // Edit Activity Name
    const activityName = page.getByLabel(/Title/i);
    await activityName.clear();
    await FileInput(activityName, data.title || "Update Activity Title");

    // Select category (logic same as create)
    await page.waitForTimeout(500);
    const categoryDropdown = page
      .locator("button[role='combobox']:has(+ label:text('Category'))")
      .or(page.locator("button[role='combobox']").filter({ has: page.locator('+ label', { hasText: 'Category' }) }))
      .or(page.getByText('Category', { exact: true }).locator('..').getByRole('combobox'));

    if (await categoryDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryDropdown.click();
      await page.waitForTimeout(500);
      const firstOption = page.locator('[role="option"]').nth(0);
      if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstOption.click();
        await page.waitForTimeout(400);
      }
    }

    // Edit Start Date field
    const startDateField = page.getByLabel(/start date/i)
      .or(page.getByPlaceholder(/start date/i))
      .or(page.locator('input[type="date"]').first());
    await startDateField.clear();
    await FileInput(startDateField, data.startDate || '12-12-2025');
    
    // Edit End Date field
    const endDateField = page.getByLabel(/end date/i)
      .or(page.getByPlaceholder(/end date/i))
      .or(page.locator('input[type="date"]').nth(1));
    await endDateField.clear();
    await FileInput(endDateField, data.endDate || '01-16-2026');
    
    // Edit Start Time field
    await page.waitForTimeout(500);
    const startTimeInput = page.getByLabel(/start time/i)
      .or(page.locator('#startTime'))
      .or(page.getByPlaceholder(/start time/i));
    await startTimeInput.clear();
    await FileInput(startTimeInput, data.startTime || '09:30AM');
    
    // Edit End Time field
    await page.waitForTimeout(500);
    const endTimeInput = page.getByLabel(/end time/i)
      .or(page.locator('#endTime'))
      .or(page.getByPlaceholder(/end time/i));
    await endTimeInput.clear();
    await FileInput(endTimeInput, data.endTime || '12:30PM');
    
    // Edit Activity Description
    const activityDescription = page.locator('textarea#note').or(page.getByPlaceholder('Add notes here...'));
    await activityDescription.clear();
    await FileInput(activityDescription, data.description || "Updated Activity Description");

    // Toggle Activity Completed
    const completedSwitch = page.locator('button#isCompleted').or(page.getByLabel('Activity completed'));
    if (await completedSwitch.isVisible()) {
      await completedSwitch.click();
      await page.waitForTimeout(500);
    }

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Update/i }).click();
    await page.waitForTimeout(1500);
}

export async function deleteActivity(page: Page, activityTitle: string) {
    await selectFirstEngagement(page);
    
    // Click on Activities tab
    await page.getByText('Activities', { exact: true }).click();
  
    const activityItem = page.locator('div')
      .filter({ has: page.getByText(activityTitle) })
      .filter({ has: page.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal') })
      .last();

    const actionsMenuButton = activityItem.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal').first();
    await expect(actionsMenuButton).toBeVisible();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Delete
    await page.getByText(/Delete|Remove/i).click();
    await page.waitForTimeout(500);
    await deleteItem(page);
    await page.waitForTimeout(1000);
}

export async function createEmail(page: Page, data: EmailData) {
    await selectFirstEngagement(page);
    // Click on Emails tab if not already active
    const emailsTab = page.getByText('Emails', { exact: true });
    if (await emailsTab.isVisible() && await emailsTab.getAttribute('aria-selected') !== 'true') {
        await emailsTab.click();
    }
    await page.getByText('Add Emails', { exact: true }).click();

    // Fill recipient
    const recipient = page.getByLabel(/recipient/i);
    await FileInput(recipient, data.recipient);

    // Fill subject
    const subject = page.getByLabel(/subject/i);
    await FileInput(subject, data.subject);
   
    // Fill Body
    const body = page.locator('textarea#body').or(page.getByPlaceholder('Body'));
    await FileInput(body, data.body);

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);
    
    // Scroll to see the new email
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(1000);
}

export async function editEmail(page: Page, data: EmailData) {
    await selectFirstEngagement(page);
    // Click on Emails tab if not already active
    const emailsTab = page.getByText('Emails', { exact: true });
    if (await emailsTab.isVisible() && await emailsTab.getAttribute('aria-selected') !== 'true') {
        await emailsTab.click();
    }
    
    const activityItem = page.locator('div')
        .filter({ has: page.getByText(data.originalSubject || '') })
        .filter({ has: page.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal') })
        .last();

    const actionsMenuButton = activityItem.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal').first();

    await expect(actionsMenuButton).toBeVisible();
    await actionsMenuButton.scrollIntoViewIfNeeded();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Edit
    await page.getByText(/Edit/i).click();
    await page.waitForTimeout(500);

    // Edit recipient
    const recipient = page.getByLabel(/recipient/i);
    await recipient.clear();
    await FileInput(recipient, data.recipient);

    // Edit subject
    const subject = page.getByLabel(/subject/i);
    await subject.clear();
    await FileInput(subject, data.subject);
   
    // Edit Body
    const body = page.locator('textarea#body').or(page.getByPlaceholder('Body'));
    await body.clear();
    await FileInput(body, data.body);

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Update/i }).click();
    await page.waitForTimeout(1500);
}

export async function deleteEmail(page: Page, subject: string) {
    await selectFirstEngagement(page);
    // Click on Emails tab if not already active
    const emailsTab = page.getByText('Emails', { exact: true });
    if (await emailsTab.isVisible() && await emailsTab.getAttribute('aria-selected') !== 'true') {
        await emailsTab.click();
    }
    
    const activityItem = page.locator('div').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal')
    }).last(); // Using last as in the original test

    const actionsMenuButton = activityItem.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal').first();
    
    await actionsMenuButton.scrollIntoViewIfNeeded();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Delete
    await page.getByText(/Delete|Remove/i).click();
    await page.waitForTimeout(500);
    await deleteItem(page);
    await page.waitForTimeout(1000);
}

export async function createCall(page: Page, data: CallData) {
    await selectFirstEngagement(page);
    // Click on Calls tab if not already active
    const callsTab = page.getByText('Calls', { exact: true });
    if (await callsTab.isVisible() && await callsTab.getAttribute('aria-selected') !== 'true') {
        await callsTab.click();
    }
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
        await page.waitForTimeout(400);
      }
    }

    // Fill Call date field 
    if (data.date) {
        const endDateField = page.getByLabel(/Call date/i)
        .or(page.getByPlaceholder(/Call date/i))
        .or(page.locator('input[type="date"]').nth(1));
        await FileInput(endDateField, data.date);
    }

    // Fill call note
    const callNote = page.locator('textarea#note').or(page.getByPlaceholder('Add notes here...'));
    await FileInput(callNote, data.note);

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);

    // Scroll to see the new call
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(1000);
}

export async function editCall(page: Page, data: CallData) {
    await selectFirstEngagement(page);
    // Click on Calls tab if not already active
    const callsTab = page.getByText('Calls', { exact: true });
    if (await callsTab.isVisible() && await callsTab.getAttribute('aria-selected') !== 'true') {
        await callsTab.click();
    }

    const activityItem = page.locator('div')
        .filter({ has: page.getByText(data.originalNote || '') })
        .filter({ has: page.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal') })
        .last();

    const actionsMenuButton = activityItem.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal').first();
    await expect(actionsMenuButton).toBeVisible();
    await actionsMenuButton.scrollIntoViewIfNeeded();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Edit
    await page.getByText(/Edit/i).click();
    await page.waitForTimeout(500);

    // Select outcome
    const outcomeDropdown = page.locator("button[role='combobox']").filter({ hasText: 'Select outcome' });
    if (await outcomeDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await outcomeDropdown.click();
      await page.waitForTimeout(500);
      const lastOption = page.locator('[role="option"]').last();
      if (await lastOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await lastOption.click();
        await page.waitForTimeout(400);
      }
    }

    // Edit Call date field 
    if (data.date) {
        const endDateField = page.getByLabel(/Call date/i)
        .or(page.getByPlaceholder(/Call date/i))
        .or(page.locator('input[type="date"]').nth(1));
        await endDateField.clear();
        await FileInput(endDateField, data.date);
    }

    // Edit call note
    const callNote = page.locator('textarea#note').or(page.getByPlaceholder('Add notes here...'));
    await callNote.clear();
    await FileInput(callNote, data.note);
    
    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Update|Save/i }).click();
    await page.waitForTimeout(1500);
}

export async function deleteCall(page: Page) {
    await selectFirstEngagement(page);
    // Click on Calls tab if not already active
    const callsTab = page.getByText('Calls', { exact: true });
    if (await callsTab.isVisible() && await callsTab.getAttribute('aria-selected') !== 'true') {
        await callsTab.click();
    }

    // Scroll into view
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(500);

    const activityItem = page.locator('div').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal')
    }).last();

    const actionsMenuButton = activityItem.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal').first();
    
    await actionsMenuButton.scrollIntoViewIfNeeded();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Delete
    // Use first() to avoid strict mode issues with notifications containing similar text
    const deleteOption = page.getByRole('menuitem', { name: /Delete|Remove/i })
        .or(page.getByRole('button', { name: /Delete|Remove/i }))
        .or(page.getByText(/Delete|Remove/i));
        
    await deleteOption.first().click();
    await page.waitForTimeout(500);
    await deleteItem(page);
    await page.waitForTimeout(1000);
}

export async function createNote(page: Page, data: NoteData) {
    await selectFirstEngagement(page);
    
    // Click on Activities tab
    // Click on Notes tab if not already active
    const notesTab = page.getByText('Notes', { exact: true });
    if (await notesTab.isVisible() && await notesTab.getAttribute('aria-selected') !== 'true') {
        await notesTab.click();
    }
    await page.waitForTimeout(500);
    // Click on Add Note button
    await page.getByRole('button', { name: 'Add Note' }).click();
    await page.waitForTimeout(1000);

    // Fill Note
    const noteField = page.locator('textarea#note');
    await FileInput(noteField, data.note);

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);

    // Scroll to see the new note
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(1000);
}

export async function editNote(page: Page, data: NoteData) {
    await selectFirstEngagement(page);
    
    // Click on Activities tab
    // Click on Notes tab if not already active
    const notesTab = page.getByText('Notes', { exact: true });
    if (await notesTab.isVisible() && await notesTab.getAttribute('aria-selected') !== 'true') {
        await notesTab.click();
    }
    
    // Scroll to see the list
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(500);

    // Edit Note locator
    const noteItem = page.locator('div')
        .filter({ has: page.getByText(data.originalNote || '') })
        .filter({ has: page.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal') })
        .last();

    const actionsMenuButton = noteItem.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal').first();
    
    await expect(actionsMenuButton).toBeVisible();
    await actionsMenuButton.scrollIntoViewIfNeeded();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Edit
    await page.getByText(/Edit/i).click();

    const noteFieldUpdate = page.locator('textarea#note');
    await FileInput(noteFieldUpdate, data.note);
    
    await page.getByRole('button', { name: /Update|Save/i }).click();
    await page.waitForTimeout(1500);
}

export async function deleteNote(page: Page, noteText: string) {
    await selectFirstEngagement(page);
    
    // Click on Activities tab
    // Click on Notes tab if not already active
    const notesTab = page.getByText('Notes', { exact: true });
    if (await notesTab.isVisible() && await notesTab.getAttribute('aria-selected') !== 'true') {
        await notesTab.click();
    }
    
    // Scroll to see the list
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.mouse.wheel(0, 2000); 
    await page.waitForTimeout(500);

    // Delete the note
    const noteItem = page.locator('div')
      .filter({ has: page.getByText(noteText) })
      .filter({ has: page.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal') })
      .last();

    const actionsMenuButton = noteItem.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal').first();
    
    await actionsMenuButton.scrollIntoViewIfNeeded();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);

    // Click Delete
    await page.getByText(/Delete|Remove/i).click();
    await page.waitForTimeout(500);
    await deleteItem(page);
    await page.waitForTimeout(1000);
}

export async function createComment(page: Page, tabName: string, text: string) {
    await selectFirstEngagement(page);
    
    // Click on Activities/Emails/Calls/Notes tab
    // Click on Activities/Emails/Calls/Notes tab if not already active
    const tab = page.getByText(tabName, { exact: true });
    const isSelected = await tab.getAttribute('aria-selected') === 'true' || await tab.getAttribute('data-state') === 'active';
    
    if (await tab.isVisible() && !isSelected) {
        await tab.click();
    }
    await page.waitForTimeout(500);

    // Trying generic selector based on test
    await page.getByRole('button', { name: '+ Add Comment' }).first().click();
    await page.waitForTimeout(1000);

    // Fill Comment
    const commentField = page.locator('textarea#comment');
    await FileInput(commentField, text);

    // Submit the form  
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);

    // Scroll to see the new comment
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(1000);
}

export async function editComment(page: Page, tabName: string, text: string) {
    await selectFirstEngagement(page);
    // Click on Activities/Emails/Calls/Notes tab if not already active
    const tab = page.getByText(tabName, { exact: true });
    const isSelected = await tab.getAttribute('aria-selected') === 'true' || await tab.getAttribute('data-state') === 'active';
    
    if (await tab.isVisible() && !isSelected) {
        await tab.click();
    }
    await page.waitForTimeout(500);

    // Scroll to see the list
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(500);

    // Find last comment item
    // Note: This relies on the structure being DIV > button > svg
    const commentItem = page.locator('div').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal')
    }).last();

    const actionsMenuButton = commentItem.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal').first();
    
    await actionsMenuButton.scrollIntoViewIfNeeded();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
    await page.getByText(/Edit/i).click();
    await page.waitForTimeout(500);

    // Edit comment field
    const commentFieldUpdate = page.locator('textarea#comment');
    await commentFieldUpdate.clear();
    await FileInput(commentFieldUpdate, text);
    
    await page.getByRole('button', { name: /Update|Save/i }).click();
    await page.waitForTimeout(1500);
}

export async function deleteComment(page: Page, tabName: string) {
    await selectFirstEngagement(page);
    // Click on Activities/Emails/Calls/Notes tab if not already active
    const tab = page.getByText(tabName, { exact: true });
    const isSelected = await tab.getAttribute('aria-selected') === 'true' || await tab.getAttribute('data-state') === 'active';
    
    if (await tab.isVisible() && !isSelected) {
        await tab.click();
    }
    await page.waitForTimeout(500);

    // Scroll to see the list
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(500);

    const commentItem = page.locator('div').filter({ 
      has: page.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal')
    }).last();

    const actionsMenuButton = commentItem.locator('svg.lucide-ellipsis-vertical, svg.lucide-ellipsis-horizontal').first();
    
    await actionsMenuButton.scrollIntoViewIfNeeded();

    // Check visibility safely (first() avoids strict mode errors)
    const deleteOption = page.getByRole('menuitem', { name: /Delete|Remove/i })
        .or(page.getByRole('button', { name: /Delete|Remove/i }))
        .or(page.getByText(/Delete|Remove/i));

    if (!(await deleteOption.first().isVisible())) {
        await actionsMenuButton.click();
        await page.waitForTimeout(500);
    }

    // Click Delete
    await deleteOption.first().click();
    await page.waitForTimeout(500);
    await deleteItem(page);
}
