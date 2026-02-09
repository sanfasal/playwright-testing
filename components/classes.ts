
import { Page, expect } from '@playwright/test';
import { FileInput } from '../utils/form-helper';
import { uploadThumbnail } from '../utils/upload-thumbnail-helper';
import path from 'path';

export async function createClass(page: Page, data: any) {
    const { title, price, progress, startDate, endDate, startTime, endTime } = data;

    // 1. Click Add Class button
    await page.locator('#add-class-button').click();
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible();
    await page.waitForTimeout(500);
    
    // Fill Title field
    const titleField = page.locator('#title');
    await FileInput(titleField, title);
    
    // Click the first combobox (course dropdown)
    const courseDropdown = page.locator('button[role="combobox"]').first();
    await courseDropdown.waitFor({ state: 'visible' });
    await courseDropdown.click();
    
    // Select the first course option
    await page.waitForTimeout(500);
    const courseOptions = page.getByRole('option');
    try {
        await courseOptions.first().waitFor({ state: 'visible', timeout: 5000 });
        await courseOptions.first().click();
    } catch (e) {
        console.log('No course options found or timeout waiting for options');
        await page.keyboard.press('Escape');
    }

    
    // Scroll to ensure all form fields are visible
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
    
    // Fill Price field
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
    
    // Fill Start Date field
    const startDateField = page.getByLabel(/start date/i)
      .or(page.getByPlaceholder(/start date/i))
      .or(page.locator('input[type="date"]').first());
    await FileInput(startDateField, startDate);
    
    // Fill End Date field
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

    // Set Publish toggle
    if (data.publish) {
        const publishToggle = page.locator('#isPublish')
          .or(page.locator('[role="switch"]').filter({ hasText: /publish/i }));
        if (await publishToggle.getAttribute('aria-checked') === 'false') {
             await publishToggle.click();
        }
    }

    await page.waitForTimeout(1000);

    // Set Online toggle
    if (data.online) {
        const onlineToggle = page.locator('#isOnline')
          .or(page.locator('[role="switch"]').filter({ hasText: /online/i }));
        if (await onlineToggle.getAttribute('aria-checked') === 'false') {
             await onlineToggle.click();
        }
    }

    await page.waitForTimeout(1000);
    
    // Step 2: Next (Coaches)
    const nextButton = page.getByRole('button', { name: /next|next step/i });
    if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nextButton.click();
    }
    
    // Select Coaches
    const coachesDropdown = page.getByPlaceholder(/select coaches/i)
      .or(page.getByText(/select coaches/i).first())
      .or(page.locator('button[role="combobox"]').filter({ hasText: /coaches/i }))
      .or(page.locator('button[role="combobox"]').last());
    
    if (await coachesDropdown.isVisible().catch(() => false)) {
      await coachesDropdown.click();
      const coachOptions = page.locator('[role="option"], li label, .coach-item, [class*="option"]');
      const firstCoach = coachOptions.nth(0);
      if (await firstCoach.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstCoach.click();
        await page.waitForTimeout(500);
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Step 3: Next (Students)
    const nextButton2 = page.getByRole('button', { name: /next|next step/i });
    if (await nextButton2.isVisible({ timeout: 1000 }).catch(() => false)) {
      await nextButton2.click();
    }

    // Select Students
    const studentsDropdown = page.getByPlaceholder(/select students/i)
      .or(page.getByText(/select students/i).first())
      .or(page.locator('button[role="combobox"]').filter({ hasText: /students/i }))
      .or(page.locator('button[role="combobox"]').last());
    
    if (await studentsDropdown.isVisible().catch(() => false)) {
      await studentsDropdown.click();
      const studentOptions = page.locator('[role="option"], li label, .coach-item, [class*="option"]');
      const firstStudent = studentOptions.nth(0);
      if (await firstStudent.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstStudent.click();
      }
      await page.keyboard.press('Escape');
    }
    
    // Step 5: Submit
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Add|Create|Submit/i }).click();
}

