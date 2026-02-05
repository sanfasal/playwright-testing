import { test, expect } from '@playwright/test';
import { login } from '../../utils/auth-helper';
import { addCursorTracking } from '../../utils/cursor-helper';
import { FileInput } from '../../utils/form-helper';
import { deleteItem } from '../../utils/delete-helper';
import { uploadThumbnail } from '../../utils/upload-thumbnail-helper';
import path from 'path';


test.describe('Lessons', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);

    // Wait for the loading screen to disappear
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    
    // Navigate to lessons page - first click Course to open dropdown
    await page.getByText('Course', { exact: true }).click();
    await page.waitForTimeout(500); // Wait for dropdown to open
    
    // Then click Lessons from the dropdown menu
    await page.getByText('Lessons', { exact: true }).click();
    
    // Ensure we are on the lessons page before each test starts
    await expect(page).toHaveURL(/courses\/lessons/);
  });

//   =====================================
// Add new lesson
//   =====================================

  test('Add new lesson', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(120000);
    
    // Click the add button
    await page.locator('#add-lesson-button').or(page.getByRole('button', { name: /add lesson/i })).click();
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    await page.waitForTimeout(500);
    
    // Fill Title field with realistic typing
    const titleField = page.locator('#title').or(page.getByLabel(/title/i)).or(page.getByPlaceholder(/title/i));
    await FileInput(titleField, 'React js');
    
        // Fill Duration field (if exists)
    await page.waitForTimeout(500);
    const durationField = page.getByLabel(/duration/i)
      .or(page.getByPlaceholder(/duration/i))
      .or(page.locator('input[type="number"]').nth(1));
    if (await durationField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(durationField, '45');
    }

        // Fill Description/Content field
    const objectiveField = page.locator('#objective')
      .or(page.locator('#content'))
      .or(page.getByLabel(/objective|content/i))
      .or(page.getByPlaceholder(/objective|content/i));
    await FileInput(objectiveField, 'objective');
    
    
    // Fill Description field first
    const descriptionField = page.locator('#description')
      .or(page.locator('#content'))
      .or(page.getByLabel(/description|content/i))
      .or(page.getByPlaceholder(/description|content/i));
    
    await FileInput(descriptionField, 'In this lesson, you will learn about React js');


    
    //=============================================================================
    //Attach Video

      // THEN click "Attach Videos" button after description is filled
    const attachVideoButton = page.getByRole('button', { name: /Attach Videos/i })
      .or(page.getByText(/Attach Videos/i))
      .or(page.locator('button:has-text("Attach Videos")'));
    
    if (await attachVideoButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await attachVideoButton.click();
      await page.waitForTimeout(1500); // Wait for modal to open
      
      await page.evaluate(() => {
        const modal = document.querySelector('[role="dialog"]') || document.querySelector('.modal') || document.body;
        const allDivs = modal.querySelectorAll('div');
        allDivs.forEach((div, idx) => {
          const text = div.textContent?.trim().substring(0, 50) || '';
          const classes = div.className || 'no-class';
          if (text.includes('file')) {
            console.log(`Div ${idx}: classes="${classes}", text="${text}"`);
          }
        });
      });
      
      await page.waitForTimeout(500);
      
      const videoCards = page.locator('div[data-slot="card"]');
      // Filter out 'Upload new video' to check for actual video content cards
      const contentCards = videoCards.filter({ hasNotText: /Upload new video/i });
      const contentCount = await contentCards.count();

      let selected = false;
      
      if (contentCount === 0) {
          // Use a specific locator for the button shown in the screenshot
          const uploadButton = page.locator('button').filter({ hasText: 'Upload new video' }).first();
          
          if (await uploadButton.isVisible({ timeout: 3000 }).catch(() => false)) {
              await uploadButton.click();

                  await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
                  await uploadThumbnail(page, "materialFile", {
                    imagePath: path.join(__dirname, '..', '..', 'public', 'video', 'seksaa-vdo.mp4')
                  });
                  
                  await page.waitForTimeout(500);
                  
                  // Target the Create button specifically within the dialog/modal to avoid "strict mode violation"
                  // caused by the main page's Create button also being present.
                  const createButton = page.locator('[role="dialog"]').getByRole('button', { name: 'Create', exact: true })
                    .or(page.locator('.modal').getByRole('button', { name: 'Create', exact: true }))
                    .or(page.locator('button[type="submit"]:not([disabled])').filter({ hasText: 'Create' }).last());
                  
                  // Ensure explicit scroll to the button
                  if (await createButton.isVisible()) {
                      console.log('Scrolling to Create button...');
                      await createButton.evaluate((el) => {
                          el.scrollIntoView({ behavior: 'instant', block: 'center' });
                      });
                  }
                  
                  await page.waitForTimeout(1000); // Wait for scroll to settle
                  await createButton.click({ force: true });

                  await page.waitForTimeout(2000);
                  const newContentCards = page.locator('div[data-slot="card"]').filter({ hasNotText: /Upload new video/i });
                  if (await newContentCards.first().isVisible({ timeout: 5000 }).catch(() => false)) {
                       await newContentCards.first().click();
                       await page.waitForTimeout(500);
                  }

                  
          } else {
             // Fallback to simpler text match
             console.log('Button not found by strict selector, trying generic text match...');
             await page.getByText('Upload new video', { exact: false }).click();
          }
      } else {
          // Select the first available video card
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
      
      // Click Save button with visible cursor movement
      await page.getByRole('button', { name: /Save|save/i })
        .or(page.locator('button:has-text("Save")')).click();
        await page.waitForTimeout(1500);
    }
    //========================================================================================
    // Attach documents

    const attachDocumentButton = page.getByRole('button', { name: /Attach Documents/i })
      .or(page.getByText(/Attach Documents/i))
      .or(page.locator('button:has-text("Attach Documents")'));
    
    if (await attachDocumentButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await attachDocumentButton.click();
      await page.waitForTimeout(1500); // Wait for modal to open
      
      await page.evaluate(() => {
        const modal = document.querySelector('[role="dialog"]') || document.querySelector('.modal') || document.body;
        const allDivs = modal.querySelectorAll('div');
        allDivs.forEach((div, idx) => {
          const text = div.textContent?.trim().substring(0, 50) || '';
          const classes = div.className || 'no-class';
          if (text.includes('file')) {
            console.log(`Div ${idx}: classes="${classes}", text="${text}"`);
          }
        });
      });
      
      await page.waitForTimeout(500);
      
      const videoCards = page.locator('div[data-slot="card"]');
      // Filter out 'Upload new video' to check for actual video content cards
      const contentCards = videoCards.filter({ hasNotText: /Upload new video/i });
      const contentCount = await contentCards.count();

      let selected = false;
      
      if (contentCount === 0) {
          // Use a specific locator for the button shown in the screenshot
          const uploadButton = page.locator('button').filter({ hasText: 'Upload new document' }).first();
          
          if (await uploadButton.isVisible({ timeout: 3000 }).catch(() => false)) {
              await uploadButton.click();

              await page.waitForTimeout(1000); // Wait for modal animation
              
                    await uploadThumbnail(page, "Click to upload new material", {
                      imagePath: path.join(__dirname, '..', '..', 'public', 'images', 'thumbnial-create.pdf')
                    });
                  
                  await page.waitForTimeout(500);
                  
                  const createButton = page.locator('[role="dialog"]').getByRole('button', { name: 'Create', exact: true })
                    .or(page.locator('.modal').getByRole('button', { name: 'Create', exact: true }))
                    .or(page.locator('button[type="submit"]:not([disabled])').filter({ hasText: 'Create' }).last());
                  
                  // Ensure explicit scroll to the button
                  if (await createButton.isVisible()) {
                      console.log('Scrolling to Create button...');
                      await createButton.evaluate((el) => {
                          el.scrollIntoView({ behavior: 'instant', block: 'center' });
                      });
                  }
                  
                  await page.waitForTimeout(1000); // Wait for scroll to settle
                  await createButton.click({ force: true });
                  console.log('Clicked Create button');

                  await page.waitForTimeout(2000);
                  const newContentCards = page.locator('div[data-slot="card"]').filter({ hasNotText: /Upload new document/i });
                  if (await newContentCards.first().isVisible({ timeout: 5000 }).catch(() => false)) {
                       await newContentCards.first().click();
                       await page.waitForTimeout(500);
                  }

                  
          } else {
             // Fallback to simpler text match
             console.log('Button not found by strict selector, trying generic text match...');
             await page.getByText('Upload new document', { exact: false }).click();
          }
      } else {
          // Select the first available video card
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
      
      // Click Save button with visible cursor movement
      await page.getByRole('button', { name: /Save|save/i })
        .or(page.locator('button:has-text("Save")')).click();
        await page.waitForTimeout(1500);
    }



    // Submit the form
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Add|Create|Submit/i }).click();
  });

  //   =====================================
   // Edit lesson
