import { Page, expect } from '@playwright/test';
import { FileInput } from '../utils/form-helper';
import { uploadThumbnail } from '../utils/upload-thumbnail-helper';

export interface LessonData {
  title: string;
  duration?: string;
  objective?: string;
  description?: string;
  videoPath?: string;
  documentPath?: string;
  publish?: boolean;
}

/**
 * Creates a new lesson with optional video/document attachments.
 */
export async function createLesson(page: Page, data: LessonData) {
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible();
    await page.waitForTimeout(500);
    
    // Fill Title
    const titleField = page.locator('#title').or(page.getByLabel(/title/i)).or(page.getByPlaceholder(/title/i));
    await FileInput(titleField, data.title);
    
    // Fill Duration
    if (data.duration) {
        await page.waitForTimeout(500);
        const durationField = page.getByLabel(/duration/i)
          .or(page.getByPlaceholder(/duration/i))
          .or(page.locator('input[type="number"]').nth(1));
        if (await durationField.isVisible().catch(() => false)) {
          await FileInput(durationField, data.duration);
        }
    }

    // Fill Objective
    if (data.objective) {
        const objectiveField = page.locator('#objective')
          .or(page.locator('#content'))
          .or(page.getByLabel(/objective|content/i))
          .or(page.getByPlaceholder(/objective|content/i));
        await FileInput(objectiveField, data.objective);
    }
    
    // Fill Description
    if (data.description) {
        const descriptionField = page.locator('#description')
          .or(page.locator('#content'))
          .or(page.getByLabel(/description|content/i))
          .or(page.getByPlaceholder(/description|content/i));
        await FileInput(descriptionField, data.description);
    }
    
    // Attach Video
    await attachMedia(page, 'Attach Videos', data.videoPath, 'video');

    // Attach Document
    await attachMedia(page, 'Attach Documents', data.documentPath, 'document');
    
    // Toggle Publish
    if (data.publish) {
        await page.waitForTimeout(500);
        const publishToggle = page.getByText('Publish', { exact: true })
          .or(page.locator('button:has-text("Publish")'))
          .or(page.locator('[role="switch"]').filter({ hasText: /publish/i }))
          .or(page.locator('label:has-text("Publish")'));
        
        if (await publishToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
          const isChecked = await publishToggle.getAttribute('aria-checked').catch(() => 'false');
          if (isChecked !== 'true') {
            await publishToggle.click();
          }
          await page.waitForTimeout(500);
        }
    }
    
    await page.getByRole('button', { name: /Add|Create|Submit/i }).click();
    await page.waitForTimeout(1000);
}

/**
 * Updates an existing lesson.
 */
export async function updateLesson(page: Page, data: LessonData) {
    await page.waitForTimeout(1500);
    
    // Fill Title
    const titleField = page.locator('#title').or(page.getByLabel(/title/i));
    if (await titleField.isVisible({ timeout: 1000 }).catch(() => false)) {
        await titleField.clear();
        await FileInput(titleField, data.title);
    }
    
    // Fill Duration
    if (data.duration) {
        const durationField = page.getByLabel(/duration/i)
          .or(page.getByPlaceholder(/duration/i))
          .or(page.locator('input[type="number"]').first());
        if (await durationField.isVisible({ timeout: 1000 }).catch(() => false)) {
            await durationField.clear();
            await FileInput(durationField, data.duration);
        }
    }
    
    // Fill Objective
    if (data.objective) {
        const objectiveField = page.locator('#objective')
          .or(page.locator('#content'))
          .or(page.getByLabel(/objective|content/i))
          .or(page.getByPlaceholder(/objective|content/i));
        if (await objectiveField.isVisible({ timeout: 1000 }).catch(() => false)) {
            await objectiveField.clear();
            await FileInput(objectiveField, data.objective);
        }
    }
    
    // Fill Description
    if (data.description) {
        const descriptionField = page.locator('#description')
          .or(page.locator('#content'))
          .or(page.getByLabel(/description|content/i))
          .or(page.getByPlaceholder(/description|content/i));
        if (await descriptionField.isVisible({ timeout: 1000 }).catch(() => false)) {
            await descriptionField.clear();
            await FileInput(descriptionField, data.description);
        }
    }
    
    // Attach Material (Generic button name often used in Edit mode?)
    // In the test it looks for "Attach Material" specifically during Edit.
    const attachMaterialButton = page.getByRole('button', { name: /attach material/i })
        .or(page.getByText(/attach material/i))
        .or(page.locator('button:has-text("Attach Material")'));
    
    if (await attachMaterialButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await attachMaterialButton.click();
        await page.waitForTimeout(1500);
        
        // Logic to add one more item if multiple exist, or just skip
        const materialCards = page.locator('div[data-slot="card"]');
        const cardCount = await materialCards.count();
        if (cardCount > 1) {
             const secondCard = materialCards.nth(1); 
             if (await secondCard.isVisible({ timeout: 2000 }).catch(() => false)) {
                 await secondCard.click();
                 await page.waitForTimeout(500); 
             }
        }
        
        // Save Modal
        await clickSaveInModal(page);
    }
    
    // Submit Update
    await page.getByRole('button', { name: /Update|Save|Submit/i }).click();
    await page.waitForTimeout(500);
}

