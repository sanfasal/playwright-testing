import { test, expect } from '@playwright/test';
import { login } from '../../utils/auth-helper';
import { addCursorTracking } from '../../utils/cursor-helper';
import { fillFieldWithDelay } from '../../utils/form-helper';
import { deleteEntityViaActionMenu } from '../../utils/delete-helper';
import { toggleViewMode } from '../../utils/view-helper';
import { uploadThumbnail } from '../../utils/upload-thumbnail-helper';

test.describe('Courses', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    
    await page.getByText('Course', { exact: true }).click();
    
    const coursesLink = page.getByRole('link', { name: 'Courses', exact: true })
                      .or(page.getByText('Courses', { exact: true }));
    
    if (await coursesLink.isVisible()) {
        await coursesLink.click();
    }
    
    await expect(page).toHaveURL(/courses/); 
  });

  // =====================================
  // Add new course
  // =====================================
  test('Add new course', async ({ page }) => {
    test.setTimeout(120000);
    
    // 1. Click Add Course button
    const addButton = page.locator('#add-course-button')
        .or(page.getByRole('button', { name: /add course/i }));
        
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    await addButton.click();
    
    // 2. Wait for the General Info form (Title field) to appear
    const titleField = page.getByRole('textbox', { name: /^Title/i })
        .or(page.getByPlaceholder('Title', { exact: true }))
        .or(page.locator('input[name="title"]'))
        .first();
        
    await expect(titleField).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500); // Stability wait
    
    // Fill Title
    await fillFieldWithDelay(titleField, 'Introduction to Advanced Programming');

    // 3. Select Subject (Dropdown)
    // Locates the button specifically next to or under the "Subject" label
    const subjectDropdown = page.locator('label:has-text("Subject")').locator('..').locator('button[role="combobox"]')
        .or(page.getByTestId('subject-dropdown'))
        .first();

    await expect(subjectDropdown).toBeVisible(); 
    await subjectDropdown.scrollIntoViewIfNeeded();
    await subjectDropdown.click();
    
    await expect(subjectDropdown).toHaveAttribute('aria-expanded', 'true');
    
    // Select the first available option
    const subjectOptions = page.getByRole('option');
    await expect(subjectOptions.first()).toBeVisible({ timeout: 5000 });
    
    if (await subjectOptions.count() > 1) {
         await subjectOptions.nth(1).click();
    } else {
         await subjectOptions.first().click();
    }

    // 4. Select Level (Dropdown)
    const levelDropdown = page.locator('label:has-text("Level")').locator('..').locator('button[role="combobox"]')
        .or(page.getByTestId('level-dropdown'))
        .first();

    await expect(levelDropdown).toBeVisible();
    await levelDropdown.scrollIntoViewIfNeeded();
    await levelDropdown.click();
    
    await expect(levelDropdown).toHaveAttribute('aria-expanded', 'true');
    const levelOptions = page.getByRole('option');
    await expect(levelOptions.first()).toBeVisible({ timeout: 5000 });
    
    // Select an option
    await levelOptions.first().click();

    // 5. Fill Duration
    const durationField = page.getByRole('textbox', { name: /^Duration/i })
        .or(page.getByPlaceholder('Duration'))
        .or(page.locator('input[name="duration"]'))
        .first();
        
    await durationField.scrollIntoViewIfNeeded();
    await fillFieldWithDelay(durationField, '50');

    // 6. Fill Prerequisite (Textarea)
    const prerequisiteField = page.locator('textarea[name="prerequisite"]')
        .or(page.getByRole('textbox', { name: /^Prerequisite/i }))
        .or(page.getByPlaceholder('Prerequisite'))
        .first();
        
    if (await prerequisiteField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await prerequisiteField.scrollIntoViewIfNeeded();
        await fillFieldWithDelay(prerequisiteField, 'Basic JS knowledge');
    }

    // Optional: Preparation (if exists on form, not in screenshot but good to keep if dynamic)
    const preparationField = page.getByLabel(/preparation/i).or(page.getByPlaceholder(/preparation/i));
    if (await preparationField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fillFieldWithDelay(preparationField, 'Laptop and Internet');
    }

    // Optional: Purpose
    const purposeField = page.getByLabel(/purpose/i).or(page.getByPlaceholder(/purpose/i));
    if (await purposeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fillFieldWithDelay(purposeField, 'To learn advanced coding.');
    }

    // Optional: Overview
    const overviewField = page.getByLabel(/overview/i).or(page.getByPlaceholder(/overview/i));
    if (await overviewField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fillFieldWithDelay(overviewField, 'Course overview content.');
    }
    
    // Optional: Objective
    const objectiveField = page.getByLabel(/objective/i).or(page.getByPlaceholder(/objective/i));
    if (await objectiveField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fillFieldWithDelay(objectiveField, 'Course objectives.');
    }

    // Optional: Link
    const linkField = page.getByLabel(/link/i).or(page.getByPlaceholder(/link/i));
    if (await linkField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fillFieldWithDelay(linkField, 'https://example.com');
    }

    // 7. Upload Thumbnail
    await uploadThumbnail(page);
    await page.waitForTimeout(1000);

    // 8. Click "Next" to go to Outline tab
    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeVisible();
    await nextButton.scrollIntoViewIfNeeded();
    await nextButton.click();

    // --- Interacting with Module and Lessons (Tab 2) ---
    await page.waitForTimeout(1000);

    // Select Module
    const moduleDropdown = page.getByRole('combobox').filter({ hasText: /select module/i })
        .or(page.getByText('Select module', { exact: false })).first();
    
    await expect(moduleDropdown).toBeVisible();
    await moduleDropdown.click();
    
    await expect(page.getByRole('option').first()).toBeVisible();
    await page.getByRole('option').first().click();
    
    await page.waitForTimeout(500);

    // Select Lessons
    const lessonsDropdown = page.getByRole('combobox').filter({ hasText: /select lessons/i })
        .or(page.getByText('Select Lessons', { exact: false })).first();

    await expect(lessonsDropdown).toBeVisible();
    await lessonsDropdown.click();
    
    await expect(page.getByRole('option').first()).toBeVisible();
    await page.getByRole('option').first().click();

    // Close the multi-select dropdown
    await page.keyboard.press('Escape');
    
    // 9. Submit/Create
    await page.waitForTimeout(500);
    const submitButton = page.getByRole('button', { name: /create|save|submit/i })
        .or(page.locator('button[type="submit"]'))
        .filter({ hasText: /create|save/i });
        
    await submitButton.click({ force: true });
  });


  // ===================================
  // Course page
  // ===================================

    test('Course List', async ({ page }) => {
      await page.waitForTimeout(2000);
      await toggleViewMode(page);

      const subjectDropdown = page.getByTestId('subjects-dropdown').or(
          page.getByRole('combobox').filter({ hasText: /all subjects/i })
      );
      await expect(subjectDropdown).toBeVisible();
      await subjectDropdown.click();
      
      await expect(subjectDropdown).toHaveAttribute('aria-expanded', 'true');
      
      const options = page.getByRole('option');
      await expect(options.first()).toBeVisible();
      await expect(options.nth(1)).toBeVisible();
      await page.waitForTimeout(300); 
      
      await options.nth(2).click();

      // =================================================
      // Interact with "All Levels" dropdown
      // =================================================
      const levelDropdown = page.getByRole('combobox').filter({ hasText: /all levels/i });
      await expect(levelDropdown).toBeVisible();
      await levelDropdown.click();
      
      // Wait for expanded state
      await expect(levelDropdown).toHaveAttribute('aria-expanded', 'true');

      // Select index 1 (second item)
      // Note: We use a new variable to avoid conflict with 'options' above
      const levelOptions = page.getByRole('option');
      await expect(levelOptions.nth(1)).toBeVisible();
      
      await page.waitForTimeout(300); // Animation stability
      await levelOptions.nth(1).click();
    });

  // =====================================
  // Edit course (Corrected Version)
  // =====================================
  test('Edit course', async ({ page }) => {
    test.setTimeout(120000);
    
    // Wait for the course list to load
    await page.waitForTimeout(1000);
    
    // Get all course rows/items
    const courseRows = page.locator('table tbody tr, [role="row"], .course-item, div[class*="course-card"]');
    await expect(courseRows.first()).toBeVisible({ timeout: 10000 });

    // Get the course at index 0
    const courseAtIndex0 = courseRows.first();
    await courseAtIndex0.scrollIntoViewIfNeeded();
    
    // Click the "three dots" / More Options menu in the row
    const moreMenuBtn = courseAtIndex0.locator('button').filter({ has: page.locator('svg.lucide-more-vertical, svg.lucide-ellipsis, svg.lucide-more-horizontal') }).first();
    
    if (await moreMenuBtn.isVisible({ timeout: 5000 })) {
        await moreMenuBtn.click();
        await page.waitForTimeout(500); // Wait for menu to open
    } else {
        // Fallback: click row if menu not found (older behavior)
        await courseAtIndex0.click({ force: true });
    }
    await page.waitForTimeout(1000);
    await page.waitForTimeout(1000);

    // Look for Edit button
    const actionsMenuButton = page.locator('button[aria-haspopup="menu"]').first();
    await actionsMenuButton.click();
    await page.waitForTimeout(800);
    
    const editButton = page.getByRole('menuitem', { name: /Edit/i }).or(page.getByRole('button', { name: /Edit/i }));
    
    if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editButton.click({ force: true });
      await page.waitForTimeout(1500);
      
      // Edit Title field
      const titleField = page.locator('#title').or(page.getByLabel(/title/i)).first();
      await titleField.waitFor({ state: 'visible', timeout: 5000 });
      
      if (await titleField.isVisible().catch(() => false)) {
        await titleField.clear();
        await fillFieldWithDelay(titleField, 'Updated Course Title - Advanced Programming');
      }

      // Edit Subject (Dropdown) - Try to pick another option if available
      const subjectDropdown = page.getByTestId('subject-dropdown').or(
          page.locator('label', { hasText: /^Subject/ }).locator('..').locator('button[role="combobox"]')
      );
      if (await subjectDropdown.isVisible()) {
          await subjectDropdown.click();
          await expect(subjectDropdown).toHaveAttribute('aria-expanded', 'true');
          const subjectOptions = page.getByRole('option');
          if (await subjectOptions.count() > 1) {
              // Try to select a different one (e.g. index 0 if 1 was selected, or just 0)
              await subjectOptions.first().click(); 
          } else if (await subjectOptions.count() === 1) {
              await subjectOptions.first().click();
          } else {
             // Close if no options
             await subjectDropdown.click();
          }
      }

      // Edit Level (Dropdown)
      const levelDropdown = page.getByTestId('level-dropdown').or(
          page.locator('label', { hasText: /^Level/ }).locator('..').locator('button[role="combobox"]')
      );
      if (await levelDropdown.isVisible()) {
          await levelDropdown.click();
          await expect(levelDropdown).toHaveAttribute('aria-expanded', 'true');
          const levelOptions = page.getByRole('option');
           if (await levelOptions.count() > 0) {
              await levelOptions.first().click(); 
          }
      }

      // Edit Duration
      const durationField = page.getByLabel(/duration/i).or(page.getByPlaceholder(/duration/i));
      if (await durationField.isVisible()) {
           await durationField.clear();
           await fillFieldWithDelay(durationField, '60');
      }

      // Edit Prerequisite
      const prerequisiteField = page.getByLabel(/prerequisite/i).or(page.getByPlaceholder(/prerequisite/i));
      if (await prerequisiteField.isVisible()) {
          await prerequisiteField.clear();
          await fillFieldWithDelay(prerequisiteField, 'Updated JS knowledge');
      }

      // Edit Preparation
      const preparationField = page.getByLabel(/preparation/i).or(page.getByPlaceholder(/preparation/i));
      if (await preparationField.isVisible()) {
          await preparationField.clear();
          await fillFieldWithDelay(preparationField, 'Updated Preparation steps');
      }

      // Edit Purpose
      const purposeField = page.getByLabel(/purpose/i).or(page.getByPlaceholder(/purpose/i));
      if (await purposeField.isVisible()) {
          await purposeField.clear();
          await fillFieldWithDelay(purposeField, 'Updated Purpose: Master advanced concepts.');
      }

      // Edit Overview/Description field (Consistent with Add Course)
      const overviewField = page.locator('#overview')
          .or(page.getByLabel(/overview/i))
          .or(page.getByPlaceholder(/overview/i))
          .or(page.locator('textarea').filter({ hasText: /overview/i }).first())

      if (await overviewField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await overviewField.clear();
        await fillFieldWithDelay(overviewField, 'Updated description with new content and objectives.');
      }

    // Edit Objective
      const objectiveField = page.getByLabel(/objective/i).or(page.getByPlaceholder(/objective/i));
      if (await objectiveField.isVisible()) {
          await objectiveField.clear();
          await fillFieldWithDelay(objectiveField, 'Updated Objective: Master advanced concepts.');
      }
      
      // Edit Link
      const linkField = page.getByLabel(/link/i).or(page.getByPlaceholder(/link/i));
      if (await linkField.isVisible()) {
           await linkField.clear();
           await fillFieldWithDelay(linkField, 'https://www.youtube.com/results?search_query=playwright');
      }

    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeVisible();
    await nextButton.scrollIntoViewIfNeeded();
    await nextButton.hover();
    await page.waitForTimeout(300);
    await nextButton.click();

    await page.waitForTimeout(1000);

    // Module selection logic - Use more specific filtering to avoid matching Subject/Level dropdowns
    // locate the combobox specifically associated with "Select module" text or label
    const moduleDropdown = page.locator('button[role="combobox"]').filter({ hasText: /select module|introduction|module/i }).last();
    
    // Ensure we are in the module section (scroll down)
    await moduleDropdown.scrollIntoViewIfNeeded();
    await expect(moduleDropdown).toBeVisible();
    await moduleDropdown.click();
    
    // Select first available option if any
    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 5000 }).catch(() => null);
    if (await page.getByRole('option').count() > 0) {
        await page.getByRole('option').first().click();
    } else {
         await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);

    // Lessons dropdown
    const lessonsDropdown = page.locator('button[role="combobox"]').filter({ hasText: /select lesson|react|lesson/i }).last();

    if (await lessonsDropdown.isVisible()) {
        await lessonsDropdown.click();
        await page.waitForTimeout(500);
        // Just close it for now as we might not want to change complex selection logic
        await page.keyboard.press('Escape');
    }
    
    await page.waitForTimeout(500);

    // Final Update Submit
    const updateButton = page.getByRole('button', { name: /update|save|submit/i }).last();
    await expect(updateButton).toBeVisible();
    await updateButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200); 
    await updateButton.click({ force: true });
      
    }
  });

  // =====================================
  // Delete course
  // =====================================
  test('Delete course', async ({ page }) => {
    test.setTimeout(120000);
    
    await page.waitForTimeout(2000);
    
    const courseRows = page.locator('table tbody tr, [role="row"], .course-item, div[class*="course"]');
    const indexToDelete = 0;
    const courseToDelete = courseRows.nth(indexToDelete);

    await deleteEntityViaActionMenu(page, courseToDelete, 'Confirm Delete');
  });
});


