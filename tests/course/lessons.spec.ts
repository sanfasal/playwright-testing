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
    await fillFieldWithDelay(titleField, 'React js');
    
        // Fill Duration field (if exists)
    await page.waitForTimeout(500);
    const durationField = page.getByLabel(/duration/i)
      .or(page.getByPlaceholder(/duration/i))
      .or(page.locator('input[type="number"]').nth(1));
    if (await durationField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fillFieldWithDelay(durationField, '45');
    }

        // Fill Description/Content field
    const objectiveField = page.locator('#objective')
      .or(page.locator('#content'))
      .or(page.getByLabel(/objective|content/i))
      .or(page.getByPlaceholder(/objective|content/i));
    await fillFieldWithDelay(objectiveField, 'objective');
    
    
    // Fill Description field first
    const descriptionField = page.locator('#description')
      .or(page.locator('#content'))
      .or(page.getByLabel(/description|content/i))
      .or(page.getByPlaceholder(/description|content/i));
    
    await fillFieldWithDelay(descriptionField, 'In this lesson, you will learn about React js');
    
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
      
      // Select material:
      // The grid contains [Add Button (Index 0), Material Card (Index 1), Material Card (Index 2)...]
      // We want to click "Index 1" of the grid, which is the FIRST material card.
      
      console.log('Using data-slot="card" selector to find materials...');
      const materialCards = page.locator('div[data-slot="card"]');
      const cardCount = await materialCards.count();
      console.log(`Debug: Found ${cardCount} material cards`);

      let selected = false;
      
      if (cardCount > 0) {
          // Click the first card (closest to the Add button)
          const firstCard = materialCards.nth(0); 
          if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
              await firstCard.click();
              selected = true;
              console.log('✓ Success: Clicked first material card (Grid Index 1)');
              await page.waitForTimeout(500); 
          }
      }
    
      if (!selected && cardCount > 1) {
           await materialCards.nth(1).click();
           selected = true;
           console.log('✓ Fallback: Clicked second material card');
           await page.waitForTimeout(500);
      }
      
      // Click Save button with visible cursor movement
      const saveButton = page.getByRole('button', { name: /Save|save/i })
        .or(page.locator('button:has-text("Save")'));
      
      if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Move mouse to button to show cursor
        const box = await saveButton.boundingBox();
        if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.waitForTimeout(500); // Wait for user to see cursor
        }
        await saveButton.click();
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
        await fillFieldWithDelay(titleField, 'Updated React js Advanced');
      }
      
      // Edit Duration field
      const durationField = page.getByLabel(/duration/i)
        .or(page.getByPlaceholder(/duration/i))
        .or(page.locator('input[type="number"]').first());
      if (await durationField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await durationField.clear();
        await fillFieldWithDelay(durationField, '60');
      }
      
      // Edit Objective field
      const objectiveField = page.locator('#objective')
        .or(page.locator('#content'))
        .or(page.getByLabel(/objective|content/i))
        .or(page.getByPlaceholder(/objective|content/i));
      if (await objectiveField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await objectiveField.clear();
        await fillFieldWithDelay(objectiveField, 'Updated objective for advanced React');
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
        
        // For UPDATE: "Check if has more item click add one more"
        // We assume "more item" means a second material card (index 1) is available.
        // If only 1 card exists (index 0), it's likely already selected, so we skip clicking it to avoid deselection.
        
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
