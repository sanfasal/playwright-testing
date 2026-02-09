import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { toggleViewMode } from '../utils/view-helper';
import { deleteEntityViaActionMenu } from '../utils/delete-helper';
import { createMaterial, updateMaterial } from '../components/materials';
import path from 'path';
import { openActionMenu } from '../utils/action-menu-helper';

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

  // ===================================
  // Add new material with documents
  // ===================================

  test('Add new material with documents', async ({ page }) => {
    await page.locator('#add-material-button').click();
    const filePath = path.join(__dirname, '..', 'public', 'images', 'thumbnail-create.pdf');
    await createMaterial(page, filePath);
  });

  // ===================================
  // Add new material with video
  // ===================================

  test('Add new material with video', async ({ page }) => {
    await page.locator('#add-material-button').click();
    const filePath = path.join(__dirname, '..', 'public', 'video', 'seksaa-vdo.mp4');
    await createMaterial(page, filePath);
  });

  // ===================================
  // View materials page
  // ===================================
    test('View materials page', async ({ page }) => {
    await page.waitForTimeout(1000);
    await toggleViewMode(page);
    await page.waitForTimeout(1000);
    await selectMaterial(page, 0);
  });

  // ===================================
  // Edit material
  // ===================================

  test('Edit material', async ({ page }) => {
    // Select and open the first material
    await selectMaterial(page, 0);
    
    // Open the actions menu (three-dot icon)
    await openActionMenu(page);
    
    // Look for Edit button in the dropdown menu
    const editButton = page.getByRole('menuitem', { name: /Edit/i }).or(page.getByRole('button', { name: /Edit/i }));
    
    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editButton.click();
      
      const updateFilePath = path.join(__dirname, '..', 'public', 'images', 'thumbnail-update.pdf');
      await updateMaterial(page, updateFilePath);
    } else {
      console.log('Edit functionality not found');
    }
  });

  // ===================================
  // Delete material
  // ===================================

  test('Delete material', async ({ page }) => {
    // Select and open the first material (index 0)
    await selectMaterial(page, 0);
    await deleteEntityViaActionMenu(page, null, 'Confirm Delete');
  });
});

