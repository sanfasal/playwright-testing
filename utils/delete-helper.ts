import { Page } from '@playwright/test';
import { FileInput } from './form-helper';

/**
 * Helper function to handle delete confirmation modal
 * Types confirmation text and clicks "Permanently Delete" button
 * 
 * @param page - Playwright page object
 * @param confirmationText - Text to type in the confirmation input (default: 'Confirm Delete')
 * @returns Promise<boolean> - true if delete was successful
 */
export async function deleteItem(
  page: Page,
  confirmationText: string = 'Confirm Delete'
): Promise<boolean> {
  // Type confirmation text in the input field
  const confirmInput = page.getByPlaceholder(/Type here/i)
    .or(page.locator('input[type="text"]').last());
  
  if (await confirmInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await FileInput(confirmInput, confirmationText, {
      typingDelay: 10,
      afterTypingDelay: 100
    });
  } else {
    console.log('⚠ Confirmation input not found');
    return false;
  }
  
  // Click the "Permanently Delete" button
  const permanentlyDeleteButton = page.getByRole('button', { name: /Permanently Delete/i });
  if (await permanentlyDeleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await permanentlyDeleteButton.click();
    console.log('✓ Clicked Permanently Delete button');
    await page.waitForTimeout(2000);
    return true;
  } else {
    console.log('⚠ Permanently Delete button not found');
    return false;
  }
}

/**
 * Helper function to delete an item via the UI action menu (three dots -> Delete)
 * 
 * @param page - Playwright page object
 * @param rowLocator - Optional locator for the row to click first (to enter detail view)
 * @param confirmationText - Text to confirm delete (default: 'Confirm Delete')
 */
export async function deleteEntityViaActionMenu(
  page: Page, 
  rowLocator: any = null,
  confirmationText: string = 'Confirm Delete'
): Promise<void> {
  // 1. If a row locator is provided, click it to enter detail view
  if (rowLocator) {
      if (await rowLocator.isVisible({ timeout: 5000 }).catch(() => false)) {
          await rowLocator.click();
          await page.waitForTimeout(1500);
      } else {
          console.log('⚠ Row locator not found or not visible');
          return;
      }
  }

  // 2. Find and click the three-dot menu button
  const actionsMenuButton = page.locator('button:has(svg.lucide-ellipsis-vertical)')
    .or(page.getByRole('button', { name: /more options|actions|menu/i }))
    .or(page.locator('button[aria-haspopup="menu"]'))
    .or(page.locator('svg.lucide-ellipsis-vertical'))
    .first();
  if (await actionsMenuButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await actionsMenuButton.click();
      await page.waitForTimeout(800);
      
      // 3. Click on Delete option in the menu
      const deleteButton = page.getByRole('menuitem', { name: /Delete|Remove/i })
        .or(page.getByRole('button', { name: /Delete|Remove/i }));
      
      if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await deleteButton.click();
          await page.waitForTimeout(1000);
          
          // 4. Handle confirmation dialog
          await deleteItem(page, confirmationText);
      } else {
          console.log('⚠ Delete option not found in menu');
      }
  } else {
      console.log('⚠ Actions menu (three dots) not found');
  }
}
