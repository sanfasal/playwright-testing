import { Page } from '@playwright/test';
import path from 'path';

/**
 * Uploads a thumbnail image using the file chooser dialog
 * @param page - The Playwright page object
 * @param options - Optional configuration
 * @returns Promise<boolean> - Returns true if upload succeeded, false otherwise
 */
export async function uploadThumbnail(
  page: Page,
  getByText: string = "Click to upload new thumbnail",
  options?: {
    imagePath?: string;           // Path to the image file (default: fixtures/sample-thumbnail.png)
    uploadAreaSelector?: string;  // Custom selector for upload area
    timeout?: number;             // Timeout for file chooser (default: 10000ms)
    waitAfterUpload?: number;     // Wait time after upload (default: 1500ms)
  }
): Promise<boolean> {
    const {
    imagePath = path.join(__dirname, '..', 'tests', 'fixtures', 'sample-thumbnail.png'),
    uploadAreaSelector,
    timeout = 10000,
    waitAfterUpload = 1500
  } = options || {};

  try {
    // Wait for form to fully render
    await page.waitForTimeout(1000);
    
    // Find the clickable upload area
    let uploadArea = page.getByText(getByText)
      .or(page.getByTestId(getByText))
      .or(page.locator(`[id="${getByText}"]`))
      .or(page.locator('text=Click to upload new thumbnail'))
      .or(page.locator('label[for="file-input"]'))
      .or(page.locator('label[for="file-input-profile"]'));

    if (uploadAreaSelector) {
      uploadArea = uploadArea.or(page.locator(uploadAreaSelector));
    }
    
    const uploadCount = await uploadArea.count();
    console.log(`Found ${uploadCount} upload area elements`);

    // Set up file chooser handler BEFORE clicking
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout });
    
    // Click on the upload area to open file picker
    await uploadArea.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await uploadArea.first().click({ force: true });
    
    // Wait for file chooser dialog and select file
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(imagePath);
    await page.waitForTimeout(waitAfterUpload);
    
    return true;
  } catch (e) {
    console.log('⚠ File chooser timeout - upload area may not trigger file dialog:', e);
    return false;
  }
}

