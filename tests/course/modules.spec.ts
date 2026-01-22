import { test, expect } from '@playwright/test';
import { login } from '../../utils/auth-helper';
import { addCursorTracking } from '../../utils/cursor-helper';
import { fillFieldWithDelay } from '../../utils/form-helper';
import { deleteItem } from '../../utils/delete-helper';

test.describe('Modules', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Course', { exact: true }).click();
    await page.waitForTimeout(500); 
    await page.getByText('Modules', { exact: true }).click();
    await expect(page).toHaveURL(/courses\/modules/);
  });

  test('Modules page', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Method 1: Try using JavaScript to add IDs
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach((btn, index) => {
        const svg = btn.querySelector('svg');
        if (svg) {
          const classes = svg.className.baseVal || svg.getAttribute('class') || '';
          if (classes.includes('lucide-layout-grid')) {
            btn.id = 'grid-view-btn';
          } else if (classes.includes('lucide-list')) {
            btn.id = 'list-view-btn';
          }
        }
      });
    });
    
  });

//   =====================================
// Add new module
//   =====================================
  test('Add new module', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(120000);
    
    // Click the add button
    await page.locator('#add-module-button').or(page.getByRole('button', { name: /add module/i })).click();
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    await page.waitForTimeout(500);
    
    // Fill Title field with realistic typing
    const titleField = page.locator('#title').or(page.getByLabel(/title/i)).or(page.getByPlaceholder(/title/i));
    await fillFieldWithDelay(titleField, 'Introduction to JavaScript', {
      typingDelay: 50,
      afterTypingDelay: 300
    });
   
    // Fill Description field
    const descriptionField = page.locator('#description')
      .or(page.getByLabel(/description/i))
      .or(page.getByPlaceholder(/description/i));
    await fillFieldWithDelay(descriptionField, 'Learn the fundamentals of JavaScript programming including variables, functions, and control structures.', {
      typingDelay: 30,
      afterTypingDelay: 300
    });
    // Submit the form
    await page.waitForTimeout(500);
    const submitButton = page.getByRole('button', { name: /Add|Create|Submit/i });
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }
    
  });

//   =====================================
// Edit module
//   =====================================
  test('Edit module', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(120000);
    
    // Wait for the module list to load
    await page.waitForTimeout(1000);
    
    // Get all module rows/items
    const moduleRows = page.locator('table tbody tr, [role="row"], .module-item, div[class*="module"]');
    
    // Get the module at index 0 (first module)
    const moduleAtIndex0 = moduleRows.nth(0);
    await moduleAtIndex0.waitFor({ state: 'visible', timeout: 5000 });
    await moduleAtIndex0.click();
    await page.waitForTimeout(1500);

    // Click the edit icon (pencil icon) directly
    const editIcon = page.locator('button').filter({ has: page.locator('svg.lucide-square-pen, svg.lucide-edit, svg.lucide-pencil') }).first()
      .or(page.getByRole('button', { name: /edit/i }).first())
      .or(page.locator('button[aria-label*="edit" i]').first());
    
    if (await editIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editIcon.click();
      
      // Wait for the edit drawer/form to appear
      await page.waitForTimeout(1500);
      
      // Edit Title field
      const titleField = page.locator('#title').or(page.getByLabel(/title/i));
      if (await titleField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await titleField.clear();
        await fillFieldWithDelay(titleField, 'Advanced JavaScript Concepts', {
          typingDelay: 50,
          afterTypingDelay: 300
        });
      }
      
      // Edit Description field
      const descriptionField = page.locator('#description').or(page.getByLabel(/description/i));
      if (await descriptionField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await descriptionField.clear();
        await fillFieldWithDelay(descriptionField, 'Deep dive into advanced JavaScript topics including closures, promises, and async/await.', {
          typingDelay: 30,
          afterTypingDelay: 200
        });
      }
      
      // Submit the updated form
      await page.waitForTimeout(500);
      const submitButton = page.getByRole('button', { name: /Update|Save|Submit/i });
      if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });

//   =====================================
// Delete module
//   =====================================
  test('Delete module', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(120000);
    
    await page.waitForTimeout(2000);
    const moduleRows = page.locator('table tbody tr, [role="row"], .module-item, div[class*="module"]');
    const indexToDelete = 0;
    const moduleToDelete = moduleRows.nth(indexToDelete);
    
    if (await moduleToDelete.isVisible({ timeout: 5000 }).catch(() => false)) {
      const deleteIconInRow = moduleToDelete.locator('button').filter({ 
        has: page.locator('svg.lucide-trash, svg.lucide-trash-2') 
      }).first();
      
      // Click the delete icon directly (don't click the module row)
      if (await deleteIconInRow.isVisible({ timeout: 3000 }).catch(() => false)) {
        await deleteIconInRow.click();
        await page.waitForTimeout(1000);
        await deleteItem(page, 'Confirm Delete');
      }
    }
  });
});