//   =====================================
  test('Edit lesson', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(120000);
    
    // Wait for the lesson list to load
    await page.waitForTimeout(1000);
    
    // Get all lesson rows/items
    const lessonRows = page.locator('table tbody tr, [role="row"], .lesson-item, div[class*="lesson"]');
    
    // Get the lesson at index 0 (first lesson)
    const lessonAtIndex0 = lessonRows.nth(0);
    await lessonAtIndex0.waitFor({ state: 'visible', timeout: 5000 });
    // Click the edit icon (pencil icon) directly within the lesson row
    const editIcon = lessonAtIndex0.locator('button').filter({ has: page.locator('svg.lucide-square-pen, svg.lucide-edit, svg.lucide-pencil') }).first()
      .or(lessonAtIndex0.getByRole('button', { name: /edit/i }).first())
      .or(lessonAtIndex0.getByText(/Edit/i).first())
      .or(lessonAtIndex0.locator('button[aria-label*="edit" i]').first());
    
    if (await editIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editIcon.click();
      console.log('✓ Clicked edit icon');
      
      // Wait for the edit drawer/form to appear
      await page.waitForTimeout(1500);
      
      // Edit Title field
      const titleField = page.locator('#title').or(page.getByLabel(/title/i));
      if (await titleField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await titleField.clear();
        await FileInput(titleField, 'Updated React js Advanced');
      }
      
      // Edit Duration field
      const durationField = page.getByLabel(/duration/i)
        .or(page.getByPlaceholder(/duration/i))
        .or(page.locator('input[type="number"]').first());
      if (await durationField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await durationField.clear();
        await FileInput(durationField, '60');
      }
      
      // Edit Objective field
      const objectiveField = page.locator('#objective')
        .or(page.locator('#content'))
        .or(page.getByLabel(/objective|content/i))
        .or(page.getByPlaceholder(/objective|content/i));
      if (await objectiveField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await objectiveField.clear();
        await FileInput(objectiveField, 'Updated objective for advanced React');
      }
      
      // Edit Description field
      const descriptionField = page.locator('#description')
        .or(page.locator('#content'))
        .or(page.getByLabel(/description|content/i))
        .or(page.getByPlaceholder(/description|content/i));
      if (await descriptionField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await descriptionField.clear();
        await FileInput(descriptionField, 'Updated lesson covering advanced React concepts including hooks and state management.');
      }
      
      // THEN click "Attach Material" button after description is filled
      await page.waitForTimeout(500);
      const attachMaterialButton = page.getByRole('button', { name: /attach material/i })
        .or(page.getByText(/attach material/i))
        .or(page.locator('button:has-text("Attach Material")'));
      
      if (await attachMaterialButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await attachMaterialButton.click();
        console.log('✓ Clicked Attach Material button in edit mode');
        await page.waitForTimeout(1500);
        
        console.log('Checking for additional materials to add...');
        const materialCards = page.locator('div[data-slot="card"]');
        const cardCount = await materialCards.count();
        console.log(`Debug: Found ${cardCount} material cards`);

        if (cardCount > 1) {
            // Click the second card (index 1) to add "one more"
            const secondCard = materialCards.nth(1); 
            if (await secondCard.isVisible({ timeout: 5000 }).catch(() => false)) {
                await secondCard.click();
                console.log('✓ Success: Clicked second material card (Adding one more)');
                await page.waitForTimeout(500); 
            }
        } else {
             console.log('ℹ Only 0-1 items found, skipping selection to avoid deselecting existing item or if none exist.');
        }
        
        // Else (and always): Click Save button with visible cursor movement
        await page.waitForTimeout(500);
        const saveButton = page.getByRole('button', { name: /^save$/i })
          .or(page.locator('button:has-text("Save")'))
          .or(page.locator('button').filter({ hasText: /^save$/i }));
        
        console.log('Looking for Save button...');
        let saveClicked = false;
        
        if (await saveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
           // Move mouse to button to show cursor
           const box = await saveButton.boundingBox();
           if (box) {
                await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await page.waitForTimeout(500); // Wait for user to see cursor
           }
          await saveButton.click();
          console.log('✓ Clicked Save button to close modal');
          await page.waitForTimeout(1000);
          saveClicked = true;
        }
        
        // Fallback: Use JavaScript to click Save button
        if (!saveClicked) {
          const clicked = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for (const btn of buttons) {
              const text = btn.textContent?.trim() || '';
              if (text === 'Save' && (btn as HTMLElement).offsetParent !== null) {
                (btn as HTMLElement).click();
                console.log('✓ Clicked Save button via JavaScript');
                return true;
              }
            }
            return false;
          });
          
          if (clicked) {
            console.log('✓ Used JavaScript to click Save button');
            await page.waitForTimeout(1000);
          } else {
            console.log('⚠ Save button not found or not visible');
          }
        }
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
// Delete lesson
//   =====================================

  test('Delete lesson', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(120000);
    
    // Wait for the lesson list to load
    await page.waitForTimeout(2000);
    
    // Get all lesson rows/items
    const lessonRows = page.locator('table tbody tr, [role="row"], .lesson-item, div[class*="lesson"]');    
    // Use index 0
    const indexToDelete = 0;
    const lessonToDelete = lessonRows.nth(indexToDelete);
    
    // Wait for the lesson row to be visible
    if (await lessonToDelete.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Find the delete icon within this specific lesson row
      const deleteIconInRow = lessonToDelete.locator('button').filter({ 
        has: page.locator('svg.lucide-trash, svg.lucide-trash-2') 
      }).first();
      
      // Click the delete icon directly (don't click the lesson row)
      if (await deleteIconInRow.isVisible({ timeout: 3000 }).catch(() => false)) {
        await deleteIconInRow.click();
        await page.waitForTimeout(1000);
        
        // Use the delete helper to handle the confirmation modal
        await deleteItem(page, 'Confirm Delete');
      }
    }   
  });
});
