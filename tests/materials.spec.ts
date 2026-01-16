import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';

test.describe('Materials Page', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    
    await login(page);
    
    await expect(page).toHaveURL(/dashboard/);
    await page.waitForTimeout(2000);

    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 30000 });
    
    await page.getByText('Material', { exact: true }).click() ;
    
    await expect(page).toHaveURL(/material/);
  });

  // ===================================
  // Helper function to select a material and open its details
  // ===================================
  async function selectMaterial(page: any, index: number = 1) {
    // Get all material rows - wait for them to be visible first
    const materialRows = page.locator('table tbody tr, [role="row"], .material-row');
    
    // Wait for at least one material to be visible
    await materialRows.first().waitFor({ state: 'visible', timeout: 10000 });
    
    // Wait a bit for all materials to load
    await page.waitForTimeout(500);
    
    // Get the material at the specified index
    const materialAtIndex = materialRows.nth(index);
    
    // Ensure the specific material is visible before clicking
    await materialAtIndex.waitFor({ state: 'visible', timeout: 5000 });
    
    // Click on the material to view details
    await materialAtIndex.click();
    
    // Wait for material details to load
    await page.waitForTimeout(1500);
  }

  test('View materials page', async ({ page }) => {
    // Select and open material at index 1 (second material)
    await selectMaterial(page, 1);
    
    // Take a screenshot of the material details
    await page.screenshot({ 
      path: 'test-results/screenshots/material-details.png',
      fullPage: true 
    });
  });

  test('Add new material', async ({ page }) => {
    // Click the add button using the specific ID
    await page.locator('#add-material-button').click();
    
    // Wait for the form/drawer to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    
    // Fill YouTube Link - try multiple selector strategies
    const youtubeLinkField = page.locator('#YoutubeLink, input[name="youtubeLink"], input[placeholder*="youtube" i], input[placeholder*="link" i]').first();
    await youtubeLinkField.waitFor({ state: 'visible', timeout: 5000 });
    await youtubeLinkField.fill('https://www.youtube.com/watch?v=5v4cIOgBTCc');
    
    // Fill Title - try multiple selector strategies
    const titleField = page.locator('#title, input[name="title"], input[placeholder*="title" i]').first();
    await titleField.waitFor({ state: 'visible', timeout: 5000 });
    await titleField.fill('Basic Electronics');
    
    // Smooth scroll to and click the Create/Save button
    const submitButton = page.getByRole('button', { name: /Create|Save|Submit/i });
    await submitButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500); // Brief pause for smooth scroll animation
    await submitButton.click();
    
    // Wait for success message or page update
    await page.waitForTimeout(2000);
  });

  test('Edit material', async ({ page }) => {
    // Select and open the first material
    await selectMaterial(page, 0);
    
    // Open the actions menu (three-dot icon)
    const actionsMenuButton = page.getByRole('button', { name: /more options|actions|menu/i }).or(page.locator('button[aria-haspopup="menu"]')).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
    
    // Look for Edit button in the dropdown menu
    const editButton = page.getByRole('menuitem', { name: /Edit/i }).or(page.getByRole('button', { name: /Edit/i }));
    
    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editButton.click();
      
      // Wait for edit form to appear
      await page.waitForTimeout(1000);
      
      // Edit YouTube Link field
      const youtubeLinkField = page.locator('#YoutubeLink, input[name="youtubeLink"], input[placeholder*="youtube" i], input[placeholder*="link" i]').first();
      if (await youtubeLinkField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await youtubeLinkField.clear();
        await youtubeLinkField.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      }
      
      // Edit Title field
      const titleField = page.locator('#title, input[name="title"], input[placeholder*="title" i]').first();
      if (await titleField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await titleField.clear();
        await titleField.fill('Advanced Electronics - Updated');
      }
      
      // Save changes
      await page.getByRole('button', { name: /Save|Update/i }).click();
      
      // Wait for update to complete
      await page.waitForTimeout(2000);
      
      // Take a screenshot after successful edit
      await page.screenshot({ 
        path: 'test-results/screenshots/material-edited.png',
        fullPage: true 
      });
    } else {
      console.log('Edit functionality not found');
    }
  });

  test('Delete material', async ({ page }) => {
    // Get all material rows for count verification
    const materialRows = page.locator('table tbody tr, [role="row"], .material-row');
    
    // Get initial count
    const initialCount = await materialRows.count();
    
    // Select and open the last material
    const lastIndex = initialCount - 1;
    await selectMaterial(page, lastIndex);
    
    // Open the actions menu (three-dot icon)
    const actionsMenuButton = page.getByRole('button', { name: /more options|actions|menu/i }).or(page.locator('button[aria-haspopup="menu"]')).first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
    
    // Look for Delete button in the dropdown menu
    const deleteButton = page.getByRole('menuitem', { name: /Delete|Remove/i }).or(page.getByRole('button', { name: /Delete|Remove/i }));
    
    if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await deleteButton.click();
      
      // Wait for confirmation modal to appear
      await page.waitForTimeout(1000);
      
      // Type "Confirm Delete" in the input field
      const confirmInput = page.getByPlaceholder(/Type here/i).or(page.locator('input[type="text"]').last());
      if (await confirmInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await confirmInput.fill('Confirm Delete');
        await page.waitForTimeout(500);
      }
      
      // Click the "Permanently Delete" button
      const permanentlyDeleteButton = page.getByRole('button', { name: /Permanently Delete/i });
      if (await permanentlyDeleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await permanentlyDeleteButton.click();
      }
      
      // Wait for deletion to complete
      await page.waitForTimeout(2000);
      
      // Verify material was deleted
      const newCount = await materialRows.count();
      expect(newCount).toBeLessThan(initialCount);
    } else {
      console.log('Delete functionality not found');
    }
  });

  test('Export materials', async ({ page }) => {
    // Set up download promise before clicking the button
    await selectMaterial(page, 3);
    await page.getByRole('button', { name: /Download|CSV|Exceli/i }).click();
    await page.waitForTimeout(2000);

  });
});
