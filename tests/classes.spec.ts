import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { FileInput } from '../utils/form-helper';
import { deleteEntityViaActionMenu } from '../utils/delete-helper';
import { toggleViewMode } from '../utils/view-helper';
import { uploadThumbnail } from '../utils/upload-thumbnail-helper';

test.describe('Class', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Class', { exact: true }).click();
    await expect(page).toHaveURL(/classes/);
  });

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
    await FileInput(titleField, 'Class Webdevelopment');
    
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
    
    

    // Fill Price field - try multiple selector strategies
    await page.waitForTimeout(500);
    const priceField = page.getByLabel(/price/i)
      .or(page.getByPlaceholder(/price/i))
      .or(page.locator('input[type="text"]').nth(1))
      .or(page.locator('input[type="number"]').first());
    await FileInput(priceField, '500');
    
    // Fill Progress field
    const progressField = page.getByLabel(/progress/i)
      .or(page.getByPlaceholder(/progress/i))
      .or(page.locator('input[type="text"]').nth(2))
      .or(page.locator('input[type="number"]').nth(1));
    await FileInput(progressField, '50');
    
    // Fill Start Date field (static date)
    const startDate = '01-12-2026'; // Static start date
    const startDateField = page.getByLabel(/start date/i)
      .or(page.getByPlaceholder(/start date/i))
      .or(page.locator('input[type="date"]').first());
    await FileInput(startDateField, startDate);
    
    // Fill End Date field (static date)
    const endDateFormatted = '04-16-2026'; // Static end date    
    const endDateField = page.getByLabel(/end date/i)
      .or(page.getByPlaceholder(/end date/i))
      .or(page.locator('input[type="date"]').nth(1));
    await FileInput(endDateField, endDateFormatted);
    
    // Fill Start Time field
    await page.waitForTimeout(500);
    const startTimeInput = page.getByLabel(/start time/i)
      .or(page.locator('#startTime'))
      .or(page.getByPlaceholder(/start time/i));
    
    await FileInput(startTimeInput, '08:30AM');
    
    // Fill End Time field
    await page.waitForTimeout(500);
    const endTimeInput = page.getByLabel(/end time/i)
      .or(page.locator('#endTime'))
      .or(page.getByPlaceholder(/end time/i));
    
    await FileInput(endTimeInput, '11:30AM');
    
    // Toggle Publish and Online buttons to TRUE (enabled)
    await page.waitForTimeout(500);

        await uploadThumbnail(page, "Click to upload new thumbnail");
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
      }
      await page.waitForTimeout(500);
    }
    

    // Step 1: Click Next button to go to Coaches tab
    await page.waitForTimeout(1000);
    const nextButton = page.getByRole('button', { name: /next|next step/i });
    
    // Wait for the Next button to be enabled and visible
    if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Check if button is enabled (not disabled)
      const isDisabled = await nextButton.isDisabled().catch(() => true);
      if (!isDisabled) {
        await nextButton.click();
      } else {
      }
    }

    
    // Wait for the Coaches tab to load completely
    await page.waitForTimeout(2000);
    
    // Step 2: Click to open the coaches dropdown
    const coachesDropdown = page.getByPlaceholder(/select coaches/i)
      .or(page.getByText(/select coaches/i).first())
      .or(page.locator('button[role="combobox"]').filter({ hasText: /coaches/i }))
      .or(page.locator('button[role="combobox"]').last());
    
    // Click the dropdown to open it
    if (await coachesDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await coachesDropdown.click();
      await page.waitForTimeout(1200);
      
      // Click on the first coach option (index 0)
      await page.waitForTimeout(500);
      
      // Select the first coach from the dropdown
      const coachOptions = page.locator('[role="option"], li label, .coach-item, [class*="option"]');
      const firstCoach = coachOptions.nth(0);
      
      if (await firstCoach.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstCoach.click();
        await page.waitForTimeout(800);
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
       
    // Step 5: Click final submit button (Add/Create)
    await page.waitForTimeout(500);
    const submitButton = page.getByRole('button', { name: /Add|Create|Submit/i });
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitButton.click();
    }
  });

//   =====================================
//   Class page
//   =====================================
    test('Class List', async ({ page }) => {
    await page.waitForTimeout(1000);
    await toggleViewMode(page);
  })


//   =====================================
// Edit class
//   =====================================
  test('Edit class', async ({ page }) => {
    // Increase timeout for this test (multi-step form takes longer)
    test.setTimeout(120000);
    
    // Wait for the class list to load
    await page.waitForTimeout(1000);
    const classRows = page.locator('table tbody tr, [role="row"], .class-item, div[class*="class"]');
    
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
        await FileInput(titleField, 'Updated Class Title');
      }

       
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
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
      
      // Edit Price field
      const priceField = page.getByLabel(/price/i)
        .or(page.getByPlaceholder(/price/i))
        .or(page.locator('input[type="text"]').nth(1))
        .or(page.locator('input[type="number"]').first());
      if (await priceField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await priceField.clear();
        await FileInput(priceField, '1500');
      }
      
      // Edit Progress field
      const progressField = page.getByLabel(/progress/i)
        .or(page.getByPlaceholder(/progress/i))
        .or(page.locator('input[type="text"]').nth(2))
        .or(page.locator('input[type="number"]').nth(1));
      if (await progressField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await progressField.clear();
        await FileInput(progressField, '75');
      }

          // Fill Start Date field (static date)
    const startDate = '01-12-2026'; // Static start date
    const startDateField = page.getByLabel(/start date/i)
      .or(page.getByPlaceholder(/start date/i))
      .or(page.locator('input[type="date"]').first());
    await FileInput(startDateField, startDate);
    
    // Fill End Date field (static date)
    const endDateFormatted = '04-16-2026'; // Static end date    
    const endDateField = page.getByLabel(/end date/i)
      .or(page.getByPlaceholder(/end date/i))
      .or(page.locator('input[type="date"]').nth(1));
    await FileInput(endDateField, endDateFormatted);
    
      
      // Edit Start Time
      const startTimeField = page.getByLabel(/start time/i)
        .or(page.locator('#startTime'))
        .or(page.getByPlaceholder(/start time/i));
      if (await startTimeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await startTimeField.clear();
        await FileInput(startTimeField, '10:00AM', );
      }
      
      // Edit End Time
      const endTimeField = page.getByLabel(/end time/i)
        .or(page.locator('#endTime'))
        .or(page.getByPlaceholder(/end time/i));
      if (await endTimeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await endTimeField.clear();
        await FileInput(endTimeField, '01:00PM');
      }
      
      await page.waitForTimeout(500);
      
      // Step 2: Click Next button to go to Coaches tab
      await page.waitForTimeout(1000);
      const nextButton = page.getByRole('button', { name: /next|next step/i });
      await nextButton.scrollIntoViewIfNeeded();
      
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
              // Add IDs to items at index 0 and 1
              if (listItems[0]) listItems[0].id = 'coach-item-edit-0';
              if (listItems[1]) listItems[1].id = 'coach-item-edit-1';
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
