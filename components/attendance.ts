
import { Page, expect } from '@playwright/test';
import { FileInput } from '../utils/form-helper';
import { openActionMenu } from '../utils/action-menu-helper';
import { deleteEntityViaActionMenu } from '../utils/delete-helper';

export async function createAttendance(page: Page) {
    // Add new attendance
    const addButton = page.locator('button:has(.lucide-plus)').first();
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    const subjectDropdown = page.getByTestId('class-title-dropdown').or(
        page.locator('label', { hasText: /^Class Title/ }).locator('..').locator('button[role="combobox"]')
    );

    await expect(subjectDropdown).toBeVisible(); 
    await subjectDropdown.scrollIntoViewIfNeeded();
    await subjectDropdown.click();
    
    await expect(subjectDropdown).toHaveAttribute('aria-expanded', 'true');
    
    const subjectOptions = page.getByRole('option');
    await expect(subjectOptions.first()).toBeVisible({ timeout: 1000 });
    
    if (await subjectOptions.count() > 1) {
         await subjectOptions.nth(1).click();
    } else {
         await subjectOptions.first().click();
    }

    const dueDateInput = page.getByLabel(/Due Date/i)
        .or(page.getByPlaceholder(/Due Date/i))
        .or(page.locator('input[type="date"]').first())
        .or(page.locator('input[placeholder*="date" i]'));

    if (await dueDateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;
        
        await dueDateInput.click();
        await page.waitForTimeout(200);
        await dueDateInput.fill(formattedDate);
        await page.waitForTimeout(300);
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
    
    // Click submit button inside the dialog (not the floating action button)
    await page.waitForTimeout(500);
    const dialog = page.getByRole('dialog');
    const submitButton = dialog.locator('button[type="submit"]')
        .or(dialog.getByRole('button', { name: /^Create$|^Add$/i }));
    
    await expect(submitButton).toBeVisible();
    await submitButton.click();
    
    await expect(dialog).toBeHidden({ timeout: 1000 });
}

export async function updateAttendance(page: Page) {
    // Select class to view attendances
    await selectClassFilter(page);

    // Edit attendance
    const attendanceRows = page.locator('table tbody tr, [role="row"], .attendance-item, div[class*="attendance"]');
    
    // Ensure we have rows
    await expect(attendanceRows.first()).toBeVisible({ timeout: 1000 });

    const indexToEdit = 0;
    // Click on the specific cell (Title) to enter detail view
    const rowToEdit = attendanceRows.nth(indexToEdit).locator('td, div').nth(1).first();
    await rowToEdit.click();
    
    // Wait for detail view
    await page.waitForTimeout(1000);

    // Open the actions menu (three-dot icon)
    await openActionMenu(page);
    
    const editButton = page.getByRole('menuitem', { name: /Edit/i })
        .or(page.getByRole('button', { name: /Edit/i }));
    await expect(editButton).toBeVisible();
    await editButton.click();
    
    // Wait for edit form
    await page.waitForTimeout(1000);
    
    // Modify Notes
    const notesInputEdit = page.getByLabel(/Notes|Description/i)
        .or(page.getByPlaceholder(/Notes|Description/i))
        .or(page.locator('textarea[name="note"]'))
        .or(page.locator('textarea'));
        
    await expect(notesInputEdit).toBeVisible();
    await FileInput(notesInputEdit, 'Updated Note during Automation');

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
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 1000 });

    // Navigate back to attendance list
    await page.waitForTimeout(1000);
    
    const backButton = page.locator('button:has(svg.lucide-arrow-left)')
      .or(page.locator('svg.lucide-arrow-left').locator('xpath=..'))
      .or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-arrow-left"]') }))
      .or(page.locator('button[aria-label*="back" i]'))
      .or(page.getByRole('button', { name: /Back|back/i }));
    
    await backButton.first().waitFor({ state: 'visible', timeout: 1000 });
    await backButton.first().scrollIntoViewIfNeeded();
    await backButton.first().click();
    await page.waitForTimeout(1000);
}

export async function deleteAttendance(page: Page) {
    // Select Class to filter list again
    await selectClassFilter(page);

    const attendanceRowsDelete = page.locator('table tbody tr, [role="row"], .attendance-item, div[class*="attendance"]');
    const indexToDelete = 0;
    const attendanceToDelete = attendanceRowsDelete.nth(indexToDelete);
    await deleteEntityViaActionMenu(page, attendanceToDelete, 'Confirm Delete');
}

export async function selectClassFilter(page: Page) {
    const selectClassDropdown = page.locator('button[role="combobox"]')
      .filter({ hasText: /Select Class/i })
      .or(page.locator('button[role="combobox"]').filter({ hasText: /class/i }).first())
      .or(page.getByRole('combobox', { name: /select class/i }));
    
    await expect(selectClassDropdown).toBeVisible({ timeout: 5000 });
    await selectClassDropdown.scrollIntoViewIfNeeded();
    await selectClassDropdown.click();
    
    const options = page.getByRole('option');
    await expect(options.first()).toBeVisible({ timeout: 5000 });
    
    if (await options.count() > 1) {
      await options.nth(1).click();
    } else {
      await options.first().click();
    }
    
    await page.waitForTimeout(2000);
}