// Private helper to handle media attachment logic
async function attachMedia(page: Page, buttonName: string, filePath: string | undefined, type: 'video' | 'document') {
    const attachButton = page.getByRole('button', { name: new RegExp(buttonName, 'i') })
      .or(page.getByText(new RegExp(buttonName, 'i')))
      .or(page.locator(`button:has-text("${buttonName}")`));
    
    if (await attachButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await attachButton.click();
      await page.waitForTimeout(1500); // Wait for modal
      await page.waitForTimeout(500);
      
      const cardsSelector = 'div[data-slot="card"]';
      const uploadTextRegex = type === 'video' ? /Upload new video/i : /Upload new document/i;
      const contentCards = page.locator(cardsSelector).filter({ hasNotText: uploadTextRegex });
      const contentCount = await contentCards.count();
      
      let selected = false;
      
      if (contentCount === 0 && filePath) {
          // Upload New Logic
          const uploadBtnText = type === 'video' ? 'Upload new video' : 'Upload new document';
          const uploadButton = page.locator('button').filter({ hasText: uploadBtnText }).first();
          
          if (await uploadButton.isVisible({ timeout: 3000 }).catch(() => false)) {
              await uploadButton.click();
              await page.waitForTimeout(1000);
              // Wait for modal transition
              await page.waitForTimeout(1000);
              
              const fieldName = "materialFile"; // Seems consistent
              
               // Use a generic name for the upload if it's a document, or just file path logic
              await uploadThumbnail(page, fieldName, { imagePath: filePath });
              await page.waitForTimeout(500);
              
              const createButton = page.locator('[role="dialog"]').getByRole('button', { name: 'Create', exact: true })
                .or(page.locator('.modal').getByRole('button', { name: 'Create', exact: true }))
                .or(page.locator('button[type="submit"]:not([disabled])').filter({ hasText: 'Create' }).last());

              if (await createButton.isVisible()) {
                  await createButton.evaluate((el) => {
                      el.scrollIntoView({ behavior: 'instant', block: 'center' });
                  });
              }
              await page.waitForTimeout(1000);
              await createButton.click({ force: true });
              await page.waitForTimeout(2000);
              
              const newContentCards = page.locator(cardsSelector).filter({ hasNotText: uploadTextRegex });
              if (await newContentCards.first().isVisible({ timeout: 5000 }).catch(() => false)) {
                   await newContentCards.first().click();
                   await page.waitForTimeout(500);
              }
          }
      } else {
          // Select existing
          const firstCard = contentCards.nth(0); 
          if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
              await firstCard.click();
              selected = true;
              await page.waitForTimeout(500); 
          }
           if (!selected && contentCount > 1) {
               await contentCards.nth(1).click();
               selected = true;
               await page.waitForTimeout(500);
          }
      }
      
      await clickSaveInModal(page);
    }
}

async function clickSaveInModal(page: Page) {
    const saveButton = page.getByRole('button', { name: /^save$/i })
    .or(page.locator('button:has-text("Save")'))
    .or(page.locator('button').filter({ hasText: /^save$/i }));
  
    let saveClicked = false;
    if (await saveButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await saveButton.click();
        await page.waitForTimeout(1000);
        saveClicked = true;
    }
  
    if (!saveClicked) {
      // JS Fallback
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          const text = btn.textContent?.trim() || '';
          if (text === 'Save' && (btn as HTMLElement).offsetParent !== null) {
            (btn as HTMLElement).click();
            return true;
          }
        }
        return false;
      });
      await page.waitForTimeout(1000);
    }
}
