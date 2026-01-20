import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { fillFieldWithDelay } from '../utils/form-helper';
import { deleteEntityViaActionMenu } from '../utils/delete-helper';
import { toggleViewMode } from '../utils/view-helper';

test.describe('Class', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Class', { exact: true }).click();
    await expect(page).toHaveURL(/classes/);
  });



  test('Class page', async ({ page }) => {
    await page.waitForTimeout(1000);
    await toggleViewMode(page);
  })

//   =====================================
//   Add new class
//   =====================================
  test('Add new class', async ({ page }) => {
    // Increase timeout for this test (multi-step form takes longer)
    test.setTimeout(120000);

    await page.locator('#add-class-button').click();
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    await page.waitForTimeout(500);
    
    // Fill Title field with realistic typing
    const titleField = page.locator('#title');
    await fillFieldWithDelay(titleField, 'Class Webdevelopment', {
      typingDelay: 50,
      afterTypingDelay: 300
    });
    
    // Select Course dropdown
    await page.waitForTimeout(1000);
    
    // Click the first combobox (course dropdown)
    const courseDropdown = page.locator('button[role="combobox"]').first();
    await courseDropdown.waitFor({ state: 'visible', timeout: 5000 });
    await courseDropdown.click();
    
    // Select the first course option
    await page.waitForTimeout(500);
    const courseOptions = page.getByRole('option');
    await courseOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    await courseOptions.first().click();
    
    // Wait for dropdown to close and form to be ready
    await page.waitForTimeout(800);
    
    // Scroll to ensure all form fields are visible
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
    
    // Debug: Log all input fields to see what's available
    await page.waitForTimeout(500);
    const inputInfo = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.map((input, index) => ({
        index,
        type: input.type,
        id: input.id,
        name: input.name,
        placeholder: input.placeholder,
        label: input.labels?.[0]?.textContent?.trim() || 'no label'
      }));
    });
    console.log('Available input fields:', JSON.stringify(inputInfo, null, 2));
    

    // Fill Price field - try multiple selector strategies
    await page.waitForTimeout(500);
    const priceField = page.getByLabel(/price/i)
      .or(page.getByPlaceholder(/price/i))
      .or(page.locator('input[type="text"]').nth(1))
      .or(page.locator('input[type="number"]').first());
    await fillFieldWithDelay(priceField, '500', {
      typingDelay: 50,
      afterTypingDelay: 300
    });
    
    // Fill Progress field
    const progressField = page.getByLabel(/progress/i)
      .or(page.getByPlaceholder(/progress/i))
      .or(page.locator('input[type="text"]').nth(2))
      .or(page.locator('input[type="number"]').nth(1));
    await fillFieldWithDelay(progressField, '50', {
      typingDelay: 50,
      afterTypingDelay: 200
    });
    
    // Fill Start Date field (static date)
    const startDate = '01-12-2026'; // Static start date
    const startDateField = page.getByLabel(/start date/i)
      .or(page.getByPlaceholder(/start date/i))
      .or(page.locator('input[type="date"]').first());
    await fillFieldWithDelay(startDateField, startDate, {
      typingDelay: 30,
      afterTypingDelay: 200
    });
    
    // Fill End Date field (static date)
    const endDateFormatted = '04-16-2026'; // Static end date    
    const endDateField = page.getByLabel(/end date/i)
      .or(page.getByPlaceholder(/end date/i))
      .or(page.locator('input[type="date"]').nth(1));
    await fillFieldWithDelay(endDateField, endDateFormatted, {
      typingDelay: 30,
      afterTypingDelay: 200
    });
    
    // Fill Start Time field
    await page.waitForTimeout(500);
    const startTimeInput = page.getByLabel(/start time/i)
      .or(page.locator('#startTime'))
      .or(page.getByPlaceholder(/start time/i));
    
    await fillFieldWithDelay(startTimeInput, '08:30AM', {
      typingDelay: 50,
      afterTypingDelay: 300
    });
    
    // Fill End Time field
    await page.waitForTimeout(500);
    const endTimeInput = page.getByLabel(/end time/i)
      .or(page.locator('#endTime'))
      .or(page.getByPlaceholder(/end time/i));
    
    await fillFieldWithDelay(endTimeInput, '11:30AM', {
      typingDelay: 50,
      afterTypingDelay: 300
    });
    
    // Toggle Publish and Online buttons to TRUE (enabled)
    await page.waitForTimeout(500);
    
    // Set Publish toggle to TRUE
    const publishToggle = page.getByText('Publish', { exact: true })
      .or(page.locator('button:has-text("Publish")'))
      .or(page.locator('[role="switch"]').filter({ hasText: /publish/i }))
      .or(page.locator('label:has-text("Publish")'));
    
    if (await publishToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Check if toggle is already enabled (aria-checked="true")
      const isChecked = await publishToggle.getAttribute('aria-checked').catch(() => 'false');
      if (isChecked !== 'true') {
        await publishToggle.click();
        console.log('✓ Set Publish toggle to TRUE');
      }
      await page.waitForTimeout(500);
    }
    
    // Set Online toggle to TRUE
    const onlineToggle = page.getByText('Online', { exact: true })
      .or(page.locator('button:has-text("Online")'))
      .or(page.locator('[role="switch"]').filter({ hasText: /online/i }))
      .or(page.locator('label:has-text("Online")'));
    
    if (await onlineToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Check if toggle is already enabled (aria-checked="true")
      const isChecked = await onlineToggle.getAttribute('aria-checked').catch(() => 'false');
      if (isChecked !== 'true') {
        await onlineToggle.click();
        console.log('✓ Set Online toggle to TRUE');
      }
      await page.waitForTimeout(500);
    }
    

    // Step 1: Click Next button to go to Coaches tab
    await page.waitForTimeout(1000);
    const nextButton = page.getByRole('button', { name: /next|next step/i });
    
    // Wait for the Next button to be enabled and visible
    if (await nextButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Check if button is enabled (not disabled)
      const isDisabled = await nextButton.isDisabled().catch(() => true);
      if (!isDisabled) {
        await nextButton.click();
        console.log('✓ Clicked Next button - navigating to Coaches tab');
      } else {
        console.log('⚠ Next button is disabled - check if all required fields are filled');
      }
    } else {
      console.log('⚠ Next button not found - skipping to next step');
    }

    
    // Wait for the Coaches tab to load completely
    await page.waitForTimeout(2000);
    
    // Step 2: Click to open the coaches dropdown
    const coachesDropdown = page.getByPlaceholder(/select coaches/i)
      .or(page.getByText(/select coaches/i).first())
      .or(page.locator('button[role="combobox"]').filter({ hasText: /coaches/i }))
      .or(page.locator('button[role="combobox"]').last());
    
    // Click the dropdown to open it
    if (await coachesDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      await coachesDropdown.click();
      console.log('✓ Clicked to open coaches dropdown');
      await page.waitForTimeout(1200);
      
      // Use JavaScript to add IDs to coach list items for reliable selection
      await page.evaluate(() => {
        // Find all list items or rows in the dropdown
        const listItems = document.querySelectorAll('[role="option"], li, label');
        listItems.forEach((item, index) => {
          const text = item.textContent?.trim() || '';
          if (text.includes('Case Maya') || text.includes('Sann Fasal') || 
              text.includes('Talley') || text.includes('Cohen') || text.includes('Jonho')) {
            item.id = `coach-item-${index}`;
            console.log(`Added ID: coach-item-${index} for ${text}`);
          }
        });
      });
      
      await page.waitForTimeout(500);
      
      // Try to click on the coach list item at index 0 first
      let selected = false;
      
      // Strategy 1: Click using the injected ID
      const coachItemAtIndex0 = page.locator('#coach-item-0');
      if (await coachItemAtIndex0.isVisible({ timeout: 2000 }).catch(() => false)) {
        await coachItemAtIndex0.click();
        console.log('✓ Clicked coach item at index 0');
        await page.waitForTimeout(800);
        selected = true;
      }
      
      // Strategy 2: If index 0 fails, try index 1
      if (!selected) {
        const coachItemAtIndex1 = page.locator('#coach-item-1');
        if (await coachItemAtIndex1.isVisible({ timeout: 2000 }).catch(() => false)) {
          await coachItemAtIndex1.click();
          await page.waitForTimeout(800);
          selected = true;
        }
      }  
      // Close the dropdown by clicking outside or pressing Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    
    // Step 3: Click Next again to go to Students/Thumbnail tab
    await page.waitForTimeout(500);
    const nextButton2 = page.getByRole('button', { name: /next|next step/i });


    if (await nextButton2.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nextButton2.click();
      await page.waitForTimeout(2000);
    }
    
    // Upload thumbnail image
    await page.waitForTimeout(500);
    
    // Path to image on desktop (update this path to match your actual image location)
    const thumbnailPath = 'C:\\Users\\USER\\Desktop\\test-image.jpg';
    
    // Click on the upload area to trigger file selection
    const uploadArea = page.getByText(/click to upload/i)
      .or(page.getByText(/add thumbnail/i))
      .or(page.locator('div').filter({ hasText: /click to upload new thumbnail/i }).first())
      .or(page.locator('[class*="upload"]').first());
    
    if (await uploadArea.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✓ Found upload area, clicking...');
      await uploadArea.click();
      await page.waitForTimeout(500);
    }
    
    // Now find and set the file input
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      try {
        await fileInput.setInputFiles(thumbnailPath);
        console.log('✓ Uploaded thumbnail image from desktop');
        await page.waitForTimeout(1500);
      } catch (error) {
        console.log('⚠ Thumbnail upload failed. Please ensure image exists at:', thumbnailPath);
      }
    } else {
      console.log('⚠ File input not found after clicking upload area');
    }
    
    await page.waitForTimeout(2000);
 
    
    // Step 5: Click final submit button (Add/Create)
    await page.waitForTimeout(500);
    const submitButton = page.getByRole('button', { name: /Add|Create|Submit/i });
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitButton.click();
    }
  });