export async function updateClass(page: Page, data: any) {
    const { title, price, progress, startDate, endDate, startTime, endTime } = data;

    // Wait for the edit drawer/form to appear
    await page.waitForTimeout(1000);
    
    // Edit Title field
    const titleField = page.locator('#title');
    if (await titleField.isVisible({ timeout: 3000 }).catch(() => false)) {
    await titleField.clear();
    await FileInput(titleField, title);
    }

    // Edit Course dropdown (optional, keeping selection logic similar to add but maybe checking visibility)
    // For now, let's assume we might want to change it or just leave it. 
    // The previous test logic tried to click it and select option 1.

    // Select Course dropdown
    await page.waitForTimeout(500);
    const courseDropdown = page.locator('button[role="combobox"]').first();
    if (await courseDropdown.isVisible({ timeout: 5000 }).catch(() => false)) {
      await courseDropdown.click();
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

    // Fill Start Date field
    const startDateField = page.getByLabel(/start date/i)
    .or(page.getByPlaceholder(/start date/i))
    .or(page.locator('input[type="date"]').first());
    if (await startDateField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await FileInput(startDateField, startDate);
    }

    // Fill End Date field
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

    // Remove file if exists
    const removeFileButton = page.getByRole('button', { name: /Remove file/i })
        .or(page.locator('button[aria-label*="Remove file"]'))
        .or(page.locator('button:has-text("Remove file")'));
    
    if (await removeFileButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await removeFileButton.click();
        await page.waitForTimeout(500);
    }
    
    await uploadThumbnail(page, "file-input || selected-exist", {
    imagePath: path.join(__dirname, '..', 'public', 'images', 'thumbnail-update.png')
    });

    await page.waitForTimeout(500);

     // Set Publish toggle
    const publishToggle = page.locator('#isPublish')
    .or(page.locator('[role="switch"]').filter({ hasText: /publish/i }));
    if (await publishToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
        const isChecked = await publishToggle.getAttribute('aria-checked') === 'true';
        if (isChecked !== data.publish) {
            await publishToggle.click();
            await page.waitForTimeout(1000);
        }
    }

    // Set Online toggle
    const onlineToggle = page.locator('#isOnline')
    .or(page.locator('[role="switch"]').filter({ hasText: /online/i }));
    if (await onlineToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
        const isChecked = await onlineToggle.getAttribute('aria-checked') === 'true';
        if (isChecked !== data.online) {
            await onlineToggle.click();
            await page.waitForTimeout(1000);
        }
    }


    // Next to Coaches
    await page.waitForTimeout(500);
    const nextButton = page.getByRole('button', { name: /next|next step/i });
    
    if (await nextButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        const isDisabled = await nextButton.isDisabled().catch(() => true);
        if (!isDisabled) {
            await nextButton.click();
            await page.waitForTimeout(1000);
            
             // Add one more coach attempt
            const coachesDropdownTrigger = page.locator('button:has(svg.lucide-chevron-down)').first()
            .or(page.locator('button[type="button"]:has(svg.lucide-chevron-down)').first())
            .or(page.locator('button[aria-haspopup="dialog"]').first())
            .or(page.getByPlaceholder(/select coaches/i));

            if (await coachesDropdownTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
                await coachesDropdownTrigger.click({ force: true });
                await page.waitForTimeout(1000);
                
                const coachOptions = page.locator('[role="option"]');
                const coachCount = await coachOptions.count();
                if (coachCount > 1) {
                    const secondCoach = coachOptions.nth(1);
                     if (await secondCoach.isVisible({ timeout: 3000 }).catch(() => false)) {
                        await secondCoach.click();
                     }
                }
                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);
            }
        }
    }

    // Next to Students
    const nextButton2 = page.getByRole('button', { name: /next|next step/i });
    if (await nextButton2.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nextButton2.click();
        await page.waitForTimeout(2000);
        
        // Add one more student attempt
         const studentsDropdownTrigger = page.locator('button:has(svg.lucide-chevron-down)').last()
          .or(page.locator('button[type="button"]:has(svg.lucide-chevron-down)').last())
          .or(page.locator('button[aria-haspopup="dialog"]').last())
          .or(page.getByPlaceholder(/select students/i));
        
        if (await studentsDropdownTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
            await studentsDropdownTrigger.click();
            await page.waitForTimeout(1500);
             const studentOptions = page.locator('[role="option"], li label, .student-item, [class*="option"]');
             const studentCount = await studentOptions.count();
               if (studentCount > 1) {
                const secondStudent = studentOptions.nth(1);
                 if (await secondStudent.isVisible({ timeout: 2000 }).catch(() => false)) {
                  await secondStudent.click();
                 }
               }
             await page.keyboard.press('Escape');
             await page.waitForTimeout(500);
        }
    }

    // Submit
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Update|Save|Submit/i }).click();
}
