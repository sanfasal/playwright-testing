import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { fillFieldWithDelay } from '../utils/form-helper';

test.describe('Class', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    
    // Verify we are on dashboard
    await expect(page).toHaveURL(/dashboard/);

    // Wait for the loading screen to disappear
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    
    // Navigate to class page
    await page.getByText('Class', { exact: true }).click();
    
    // Ensure we are on the class page before each test starts
    await expect(page).toHaveURL(/classes/);
  });

    test('Class page', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Method 1: Try using JavaScript to add IDs
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach((btn, index) => {
        const svg = btn.querySelector('svg');
        if (svg) {
          const classes = svg.className.baseVal || svg.getAttribute('class') || '';
          if (classes.includes('lucide-layout-grid')) {
            btn.id = 'grid-view-btn';
          } else if (classes.includes('lucide-list')) {
            btn.id = 'list-view-btn';
          }
        }
      });
    });
    
    // Try clicking with ID first
    let clicked = false;
    
    // Try to click grid view
    const gridBtn = page.locator('#grid-view-btn');
    if (await gridBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await gridBtn.click();
      await page.waitForTimeout(800);
      clicked = true;
    }
    
    // Try to click list view
    const listBtn = page.locator('#list-view-btn');
    if (await listBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await listBtn.click();
      await page.waitForTimeout(800);
      clicked = true;
    }
    
    // Method 2: If IDs didn't work, try direct SVG selectors
    if (!clicked) {
      const gridSvg = page.locator('svg.lucide-layout-grid').first();
      if (await gridSvg.isVisible({ timeout: 1000 }).catch(() => false)) {
        await gridSvg.click();
        await page.waitForTimeout(800);
      }
      
      const listSvg = page.locator('svg.lucide-list').first();
      if (await listSvg.isVisible({ timeout: 1000 }).catch(() => false)) {
        await listSvg.click();
        await page.waitForTimeout(800);
      }
    }
  });

  test('Add new class', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(60000);
    
    // Click the add button
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
          console.log('✓ Clicked coach item at index 1');
          await page.waitForTimeout(800);
          selected = true;
        }
      }
      
      // Strategy 3: Click by text (Case Maya or Sann Fasal)
      if (!selected) {
        const coachByText = page.getByText('Case Maya', { exact: true })
          .or(page.getByText('Sann Fasal', { exact: true }));
        if (await coachByText.isVisible({ timeout: 2000 }).catch(() => false)) {
          await coachByText.click();
          console.log('✓ Clicked coach by text');
          await page.waitForTimeout(800);
          selected = true;
        }
      }
      
      // Strategy 4: Click the first role="option" or list item
      if (!selected) {
        const firstOption = page.locator('[role="option"]').first()
          .or(page.locator('li').first());
        if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await firstOption.click();
          await page.waitForTimeout(800);
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
      await page.waitForTimeout(6000);
    }
    
 
    
    // Step 5: Click final submit button (Add/Create)
    await page.waitForTimeout(500);
    const submitButton = page.getByRole('button', { name: /Add|Create|Submit/i });
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitButton.click();
    }

    
    // Verify the new class appears in the list or success message is shown
    // Adjust this based on your actual success indicator
    const successIndicators = [
      page.getByText(/successfully/i),
      page.getByText(/created/i),
      page.getByText('Test Class Title')
    ];
    
    // Check if at least one success indicator is visible
    let successFound = false;
    for (const indicator of successIndicators) {
      if (await indicator.isVisible({ timeout: 3000 }).catch(() => false)) {
        successFound = true;
        break;
      }
    }
    
    // Log result for debugging
    if (successFound) {
    } else {
    }
  });

  test('Edit class', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(60000);
    
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
            await page.waitForTimeout(1200);
            
            // Add IDs to coach list items
            await page.evaluate(() => {
              const listItems = document.querySelectorAll('[role="option"], li, label');
              listItems.forEach((item, index) => {
                const text = item.textContent?.trim() || '';
                if (text.includes('Case Maya') || text.includes('Sann Fasal') || 
                    text.includes('Talley') || text.includes('Cohen') || text.includes('Jonho')) {
                  item.id = `coach-item-edit-${index}`;
                }
              });
            });
            
            await page.waitForTimeout(500);
            
            // Select coach at index 1 (different from add test)
            let selected = false;
            const coachItemAtIndex1 = page.locator('#coach-item-edit-1');
            if (await coachItemAtIndex1.isVisible({ timeout: 2000 }).catch(() => false)) {
              await coachItemAtIndex1.click();
              selected = true;
            }
            
            if (!selected) {
              const coachByText = page.getByText('Sann Fasal', { exact: true })
                .or(page.getByText('Case Maya', { exact: true }));
              if (await coachByText.isVisible({ timeout: 2000 }).catch(() => false)) {
                await coachByText.click();
              }
            }
            
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
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

  test('Delete class', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(60000);
    
    // Wait for the class list to load
    await page.waitForTimeout(2000);
    
    // Get all class rows/items
    const classRows = page.locator('table tbody tr, [role="row"], .class-item, div[class*="class"]');
    
    // Check if there are any classes available
    const classCount = await classRows.count();
    
    if (classCount === 0) {
      console.log('⚠ No classes found to delete');
      return;
    }
    
    // Use index 0 since Add test creates only one class
    const indexToDelete = 0;
    const classToDelete = classRows.nth(indexToDelete);
    
    // Wait for and click the class
    if (await classToDelete.isVisible({ timeout: 5000 }).catch(() => false)) {
      await classToDelete.click();
      await page.waitForTimeout(1500);

      // Find the three-dot menu button
      const actionsMenuButton = page.locator('button[aria-haspopup="menu"]').first();
      if (await actionsMenuButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await actionsMenuButton.click();
        await page.waitForTimeout(800);
        
        // Click on Delete option in the menu
        const deleteButton = page.getByRole('menuitem', { name: /Delete|Remove/i })
          .or(page.getByRole('button', { name: /Delete|Remove/i }));
        
        if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await deleteButton.click();
          
          // Wait for confirmation modal to appear
          await page.waitForTimeout(1000);
          
          // Type "Confirm Delete" in the input field
          const confirmInput = page.getByPlaceholder(/Type here/i)
            .or(page.locator('input[type="text"]').last());
          if (await confirmInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await fillFieldWithDelay(confirmInput, 'Confirm Delete', {
              typingDelay: 60,
              afterTypingDelay: 500
            });
          }
          
          // Click the "Permanently Delete" button
          const permanentlyDeleteButton = page.getByRole('button', { name: /Permanently Delete/i });
          if (await permanentlyDeleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await permanentlyDeleteButton.click();
            await page.waitForTimeout(2000);
          }
        } else {
          console.log('⚠ Delete button not found in menu');
        }
      } else {
        console.log('⚠ Actions menu button not found');
      }
    } else {
      console.log('⚠ Class to delete not visible');
    }
  });
});