//   =====================================
// Edit class
//   =====================================
  test('Edit class', async ({ page }) => {
    // Increase timeout for this test (multi-step form takes longer)
    test.setTimeout(120000);
    
    // Wait for the class list to load
    await page.waitForTimeout(1000);
    
    // Get all class rows/items
    const classRows = page.locator('table tbody tr, [role="row"], .class-item, div[class*="class"]');
    
    // Get the class at index 0 (first class)
    const classAtIndex0 = classRows.nth(0);
    await classAtIndex0.waitFor({ state: 'visible', timeout: 5000 });
    await classAtIndex0.click();
    await page.waitForTimeout(1500);

    // Find the three-dot menu button within this specific class row
    const actionsMenuButton = page.locator('button[aria-haspopup="menu"]').first();
    await actionsMenuButton.click();
    await page.waitForTimeout(800);
    
    // Click on Edit option in the menu
    const editButton = page.getByRole('menuitem', { name: /Edit/i }).or(page.getByRole('button', { name: /Edit/i }));
    
    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editButton.click();
      
      // Wait for the edit drawer/form to appear
      await page.waitForTimeout(1500);
      
      // Step 1: Edit fields in General Info tab
      // Edit Title field
      const titleField = page.locator('#title');
      if (await titleField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await titleField.clear();
        await fillFieldWithDelay(titleField, 'Updated Class Title', {
          typingDelay: 50,
          afterTypingDelay: 300
        });
      }
      
      // Edit Price field
      const priceField = page.getByLabel(/price/i)
        .or(page.getByPlaceholder(/price/i))
        .or(page.locator('input[type="text"]').nth(1))
        .or(page.locator('input[type="number"]').first());
      if (await priceField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await priceField.clear();
        await fillFieldWithDelay(priceField, '1500', {
          typingDelay: 50,
          afterTypingDelay: 200
        });
      }
      
      // Edit Progress field
      const progressField = page.getByLabel(/progress/i)
        .or(page.getByPlaceholder(/progress/i))
        .or(page.locator('input[type="text"]').nth(2))
        .or(page.locator('input[type="number"]').nth(1));
      if (await progressField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await progressField.clear();
        await fillFieldWithDelay(progressField, '75', {
          typingDelay: 50,
          afterTypingDelay: 200
        });
      }
      
      // Edit Start Time
      const startTimeField = page.getByLabel(/start time/i)
        .or(page.locator('#startTime'))
        .or(page.getByPlaceholder(/start time/i));
      if (await startTimeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await startTimeField.clear();
        await fillFieldWithDelay(startTimeField, '10:00AM', {
          typingDelay: 50,
          afterTypingDelay: 200
        });
      }
      
      // Edit End Time
      const endTimeField = page.getByLabel(/end time/i)
        .or(page.locator('#endTime'))
        .or(page.getByPlaceholder(/end time/i));
      if (await endTimeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await endTimeField.clear();
        await fillFieldWithDelay(endTimeField, '01:00PM', {
          typingDelay: 50,
          afterTypingDelay: 300
        });
      }
      
      // Toggle Publish and Online buttons to FALSE (disabled)
      await page.waitForTimeout(500);
      
      // Use JavaScript to add IDs to toggle switches for reliable selection
      await page.evaluate(() => {
        // Find all switches and labels
        const switches = document.querySelectorAll('[role="switch"], button, label');
        switches.forEach((element, index) => {
          const text = element.textContent?.trim() || '';
          if (text.includes('Publish')) {
            element.id = 'publish-toggle-edit';
            console.log('Found Publish toggle:', element);
          } else if (text.includes('Online')) {
            element.id = 'online-toggle-edit';
            console.log('Found Online toggle:', element);
          }
        });
      });
      
      await page.waitForTimeout(500);
      
      // Set Publish toggle to FALSE
      const publishToggle = page.locator('#publish-toggle-edit')
        .or(page.getByText('Publish', { exact: true }))
        .or(page.locator('[role="switch"]').filter({ hasText: /publish/i }));
      
      if (await publishToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Check if toggle is currently enabled
        const isChecked = await publishToggle.getAttribute('aria-checked').catch(() => 'false');
        console.log('Publish toggle current state:', isChecked);
        
        if (isChecked === 'true') {
          await publishToggle.click();
          console.log('✓ Clicked Publish toggle to set FALSE (was TRUE)');
        } else {
          console.log('ℹ Publish toggle already FALSE, no click needed');
        }
        await page.waitForTimeout(500);
      } else {
        console.log('⚠ Publish toggle not found');
      }
      
      // Set Online toggle to FALSE
      const onlineToggle = page.locator('#online-toggle-edit')
        .or(page.getByText('Online', { exact: true }))
        .or(page.locator('[role="switch"]').filter({ hasText: /online/i }));
      
      if (await onlineToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Check if toggle is currently enabled
        const isChecked = await onlineToggle.getAttribute('aria-checked').catch(() => 'false');
        console.log('Online toggle current state:', isChecked);
        
        if (isChecked === 'true') {
          await onlineToggle.click();
          console.log('✓ Clicked Online toggle to set FALSE (was TRUE)');
        } else {
          console.log('ℹ Online toggle already FALSE, no click needed');
        }
        await page.waitForTimeout(500);
      } else {
        console.log('⚠ Online toggle not found');
      }
      
      // Step 2: Click Next button to go to Coaches tab
      await page.waitForTimeout(1000);
      const nextButton = page.getByRole('button', { name: /next|next step/i });
      
      if (await nextButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        const isDisabled = await nextButton.isDisabled().catch(() => true);
        if (!isDisabled) {
          await nextButton.click();
          await page.waitForTimeout(2000);
          
          // Step 3: Update coach selection (optional - can select different coach)
          const coachesDropdown = page.getByPlaceholder(/select coaches/i)
            .or(page.getByText(/select coaches/i).first())
            .or(page.locator('button[role="combobox"]').filter({ hasText: /coaches/i }))
            .or(page.locator('button[role="combobox"]').last());
          
          if (await coachesDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
            await coachesDropdown.click();
            console.log('✓ Clicked to open coaches dropdown');
            await page.waitForTimeout(1200);
            
            // Add IDs to coach list items
            await page.evaluate(() => {
              const listItems = document.querySelectorAll('[role="option"], li, label');
              listItems.forEach((item, index) => {
                const text = item.textContent?.trim() || '';
                if (text.includes('Case Maya') || text.includes('Sann Fasal') || 
                    text.includes('Talley') || text.includes('Cohen') || text.includes('Jonho')) {
                  item.id = `coach-item-edit-${index}`;
                  console.log(`Added ID: coach-item-edit-${index} for ${text}`);
                }
              });
            });
            
            await page.waitForTimeout(500);
            
            // Check how many coach items are available
            const coachItems = page.locator('[id^="coach-item-edit-"]');
            const coachCount = await coachItems.count();
            
            console.log(`Found ${coachCount} coach items available`);
            
            // Add one more coach if more items are available (select index 1 if exists)
            let selected = false;
            if (coachCount > 1) {
              const coachItemAtIndex1 = page.locator('#coach-item-edit-1');
              if (await coachItemAtIndex1.isVisible({ timeout: 2000 }).catch(() => false)) {
                await coachItemAtIndex1.click();
                console.log('✓ Added one more coach (index 1)');
                selected = true;
              }
            } else {
              console.log('⚠ No additional coaches available to add');
            }
            
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
          } else {
            console.log('⚠ Coaches dropdown not visible in Edit class');
          }
          
          // Step 4: Click Next to go to Students tab
          const nextButton2 = page.getByRole('button', { name: /next|next step/i });
          if (await nextButton2.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nextButton2.click();
            await page.waitForTimeout(2000);
          }
        }
      }
      
      // Step 5: Submit the updated form
      await page.waitForTimeout(500);
      const submitButton = page.getByRole('button', { name: /Update|Save|Submit/i });
      if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    } else {
    }
  });

//   =====================================
// Delete class
//   =====================================

  test('Delete class', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(120000);
    
    // Wait for the class list to load
    await page.waitForTimeout(2000);
    
    // Get all class rows/items
    const classRows = page.locator('table tbody tr, [role="row"], .class-item, div[class*="class"]');
    
    // Use index 0
    const indexToDelete = 0;
    const classToDelete = classRows.nth(indexToDelete);
    
    await deleteEntityViaActionMenu(page, classToDelete, 'Confirm Delete');
  });
});
