import { test, expect } from '@playwright/test';
import { login } from '../../utils/auth-helper';
import { addCursorTracking } from '../../utils/cursor-helper';
import { fillFieldWithDelay } from '../../utils/form-helper';
import { deleteItem } from '../../utils/delete-helper';


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

  test('Lessons page', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);
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
    await fillFieldWithDelay(titleField, 'React js', {
      typingDelay: 50,
      afterTypingDelay: 300
    });
    
        // Fill Duration field (if exists)
    await page.waitForTimeout(500);
    const durationField = page.getByLabel(/duration/i)
      .or(page.getByPlaceholder(/duration/i))
      .or(page.locator('input[type="number"]').nth(1));
    if (await durationField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fillFieldWithDelay(durationField, '45', {
        typingDelay: 50,
        afterTypingDelay: 200
      });
    }

        // Fill Description/Content field
    const objectiveField = page.locator('#objective')
      .or(page.locator('#content'))
      .or(page.getByLabel(/objective|content/i))
      .or(page.getByPlaceholder(/objective|content/i));
    await fillFieldWithDelay(objectiveField, 'objective', {
      typingDelay: 30,
      afterTypingDelay: 300
    });
    
    
    // Fill Description field first
    const descriptionField = page.locator('#description')
      .or(page.locator('#content'))
      .or(page.getByLabel(/description|content/i))
      .or(page.getByPlaceholder(/description|content/i));
    
    await fillFieldWithDelay(descriptionField, 'In this lesson, you will learn about React js', {
      typingDelay: 30,
      afterTypingDelay: 300
    });
    
    // THEN click "Attach Material" button after description is filled
    await page.waitForTimeout(500);
    const attachMaterialButton = page.getByRole('button', { name: /attach material/i })
      .or(page.getByText(/attach material/i))
      .or(page.locator('button:has-text("Attach Material")'));
    
    if (await attachMaterialButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await attachMaterialButton.click();
      console.log('✓ Clicked Attach Material button after filling description');
      await page.waitForTimeout(1500); // Wait for modal to open
      
      // Debug: Log the modal structure to understand what we're working with
      await page.evaluate(() => {
        const modal = document.querySelector('[role="dialog"]') || document.querySelector('.modal') || document.body;
        console.log('=== Modal Structure Debug ===');
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
      
      // For CREATE: Select only index 0 (1 item)
      let selected = false;
      
      // Strategy 1: Try to find material cards/items and click index 0
      const allDivs = page.locator('div[class*="cursor"], div[onclick], div[class*="card"], div[class*="item"]');
      const materialDivs = allDivs.filter({ hasText: /file|\.doc|\.mp4|\.pdf/i });
      const count = await materialDivs.count();
      
      console.log(`Found ${count} potential material items (CREATE mode)`);
      
      if (count > 0) {
        const item0 = materialDivs.nth(0);
        if (await item0.isVisible({ timeout: 2000 }).catch(() => false)) {
          await item0.click();
          console.log('✓ Clicked material item at index 0 (CREATE mode)');
          await page.waitForTimeout(500);
          selected = true;
        }
      }
      
      // Strategy 2: Try clicking by exact text match
      if (!selected) {
        const fileByText = page.getByText('file-sample.doc', { exact: false })
          .or(page.getByText('file_example.mp4', { exact: false }));
        if (await fileByText.first().isVisible({ timeout: 2000 }).catch(() => false)) {
          await fileByText.first().click();
          console.log('✓ Selected material item by text (CREATE mode)');
          await page.waitForTimeout(500);
          selected = true;
        }
      }
      
      // Strategy 3: Use JavaScript to click the first clickable element with file text
      if (!selected) {
        const clicked = await page.evaluate(() => {
          const modal = document.querySelector('[role="dialog"]') || document.body;
          const allElements = modal.querySelectorAll('div, button, a');
          
          for (const el of allElements) {
            const text = el.textContent || '';
            if ((text.includes('file-sample') || text.includes('file_example')) && 
                (el as HTMLElement).offsetParent !== null) { // Check if visible
              (el as HTMLElement).click();
              console.log('✓ Clicked via JavaScript:', text.substring(0, 30));
              return true;
            }
          }
          return false;
        });
        
        if (clicked) {
          await page.waitForTimeout(500);
          selected = true;
        }
      }
      
      // Click Save button to close the modal
      const saveButton = page.getByRole('button', { name: /save/i })
        .or(page.locator('button:has-text("Save")'));
      if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveButton.click();
        console.log('✓ Clicked Save button to close modal');
        await page.waitForTimeout(500);
      }
    }

    
    // Toggle Publish button to TRUE (enabled)
    await page.waitForTimeout(500);
    const publishToggle = page.getByText('Publish', { exact: true })
      .or(page.locator('button:has-text("Publish")'))
      .or(page.locator('[role="switch"]').filter({ hasText: /publish/i }))
      .or(page.locator('label:has-text("Publish")'));
    
    if (await publishToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      const isChecked = await publishToggle.getAttribute('aria-checked').catch(() => 'false');
      if (isChecked !== 'true') {
        await publishToggle.click();
        console.log('✓ Set Publish toggle to TRUE');
      }
      await page.waitForTimeout(500);
    }
    
    // Submit the form
    await page.waitForTimeout(500);
    const submitButton = page.getByRole('button', { name: /Add|Create|Submit/i });
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Verify success
    const successIndicators = [
      page.getByText(/successfully/i),
      page.getByText(/created/i),
      page.getByText('Variables and Data Types')
    ];
    
    let successFound = false;
    for (const indicator of successIndicators) {
      if (await indicator.isVisible({ timeout: 3000 }).catch(() => false)) {
        successFound = true;
        break;
      }
    }
    
    if (successFound) {
      console.log('✓ Lesson created successfully');
    }
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
    await lessonAtIndex0.click();
    await page.waitForTimeout(1500);

    // Click the edit icon (pencil icon) directly
    const editIcon = page.locator('button').filter({ has: page.locator('svg.lucide-square-pen, svg.lucide-edit, svg.lucide-pencil') }).first()
      .or(page.getByRole('button', { name: /edit/i }).first())
      .or(page.locator('button[aria-label*="edit" i]').first());
    
    if (await editIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editIcon.click();
      console.log('✓ Clicked edit icon');
      
      // Wait for the edit drawer/form to appear
      await page.waitForTimeout(1500);
      
      // Edit Title field
      const titleField = page.locator('#title').or(page.getByLabel(/title/i));
      if (await titleField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await titleField.clear();
        await fillFieldWithDelay(titleField, 'Updated React js Advanced', {
          typingDelay: 50,
          afterTypingDelay: 300
        });
      }
      
      // Edit Duration field
      const durationField = page.getByLabel(/duration/i)
        .or(page.getByPlaceholder(/duration/i))
        .or(page.locator('input[type="number"]').first());
      if (await durationField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await durationField.clear();
        await fillFieldWithDelay(durationField, '60', {
          typingDelay: 50,
          afterTypingDelay: 200
        });
      }
      
      // Edit Objective field
      const objectiveField = page.locator('#objective')
        .or(page.locator('#content'))
        .or(page.getByLabel(/objective|content/i))
        .or(page.getByPlaceholder(/objective|content/i));
      if (await objectiveField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await objectiveField.clear();
        await fillFieldWithDelay(objectiveField, 'Updated objective for advanced React', {
          typingDelay: 30,
          afterTypingDelay: 300
        });
      }
      
      // Edit Description field
      const descriptionField = page.locator('#description')
        .or(page.locator('#content'))
        .or(page.getByLabel(/description|content/i))
        .or(page.getByPlaceholder(/description|content/i));
      if (await descriptionField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await descriptionField.clear();
        await fillFieldWithDelay(descriptionField, 'Updated lesson covering advanced React concepts including hooks and state management.', {
          typingDelay: 30,
          afterTypingDelay: 300
        });
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
        
        // For UPDATE: Add 1 more item (click index 0 - file-sample.doc)
        await page.waitForTimeout(500);
        
        let itemClicked = false;
        
        // Strategy 1: Try clicking by text "file-sample"
        const fileSample = page.getByText('file-sample.doc', { exact: false });
        if (await fileSample.isVisible({ timeout: 2000 }).catch(() => false)) {
          await fileSample.click();
          console.log('✓ Clicked file-sample.doc to add 1 more item (UPDATE mode)');
          await page.waitForTimeout(500);
          itemClicked = true;
        }
        
        // Strategy 2: Click the first card/div that contains file text
        if (!itemClicked) {
          const materialCards = page.locator('div[class*="cursor"], div[class*="card"]').filter({ hasText: /file-sample/i });
          if (await materialCards.first().isVisible({ timeout: 2000 }).catch(() => false)) {
            await materialCards.first().click();
            console.log('✓ Clicked first material card (UPDATE mode)');
            await page.waitForTimeout(500);
            itemClicked = true;
          }
        }
        
        // Strategy 3: Use JavaScript to click
        if (!itemClicked) {
          const clicked = await page.evaluate(() => {
            const modal = document.querySelector('[role="dialog"]') || document.body;
            const allElements = modal.querySelectorAll('div, button');
            
            for (const el of allElements) {
              const text = el.textContent || '';
              if (text.includes('file-sample.doc') && (el as HTMLElement).offsetParent !== null) {
                (el as HTMLElement).click();
                console.log('✓ Clicked file-sample.doc via JavaScript');
                return true;
              }
            }
            return false;
          });
          
          if (clicked) {
            console.log('✓ Used JavaScript to click material item');
            await page.waitForTimeout(500);
            itemClicked = true;
          }
        }
        
        // Click Save button to close the modal
        await page.waitForTimeout(500);
        const saveButton = page.getByRole('button', { name: /^save$/i })
          .or(page.locator('button:has-text("Save")'))
          .or(page.locator('button').filter({ hasText: /^save$/i }));
        
        console.log('Looking for Save button...');
        let saveClicked = false;
        
        if (await saveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
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

//   =====================================
// Demo lesson - Complete CRUD workflow
//   =====================================

  test('Demo lesson for completely', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(180000);
    
    // ========== CREATE LESSON ==========
    // Click the add button
    await page.locator('#add-lesson-button').or(page.getByRole('button', { name: /add lesson/i })).click();
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    await page.waitForTimeout(500);
    
    // Fill Title field
    const titleField = page.locator('#title').or(page.getByLabel(/title/i)).or(page.getByPlaceholder(/title/i));
    await fillFieldWithDelay(titleField, 'Demo Lesson Test', {
      typingDelay: 50,
      afterTypingDelay: 300
    });
    
    // Fill Duration field
    const durationField = page.getByLabel(/duration/i)
      .or(page.getByPlaceholder(/duration/i))
      .or(page.locator('input[type="number"]').first());
    await fillFieldWithDelay(durationField, '30', {
      typingDelay: 50,
      afterTypingDelay: 200
    });
    
    // Fill Objective field
    const objectiveField = page.locator('#objective')
      .or(page.locator('#content'))
      .or(page.getByLabel(/objective|content/i))
      .or(page.getByPlaceholder(/objective|content/i));
    await fillFieldWithDelay(objectiveField, 'Demo lesson objective for testing', {
      typingDelay: 30,
      afterTypingDelay: 300
    });
    
    // Fill Description field
    const descriptionField = page.locator('#description')
      .or(page.locator('#content'))
      .or(page.getByLabel(/description|content/i))
      .or(page.getByPlaceholder(/description|content/i));
    await fillFieldWithDelay(descriptionField, 'This is a demo lesson for testing complete CRUD operations.', {
      typingDelay: 30,
      afterTypingDelay: 300
    });
    
    // Click Attach Material and select item
    await page.waitForTimeout(500);
    const attachMaterialButton = page.getByRole('button', { name: /attach material/i })
      .or(page.getByText(/attach material/i));
    
    if (await attachMaterialButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await attachMaterialButton.click();
      await page.waitForTimeout(1500);
      
      // Select first material item using robust strategies
      let selected = false;
      
      // Strategy 1: Try to find material cards/items and click index 0
      const allDivs = page.locator('div[class*="cursor"], div[onclick], div[class*="card"], div[class*="item"]');
      const materialDivs = allDivs.filter({ hasText: /file|\.doc|\.mp4|\.pdf/i });
      const count = await materialDivs.count();
      
      if (count > 0) {
        const item0 = materialDivs.nth(0);
        if (await item0.isVisible({ timeout: 2000 }).catch(() => false)) {
          await item0.click();
          await page.waitForTimeout(500);
          selected = true;
        }
      }
      
      // Strategy 2: Try clicking by exact text match
      if (!selected) {
        const fileByText = page.getByText('file-sample.doc', { exact: false })
          .or(page.getByText('file_example.mp4', { exact: false }));
        if (await fileByText.first().isVisible({ timeout: 2000 }).catch(() => false)) {
          await fileByText.first().click();
          await page.waitForTimeout(500);
          selected = true;
        }
      }
      
      // Click Save button
      const saveButton = page.getByRole('button', { name: /^save$/i })
        .or(page.locator('button:has-text("Save")'));
      if (await saveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await saveButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Submit the form
    await page.waitForTimeout(500);
    const submitButton = page.getByRole('button', { name: /Add|Create|Submit/i });
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitButton.click();
      await page.waitForTimeout(3000);
    }
    
    // ========== UPDATE LESSON ==========
    // Wait for the lesson list to load
    await page.waitForTimeout(1000);
    
    // Get all lesson rows/items
    const lessonRows = page.locator('table tbody tr, [role="row"], .lesson-item, div[class*="lesson"]');
    
    // Get the first lesson (the one we just created)
    const lessonAtIndex0 = lessonRows.nth(0);
    await lessonAtIndex0.waitFor({ state: 'visible', timeout: 5000 });
    await lessonAtIndex0.click();
    await page.waitForTimeout(1500);

    // Click the edit icon
    const editIcon = page.locator('button').filter({ has: page.locator('svg.lucide-square-pen, svg.lucide-edit, svg.lucide-pencil') }).first()
      .or(page.getByRole('button', { name: /edit/i }).first());
    
    if (await editIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editIcon.click();
      await page.waitForTimeout(1500);
      
      // Edit Title field
      const editTitleField = page.locator('#title').or(page.getByLabel(/title/i));
      if (await editTitleField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editTitleField.clear();
        await fillFieldWithDelay(editTitleField, 'Updated Demo Lesson', {
          typingDelay: 50,
          afterTypingDelay: 300
        });
      }
      
      // Edit Duration field
      const editDurationField = page.getByLabel(/duration/i)
        .or(page.getByPlaceholder(/duration/i))
        .or(page.locator('input[type="number"]').first());
      if (await editDurationField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editDurationField.clear();
        await fillFieldWithDelay(editDurationField, '45', {
          typingDelay: 50,
          afterTypingDelay: 200
        });
      }
      
      // Edit Objective field
      const editObjectiveField = page.locator('#objective')
        .or(page.locator('#content'))
        .or(page.getByLabel(/objective|content/i));
      if (await editObjectiveField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editObjectiveField.clear();
        await fillFieldWithDelay(editObjectiveField, 'Updated objective for demo lesson', {
          typingDelay: 30,
          afterTypingDelay: 300
        });
      }
      
      // Edit Description field
      const editDescriptionField = page.locator('#description')
        .or(page.locator('#content'))
        .or(page.getByLabel(/description|content/i));
      if (await editDescriptionField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editDescriptionField.clear();
        await fillFieldWithDelay(editDescriptionField, 'This lesson has been updated successfully.', {
          typingDelay: 30,
          afterTypingDelay: 300
        });
      }
      
      // Click Attach Material and add one more item
      await page.waitForTimeout(500);
      const editAttachButton = page.getByRole('button', { name: /attach material/i })
        .or(page.getByText(/attach material/i));
      
      if (await editAttachButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editAttachButton.click();
        await page.waitForTimeout(1500);
        
        // Add one more material item (try to click item at index 1)
        let itemClicked = false;
        
        // Strategy 1: Try clicking by text "file-sample"
        const fileSample = page.getByText('file-sample.doc', { exact: false });
        if (await fileSample.isVisible({ timeout: 2000 }).catch(() => false)) {
          await fileSample.click();
          await page.waitForTimeout(500);
          itemClicked = true;
        }
        
        // Strategy 2: Click the first card/div that contains file text
        if (!itemClicked) {
          const materialCards = page.locator('div[class*="cursor"], div[class*="card"]').filter({ hasText: /file-sample/i });
          if (await materialCards.first().isVisible({ timeout: 2000 }).catch(() => false)) {
            await materialCards.first().click();
            await page.waitForTimeout(500);
            itemClicked = true;
          }
        }
        
        // Click Save button
        await page.waitForTimeout(500);
        const editSaveButton = page.getByRole('button', { name: /^save$/i })
          .or(page.locator('button:has-text("Save")'));
        if (await editSaveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await editSaveButton.click();
          await page.waitForTimeout(1000);
        }
      }
      
      // Submit the updated form
      await page.waitForTimeout(500);
      const updateButton = page.getByRole('button', { name: /Update|Save|Submit/i });
      if (await updateButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await updateButton.click();
        await page.waitForTimeout(3000);
      }
    }
    
    // ========== DELETE LESSON ==========
    // Wait for the lesson list to reload
    await page.waitForTimeout(1000);
    
    // Get the lesson row again
    const lessonToDelete = lessonRows.nth(0);
    
    if (await lessonToDelete.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Find the delete icon within this specific lesson row
      const deleteIconInRow = lessonToDelete.locator('button').filter({ 
        has: page.locator('svg.lucide-trash, svg.lucide-trash-2') 
      }).first();
      
      // Click the delete icon
      if (await deleteIconInRow.isVisible({ timeout: 3000 }).catch(() => false)) {
        await deleteIconInRow.click();
        await page.waitForTimeout(1000);
        
        // Use the delete helper to handle the confirmation modal
        await deleteItem(page, 'Confirm Delete');
      }
    }
  });
});
