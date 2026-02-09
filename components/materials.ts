import { Page, expect } from '@playwright/test';
import { uploadThumbnail } from '../utils/upload-thumbnail-helper';

/**
 * Creates a new material with an optional image upload.
 * @param page - Playwright Page object
 * @param imagePath - Optional path to the image/file to upload
 */
export async function createMaterial(page: Page, imagePath?: string) {
    // Wait for the form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible();

    if (imagePath) {
        await uploadThumbnail(page, "materialFile", {
            imagePath: imagePath
        });
    }
    
    await page.waitForTimeout(500);
    const submitButton = page.getByRole('button', { name: /Create|Save|Submit/i });
    await submitButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500); // Brief pause for smooth scroll animation
    await submitButton.click();
    await page.waitForTimeout(1200);
}

/**
 * Updates an existing material, optionally replacing the file.
 * @param page - Playwright Page object
 * @param newImagePath - Optional path to the new image/file to upload
 */
export async function updateMaterial(page: Page, newImagePath?: string) {
    // Wait for edit form to appear
    await page.waitForTimeout(1500);
    
    // Click "Remove file" button first to remove existing file if it exists
    const removeFileButton = page.getByRole('button', { name: /Remove file/i })
      .or(page.locator('button[aria-label*="Remove file"]'))
      .or(page.locator('button:has-text("Remove file")'));
    
    if (await removeFileButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Clicking Remove file button...');
      await removeFileButton.click();
      await page.waitForTimeout(500);
    }

    // Now upload the new thumbnail if provided
    if (newImagePath) {
        await uploadThumbnail(page, "materialFile", {
            imagePath: newImagePath
        });
        await page.waitForTimeout(500);
    }
    
    // Save changes
    const submitButton = page.getByRole('button', { name: /Save|Update/i });
    if (await submitButton.isVisible()) {
        await submitButton.click();
    }
    
    // Wait for update to complete
    await page.waitForTimeout(2000);
}
