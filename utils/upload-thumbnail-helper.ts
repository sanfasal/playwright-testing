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
  identifiers: string | string[] = "Click to upload new thumbnail",
  options?: {
    imagePath?: string;           // Path to the image file (default: fixtures/sample-thumbnail.png)
    uploadAreaSelector?: string;  // Custom selector for upload area
    timeout?: number;             // Timeout for file chooser (default: 10000ms)
    waitAfterUpload?: number;     // Wait time after upload (default: 1500ms)
  }
): Promise<boolean> {
    const {
    imagePath = path.join(__dirname, '..', 'public', 'images', 'sample-thumbnail.png'),
    uploadAreaSelector,
    timeout = 10000,
    waitAfterUpload = 1500
  } = options || {};

  try {
    // Wait for form to fully render
    await page.waitForTimeout(1000);

    // Normalize identifiers to array
    let idList: string[] = [];
    if (Array.isArray(identifiers)) {
        idList = identifiers;
    } else {
        // Handle "id1 || id2" syntax
        idList = identifiers.split('||').map(s => s.trim()).filter(s => s.length > 0);
    }
    
    let uploadSuccess = false;

    for (const id of idList) {
        console.log(`Checking identifier: ${id}`);
        // Try multiple strategies to locate the element
        const locator = page.locator('#' + id)
           .or(page.getByTestId(id))
           .or(page.locator(`.${id}`))
           .or(page.locator(`input[id="${id}"]`)); // Explicitly check input by ID
           
        if (await locator.count() > 0) {
            // Check if it's an input type="file"
            // We use .first() just in case multiple match, to avoid strict mode violation
            const isFileInput = await locator.first().evaluate(el => 
                el.tagName.toLowerCase() === 'input' && el.getAttribute('type') === 'file'
            ).catch(() => false);

            if (isFileInput) {
                console.log(`Found file input: ${id}. Setting files directly...`);
                
                // Try to hover the associated label or parent for visual "cursor" feedback
                // This is purely cosmetic for the user to see "cursor on the element"
                const label = page.locator(`label[for="${id}"]`);
                if (await label.count() > 0 && await label.first().isVisible().catch(()=>false)) {
                    await label.first().hover({ force: true }).catch(() => {});
                } else {
                    // Try hovering the parent if label not found/visible
                    await locator.first().evaluate(el => {
                        el.parentElement?.scrollIntoView();
                    }).catch(() => {});
                }
                
                await locator.first().setInputFiles(imagePath);
                uploadSuccess = true;
                await page.waitForTimeout(waitAfterUpload); 
                break;
            }
        }
        
        // If not a file input, check if it's a visible clickable trigger
        const clickable = locator.or(page.getByText(id));
        if (await clickable.first().isVisible({ timeout: 500 }).catch(() => false)) {
             console.log(`Found clickable trigger: ${id}. Clicking...`);
             const fileChooserPromise = page.waitForEvent('filechooser', { timeout });
             await clickable.first().click({ force: true });
             const fileChooser = await fileChooserPromise;
             await fileChooser.setFiles(imagePath);
             uploadSuccess = true;
             await page.waitForTimeout(waitAfterUpload);
             break;
        }
    }
    
    // Fallback if loop didn't succeed
    if (!uploadSuccess) {
         console.log("No specific ID matched. Trying generic fallback...");
         const fallback = page.getByText("Click to upload new thumbnail")
            .or(page.locator("label[for='file-input-profile']"))
            .or(page.locator("label[for='file-input']"));
            
         if (uploadAreaSelector) {
             fallback.or(page.locator(uploadAreaSelector));
         }

         if (await fallback.first().count() > 0) {
             const fileChooserPromise = page.waitForEvent('filechooser', { timeout });
             await fallback.first().click({ force: true });
             const fileChooser = await fileChooserPromise;
             await fileChooser.setFiles(imagePath);
             await page.waitForTimeout(waitAfterUpload);
             uploadSuccess = true;
         } else {
             console.log("Warning: Could not perform upload. No elements found.");
         }
    }
    
    return uploadSuccess;
  } catch (e) {
    console.log('⚠ File chooser timeout or error:', e);
    return false;
  }
}

