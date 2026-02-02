import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { FileInput } from '../utils/form-helper';
import { deleteEntityViaActionMenu } from '../utils/delete-helper';

test.describe('Attendances', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await page.waitForTimeout(1000);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 45000 });
    const attendanceLink = page.getByText('Attendance', { exact: true })
      .or(page.getByText('Attendances', { exact: true }))
      .or(page.locator('a[href*="/attendance"]')); 
    
    if (await attendanceLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await attendanceLink.click();
    }
    
    await expect(page).toHaveURL(/attendance/i);
    await page.waitForTimeout(1000);            
  });


//   ====================================== 
// Add new attendance
//   ====================================== 
  test('Add new attendance', async ({ page }) => {
    
    const addButton = page.locator('button:has(.lucide-plus)').first();
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    await page.waitForTimeout(2000);

    const subjectDropdown = page.getByTestId('class-title-dropdown').or(
        page.locator('label', { hasText: /^Class Title/ }).locator('..').locator('button[role="combobox"]')
    );

    await expect(subjectDropdown).toBeVisible(); 
    await subjectDropdown.scrollIntoViewIfNeeded();
    await subjectDropdown.click();
    
    await expect(subjectDropdown).toHaveAttribute('aria-expanded', 'true');
    
    const subjectOptions = page.getByRole('option');
    await expect(subjectOptions.first()).toBeVisible({ timeout: 5000 });
    
    if (await subjectOptions.count() > 1) {
         await subjectOptions.nth(0).click();
    } else {
         await subjectOptions.first().click();
    }

    const dueDateInput = page.getByLabel(/Due Date/i)
        .or(page.getByPlaceholder(/Due Date/i))
        .or(page.locator('input[type="date"]').first())
        .or(page.locator('input[placeholder*="date" i]'));

    if (await dueDateInput.isVisible().catch(() => false)) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;
        
        await dueDateInput.click();
        await page.waitForTimeout(200);
        await dueDateInput.fill(formattedDate);
        await page.keyboard.press('Enter'); 
    }

    // Fill Notes field
    await page.waitForTimeout(500);
    const notesInput = page.getByLabel(/Notes|Description/i)
        .or(page.getByPlaceholder(/Notes|Description/i))
        .or(page.locator('textarea[name="note"]'))
        .or(page.locator('textarea'));

    // Wait for notes field to be visible
    if (await notesInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await notesInput.scrollIntoViewIfNeeded();
        await FileInput(notesInput, 'Automated attendance test note');
    } else {
        console.log('⚠ Notes field not found or not visible');
    }
    
    // Click submit button
    await page.waitForTimeout(500);
    await page.locator('button[type="submit"]').filter({ hasText: /Create|Add/i })
        .or(page.locator('button[color="primary"]'))
        .or(page.getByRole('button', { name: /Create|Add/i })).click();
  });

  //   ======================================
// Attendances List
//   ======================================
  test('Attendances List', async ({ page }) => {
    await expect(page).toHaveTitle(/Attendance/i);
    const selectClassDropdown = page.locator('button[role="combobox"]').filter({ hasText: 'Select Class' });
    await expect(selectClassDropdown).toBeVisible();
    await selectClassDropdown.click();
    const options = page.getByRole('option');
    await expect(options.first()).toBeVisible({ timeout: 5000 });
    
    if (await options.count() > 1) {
      await options.nth(1).click();
    } else {
      await options.first().click();
    }
    
    await page.waitForTimeout(1000);
  });

//   ====================================== 
// Edit attendance
//   ====================================== 
  test('Edit attendance', async ({ page }) => {

    
    // Select Class to filter list first
    const selectClassDropdown = page.locator('button[role="combobox"]').filter({ hasText: 'Select Class' });
    await expect(selectClassDropdown).toBeVisible();
    await selectClassDropdown.click();

    const options = page.getByRole('option');
    await expect(options.first()).toBeVisible({ timeout: 5000 });
    
    if (await options.count() > 1) {
      await options.nth(1).click();
    } else {
      await options.first().click();
    }

    await page.waitForTimeout(2000);
    const attendanceRows = page.locator('table tbody tr, [role="row"], .attendance-item, div[class*="attendance"]');
    
    // Ensure we have rows
    await expect(attendanceRows.first()).toBeVisible({ timeout: 10000 });

    const indexToEdit = 0;
    // Click on the specific cell (Title) to enter detail view
    const rowToEdit = attendanceRows.nth(indexToEdit).locator('td, div').nth(1).first();
    await rowToEdit.click();
    
    // Wait for detail view
    await page.waitForTimeout(1000);

    // Click Edit button
    const actionsMenuButton = page.locator('button[aria-haspopup="menu"]').first();
    await expect(actionsMenuButton).toBeVisible();
    await actionsMenuButton.click();
    
    const editButton = page.getByRole('menuitem', { name: /Edit/i })
        .or(page.getByRole('button', { name: /Edit/i }));
    await expect(editButton).toBeVisible();
    await editButton.click();
    
    // Wait for edit form
    await page.waitForTimeout(1000);
    
    // Modify Notes
    const notesInput = page.getByLabel(/Notes|Description/i)
        .or(page.getByPlaceholder(/Notes|Description/i))
        .or(page.locator('textarea[name="note"]'))
        .or(page.locator('textarea'));
        
    await expect(notesInput).toBeVisible();
    await FileInput(notesInput, 'Updated Note during Automation');

    // Handle "Reason"
    const reasonInput = page.getByLabel(/Reason/i).or(page.getByPlaceholder(/Reason/i));
    if (await reasonInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await FileInput(reasonInput, 'Updating for test');
    }

    // Submit
    const saveBtn = page.getByRole('button', { name: /Update|Save/i })
        .or(page.locator('button[type="submit"]'));
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();
    
    // Verify success
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });
  });

//   ====================================== 
// Delete attendance
//   ====================================== 
  test('Delete attendance', async ({ page }) => {
    test.setTimeout(60000);
    
    // Select Class to filter list first
    const selectClassDropdown = page.locator('button[role="combobox"]').filter({ hasText: 'Select Class' });
    await expect(selectClassDropdown).toBeVisible();
    await selectClassDropdown.click();

    const options = page.getByRole('option');
    await expect(options.first()).toBeVisible({ timeout: 5000 });
    
    if (await options.count() > 1) {
      await options.nth(1).click();
    } else {
      await options.first().click();
    }

    await page.waitForTimeout(2000);
    const attendanceRows = page.locator('table tbody tr, [role="row"], .attendance-item, div[class*="attendance"]');
    const indexToDelete = 0;
    const attendanceToDelete = attendanceRows.nth(indexToDelete);
    await deleteEntityViaActionMenu(page, attendanceToDelete, 'Confirm Delete');
  });
});
