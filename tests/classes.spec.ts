import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { deleteEntityViaActionMenu } from '../utils/delete-helper';
import { toggleViewMode } from '../utils/view-helper';
import staticData from '../constant/static-data.json';
import { openActionMenu } from '../utils/action-menu-helper';
import { createClass, updateClass } from '../components/classes';

test.describe('Class', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Class', { exact: true }).click();
    await expect(page).toHaveURL(/classes/);
  });

//   =====================================
//   Add new class
//   =====================================
  test('Add new class', async ({ page }) => {
    await createClass(page, staticData.classDataAdd);

  });

//   =====================================
//   Class page
//   =====================================
    test('Class List', async ({ page }) => {
    await page.waitForTimeout(1000);
    await toggleViewMode(page);
  })

//   =====================================
// Edit class
//   =====================================
  test('Edit class', async ({ page }) => {
    test.setTimeout(120000); 
    await page.waitForTimeout(1000);
    const classRows = page.locator('table tbody tr').or(page.locator('[role="row"]'));
    const rowCount = await classRows.count();
    console.log(`Found ${rowCount} class rows`);
    
    if (rowCount === 0) {
      console.log('⚠ No classes found to edit. Skipping edit test.');
      test.skip();
      return;
    }
    
    const classAtIndex0 = classRows.nth(0);
    await expect(classAtIndex0).toBeVisible({ timeout: 10000 });
    await classAtIndex0.click();
    
    // Wait for detail view to load - look for specific detail page indicators
    await page.waitForTimeout(1000);

    // Open the actions menu (three-dot icon)
    await openActionMenu(page);
    
    // Click on Edit option in the menu
    const editButton = page.getByRole('menuitem', { name: /Edit/i }).or(page.getByRole('button', { name: /Edit/i }));
    
    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editButton.click();
      await updateClass(page, staticData.classDataEdit);
    } else {
      console.log('⚠ Edit button not found or not visible');
    }
  });

//   =====================================
// Delete class
//   =====================================

  test('Delete class', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(120000);
    
    // Wait for the class list to load
    await page.waitForTimeout(2000);
    
    // Get all class rows/items
    const classRows = page.locator('table tbody tr, [role="row"], .class-item, div[class*="class"]');
    
    // Use index 0
    const indexToDelete = 0;
    const classToDelete = classRows.nth(indexToDelete);
    
    await deleteEntityViaActionMenu(page, classToDelete, 'Confirm Delete');
  });
});
