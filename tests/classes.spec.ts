import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { FileInput } from '../utils/form-helper';
import { deleteEntityViaActionMenu } from '../utils/delete-helper';
import { toggleViewMode } from '../utils/view-helper';
import { uploadThumbnail } from '../utils/upload-thumbnail-helper';
import staticData from '../constant/static-data.json';
import path from 'path';

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
    // Extract test data from static data
    const { title, price, progress, startDate, endDate, startTime, endTime } = staticData.classDataAdd;
    
    await page.locator('#add-class-button').click();
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible();
    await page.waitForTimeout(500);
    
    // Fill Title field with realistic typing
    const titleField = page.locator('#title');
    await FileInput(titleField, title);
    
    // Click the first combobox (course dropdown)
    const courseDropdown = page.locator('button[role="combobox"]').first();
    await courseDropdown.waitFor({ state: 'visible' });
    await courseDropdown.click();
    
    // Select the first course option
    await page.waitForTimeout(500);
    const courseOptions = page.getByRole('option');
    await courseOptions.first().waitFor({ state: 'visible' });
    await courseOptions.first().click();
    
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
    await FileInput(priceField, price);
    
    // Fill Progress field
    const progressField = page.getByLabel(/progress/i)
      .or(page.getByPlaceholder(/progress/i))
      .or(page.locator('input[type="text"]').nth(2))
      .or(page.locator('input[type="number"]').nth(1));
    await FileInput(progressField, progress);
    
    // Fill Start Date field (static date)
    const startDateField = page.getByLabel(/start date/i)
      .or(page.getByPlaceholder(/start date/i))
      .or(page.locator('input[type="date"]').first());
    await FileInput(startDateField, startDate);
    
    // Fill End Date field (static date)
    const endDateField = page.getByLabel(/end date/i)
      .or(page.getByPlaceholder(/end date/i))
      .or(page.locator('input[type="date"]').nth(1));
    await FileInput(endDateField, endDate);
    
    // Fill Start Time field
    await page.waitForTimeout(500);
    const startTimeInput = page.getByLabel(/start time/i)
      .or(page.locator('#startTime'))
      .or(page.getByPlaceholder(/start time/i));
    
    await FileInput(startTimeInput, startTime);
    
    const endTimeInput = page.getByLabel(/end time/i)
      .or(page.locator('#endTime'))
      .or(page.getByPlaceholder(/end time/i));
    
    await FileInput(endTimeInput, endTime);

    await uploadThumbnail(page, "file-input");

    // Set Publish toggle to TRUE
    await page.locator('#isPublish')
      .or(page.locator('[role="switch"]').filter({ hasText: /publish/i })).click();
    
    await page.waitForTimeout(1000);

    // Set Online toggle to TRUE
    await page.locator('#isOnline')
      .or(page.locator('[role="switch"]').filter({ hasText: /online/i })).click();

    await page.waitForTimeout(1000);
    
    const nextButton = page.getByRole('button', { name: /next|next step/i });
    await page.waitForTimeout(500);
    
    // Wait for the Next button to be enabled and visible
    if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Check if button is enabled (not disabled)
      const isDisabled = await nextButton.isDisabled().catch(() => true);
      if (!isDisabled) {
        await nextButton.click();
      } else {
      }
    }
    
    // Step 2: Click to open the coaches dropdown
    const coachesDropdown = page.getByPlaceholder(/select coaches/i)
      .or(page.getByText(/select coaches/i).first())
      .or(page.locator('button[role="combobox"]').filter({ hasText: /coaches/i }))
      .or(page.locator('button[role="combobox"]').last());
    
    // Click the dropdown to open it
    if (await coachesDropdown.isVisible().catch(() => false)) {
      await coachesDropdown.click();
      
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
       if (await nextButton2.isVisible({ timeout: 1000 }).catch(() => false)) {
      await nextButton2.click();
    }

    const studentsDropdown = page.getByPlaceholder(/select students/i)
      .or(page.getByText(/select students/i).first())
      .or(page.locator('button[role="combobox"]').filter({ hasText: /students/i }))
      .or(page.locator('button[role="combobox"]').last());
    
    // Click the dropdown to open it
    if (await studentsDropdown.isVisible().catch(() => false)) {
      await studentsDropdown.click();
      // Select the first coach from the dropdown
      const studentOptions = page.locator('[role="option"], li label, .coach-item, [class*="option"]');
      const firstStudent = studentOptions.nth(0);
      
      if (await firstStudent.isVisible().catch(() => false)) {
        await firstStudent.click();
      }
      await page.keyboard.press('Escape');
    }
    // Step 5: Click final submit button (Add/Create)
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Add|Create|Submit/i }).click();

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
    // Increase timeout for this complex test
    test.setTimeout(120000); // 2 minutes
    
    // Extract test data from static data
    const { title, price, progress, startDate, endDate, startTime, endTime } = staticData.classDataEdit;
    
    // Wait for the class list to load
    await page.waitForTimeout(1000);
    
    // More specific selector for class rows
    const classRows = page.locator('table tbody tr').or(page.locator('[role="row"]'));
    
    // Ensure at least one class exists
    const rowCount = await classRows.count();
    console.log(`Found ${rowCount} class rows`);
    
    if (rowCount === 0) {
      console.log('⚠ No classes found to edit. Skipping edit test.');
      test.skip();
      return;
    }
    
    const classAtIndex0 = classRows.nth(0);
    await expect(classAtIndex0).toBeVisible({ timeout: 10000 });
    await classAtIndex0.click();
    
    // Wait for detail view to load - look for specific detail page indicators
    await page.waitForTimeout(1000);

    // Find the three-dot menu button - should be visible in detail view
    const actionsMenuButton = page.locator('button[aria-haspopup="menu"]').first();
    await expect(actionsMenuButton).toBeVisible({ timeout: 5000 });
    await actionsMenuButton.click();
    await page.waitForTimeout(800);
    
    // Click on Edit option in the menu
    const editButton = page.getByRole('menuitem', { name: /Edit/i }).or(page.getByRole('button', { name: /Edit/i }));
    
    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editButton.click();
      
      // Wait for the edit drawer/form to appear
      await page.waitForTimeout(1000);
      
      // Step 1: Edit fields in General Info tab
      // Edit Title field
      const titleField = page.locator('#title');
      if (await titleField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await titleField.clear();
        await FileInput(titleField, title);
      }

       
    // Select Course dropdown
    await page.waitForTimeout(500);
    
    // Click the first combobox (course dropdown)
    const courseDropdown = page.locator('button[role="combobox"]').first();
    if (await courseDropdown.isVisible({ timeout: 5000 }).catch(() => false)) {
      await courseDropdown.click();
      
      // Select the first course option
      await page.waitForTimeout(300);
      const courseOptions = page.getByRole('option');
      if (await courseOptions.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await courseOptions.first().click();
        await page.waitForTimeout(500);
      }
    }
    
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
        await FileInput(priceField, price);
      }
      
      // Edit Progress field
      const progressField = page.getByLabel(/progress/i)
        .or(page.getByPlaceholder(/progress/i))
        .or(page.locator('input[type="text"]').nth(2))
        .or(page.locator('input[type="number"]').nth(1));
      if (await progressField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await progressField.clear();
        await FileInput(progressField, progress);
      }

          // Fill Start Date field (static date)
    const startDateField = page.getByLabel(/start date/i)
      .or(page.getByPlaceholder(/start date/i))
      .or(page.locator('input[type="date"]').first());
    if (await startDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(startDateField, startDate);
    }
    
    // Fill End Date field (static date)
    const endDateField = page.getByLabel(/end date/i)
      .or(page.getByPlaceholder(/end date/i))
      .or(page.locator('input[type="date"]').nth(1));
    if (await endDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await FileInput(endDateField, endDate);
    }
    
      
      // Edit Start Time
      const startTimeField = page.getByLabel(/start time/i)
        .or(page.locator('#startTime'))
        .or(page.getByPlaceholder(/start time/i));
      if (await startTimeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await startTimeField.clear();
        await FileInput(startTimeField, startTime);
      }
      
      // Edit End Time
      const endTimeField = page.getByLabel(/end time/i)
        .or(page.locator('#endTime'))
        .or(page.getByPlaceholder(/end time/i));
      if (await endTimeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await endTimeField.clear();
        await FileInput(endTimeField, endTime);
      }

            // Scroll to ensure toggles are visible
      await page.evaluate(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      });

              // Click "Remove file" button first to remove existing file
        const removeFileButton = page.getByRole('button', { name: /Remove file/i })
          .or(page.locator('button[aria-label*="Remove file"]'))
          .or(page.locator('button:has-text("Remove file")'));
        
        if (await removeFileButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('Clicking Remove file button...');
          await removeFileButton.click();
          await page.waitForTimeout(500);
        }
      await page.waitForTimeout(500);

      await uploadThumbnail(page, "file-input || selected-exist", {
      imagePath: path.join(__dirname, '..', 'public', 'images', 'thumbnial-update.png')
      });
      
      await page.waitForTimeout(500);
      // Set Publish toggle to FALSE
      const publishToggle = page.locator('#isPublish')
        .or(page.locator('[role="switch"]').filter({ hasText: /publish/i }));
      if (await publishToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
        await publishToggle.click();
        await page.waitForTimeout(1000);
      }

      // Set Online toggle to FALSE
      const onlineToggle = page.locator('#isOnline')
        .or(page.locator('[role="switch"]').filter({ hasText: /online/i }));
      if (await onlineToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
        await onlineToggle.click();
        await page.waitForTimeout(1000);
      }

      // Step 2: Click Next button to go to Coaches tab
      await page.waitForTimeout(500);
      const nextButton = page.getByRole('button', { name: /next|next step/i });
      await nextButton.scrollIntoViewIfNeeded();
      
      if (await nextButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        const isDisabled = await nextButton.isDisabled().catch(() => true);
        if (!isDisabled) {
          await nextButton.click();
          await page.waitForTimeout(1000);
          
          // Step 3: Update coach selection
          await page.waitForTimeout(500);
          
          // Try to find ALL possible chevron buttons
          const allButtons = page.locator('button:has(svg.lucide-chevron-down)');
          const buttonCount = await allButtons.count();
          console.log(`Total buttons with chevron found: ${buttonCount}`);
          
          // Log details about each button
          for (let i = 0; i < buttonCount; i++) {
            const btn = allButtons.nth(i);
            const isVisible = await btn.isVisible().catch(() => false);
            const ariaExpanded = await btn.getAttribute('aria-expanded').catch(() => 'N/A');
            const dataState = await btn.getAttribute('data-state').catch(() => 'N/A');
            console.log(`  Button ${i}: visible=${isVisible}, aria-expanded=${ariaExpanded}, data-state=${dataState}`);
          }
          
          const coachesDropdownTrigger = page.locator('button:has(svg.lucide-chevron-down)').first()
            .or(page.locator('button[type="button"]:has(svg.lucide-chevron-down)').first())
            .or(page.locator('button[aria-haspopup="dialog"]').first())
            .or(page.getByPlaceholder(/select coaches/i));
          
          console.log(`Coaches trigger visible: ${await coachesDropdownTrigger.isVisible({ timeout: 3000 }).catch(() => false)}`);
          
          if (await coachesDropdownTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log('Attempting to click coaches dropdown...');
            await coachesDropdownTrigger.click({ force: true });
            console.log('✓ Clicked to open coaches dropdown');
            await page.waitForTimeout(1000);
            
            // Try multiple selectors to find coach options
            const coachOptions = page.locator('[role="option"]');
            const coachCount = await coachOptions.count();
            console.log(`Found ${coachCount} coach options in dropdown`);
            
            // Log all available options for debugging
            for (let i = 0; i < Math.min(coachCount, 5); i++) {
              const optionText = await coachOptions.nth(i).textContent().catch(() => 'N/A');
              const isVisible = await coachOptions.nth(i).isVisible().catch(() => false);
              console.log(`  Coach ${i}: "${optionText}" - Visible: ${isVisible}`);
            }
            
            // Add one more coach if more items are available (select index 1 if exists)
            if (coachCount > 1) {
              const secondCoach = coachOptions.nth(1);
              const secondCoachText = await secondCoach.textContent().catch(() => 'Unknown');
              console.log(`Attempting to click second coach: "${secondCoachText}"`);
              
              // Scroll into view first
              await secondCoach.scrollIntoViewIfNeeded().catch(() => {});
              await page.waitForTimeout(300);
              
              if (await secondCoach.isVisible({ timeout: 3000 }).catch(() => false)) {
                await secondCoach.click();
                console.log('✓ Added one more coach (index 1)');
                await page.waitForTimeout(500);
              } else {
                console.log('⚠ Second coach not visible');
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
            await page.waitForTimeout(1000);
            
            // Step 4.5: Update student selection
            const studentsDropdownTrigger = page.locator('button:has(svg.lucide-chevron-down)').last()
              .or(page.locator('button[type="button"]:has(svg.lucide-chevron-down)').last())
              .or(page.locator('button[aria-haspopup="dialog"]').last())
              .or(page.getByPlaceholder(/select students/i));
            
            if (await studentsDropdownTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
              await studentsDropdownTrigger.click();
              await page.waitForTimeout(1000);
              
              // Get all student options that are visible
              const studentOptions = page.locator('[role="option"], li label, .student-item, [class*="option"]');
              const studentCount = await studentOptions.count();
              
              // Add one more student if more items are available (select index 1 if exists)
              if (studentCount > 1) {
                const secondStudent = studentOptions.nth(1);
                if (await secondStudent.isVisible({ timeout: 2000 }).catch(() => false)) {
                  await secondStudent.click();
                  console.log('✓ Added one more student (index 1)');
                  await page.waitForTimeout(500);
                } else {
                  console.log('⚠ Second student not visible');
                }
              } else {
                console.log('⚠ No additional students available to add');
              }
              
              await page.keyboard.press('Escape');
              await page.waitForTimeout(500);
            } else {
              console.log('⚠ Students dropdown not visible in Edit class');
            }
          }
        }
      }
      
      // Step 5: Submit the updated form
      await page.waitForTimeout(500);
      const submitButton = page.getByRole('button', { name: /Update|Save|Submit/i });
      if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await submitButton.click();
        console.log('✓ Clicked submit button');
      } else {
        console.log('⚠ Submit button not visible');
      }

    } else {
      console.log('⚠ Edit button not found or not visible');
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
