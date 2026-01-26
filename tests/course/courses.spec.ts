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
    
    const addButton = page.locator('#add-course-button')
        .or(page.getByRole('button', { name: /add course/i }));
        
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    await addButton.click();
    
    // Wait for the drawer/modal form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    await page.waitForTimeout(500);
    
    // Fill Title field
    const titleField = page.locator('#title').or(page.getByLabel(/title/i)).first();
    await titleField.waitFor({ state: 'visible', timeout: 5000 });
    await fillFieldWithDelay(titleField, 'Introduction to Advanced Programming');

    // Select Subject (Dropdown)
    const subjectDropdown = page.getByTestId('subject-dropdown').or(
        page.locator('label', { hasText: /^Subject/ }).locator('..').locator('button[role="combobox"]')
    );

    await expect(subjectDropdown).toBeVisible(); 
    await subjectDropdown.scrollIntoViewIfNeeded();
    await subjectDropdown.click();
    
    // Wait for dropdown to actually open
    await expect(subjectDropdown).toHaveAttribute('aria-expanded', 'true');
    
    // Select index 1 (preferred) or index 0
    const subjectOptions = page.getByRole('option');
    await expect(subjectOptions.first()).toBeVisible({ timeout: 5000 });
    
    if (await subjectOptions.count() > 1) {
         await subjectOptions.nth(1).click();
    } else {
         await subjectOptions.first().click();
    }

    // Select Level (Dropdown)
    const levelDropdown = page.getByTestId('level-dropdown').or(
        page.locator('label', { hasText: /^Level/ }).locator('..').locator('button[role="combobox"]')
    );

    await expect(levelDropdown).toBeVisible();
    await levelDropdown.scrollIntoViewIfNeeded();
    await levelDropdown.click();
    
    await expect(levelDropdown).toHaveAttribute('aria-expanded', 'true');
    const levelOptions = page.getByRole('option');
    await expect(levelOptions.first()).toBeVisible({ timeout: 5000 });
    
    if (await levelOptions.count() > 1) {
         await levelOptions.nth(1).click();
    } else {
         await levelOptions.first().click();
    }

    // Fill Duration
    const durationField = page.getByLabel(/duration/i).or(page.getByPlaceholder(/duration/i));
    await durationField.scrollIntoViewIfNeeded();
    await fillFieldWithDelay(durationField, '50');

    // Fill Prerequisite (Optional)
    const prerequisiteField = page.getByLabel(/prerequisite/i).or(page.getByPlaceholder(/prerequisite/i));
    if (await prerequisiteField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await prerequisiteField.scrollIntoViewIfNeeded();
        await fillFieldWithDelay(prerequisiteField, 'Basic JS knowledge');
    }

    // Fill Preparation (Optional)
    const preparationField = page.getByLabel(/preparation/i).or(page.getByPlaceholder(/preparation/i));
    if (await preparationField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await preparationField.scrollIntoViewIfNeeded();
        await fillFieldWithDelay(preparationField, 'Basic JS knowledge');
    }

    // Fill Purpose
    const purposeField = page.getByLabel(/purpose/i).or(page.getByPlaceholder(/purpose/i));
    if (await purposeField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await purposeField.scrollIntoViewIfNeeded();
        await fillFieldWithDelay(purposeField, 'This course is designed to teach students the fundamentals of programming.');
    }

    // Fill Overview
    const overviewField = page.getByLabel(/overview/i).or(page.getByPlaceholder(/overview/i));
    if (await overviewField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await overviewField.scrollIntoViewIfNeeded();
        await fillFieldWithDelay(overviewField, 'A comprehensive course on advanced programming concepts.');
    }
    
    // Fill Objective
    const objectiveField = page.getByLabel(/objective/i).or(page.getByPlaceholder(/objective/i));
    if (await objectiveField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await objectiveField.scrollIntoViewIfNeeded();
        await fillFieldWithDelay(objectiveField, 'Master the core concepts of advanced programming.');
        console.log('✓ Filled Objective field');
    }

    // Fill Link (Optional)
    const linkField = page.getByLabel(/link/i).or(page.getByPlaceholder(/link/i));
    if (await linkField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await linkField.scrollIntoViewIfNeeded();
        await fillFieldWithDelay(linkField, 'https://www.youtube.com/results?search_query=seksaatech');
    }

    // Upload Thumbnail
    await uploadThumbnail(page);
    await page.waitForTimeout(1000);

    // Click "Next" button instead of Create/Submit
    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeVisible();
    await nextButton.scrollIntoViewIfNeeded();
    await nextButton.click();

    // Interact with Module and Lessons (Step 2)
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
    
    // Submit
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /create|save|submit/i })
        .or(page.locator('button[type="submit"]'))
        .filter({ hasText: /create|save/i }).click({ force: true });
  });


    // ===================================
  // Course page
  // ===================================

    test('Course page', async ({ page }) => {
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
      
      await options.nth(1).click();

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

    // const moduleDropdown = page.locator('label:has-text("Module")').locator('..').locator('button[role="combobox"]')
    //     .or(page.locator('div').filter({ hasText: /^Module$/ }).locator('..').locator('button'))
    //     .or(page.locator('button[role="combobox"]').nth(0));
    
    // await expect(moduleDropdown).toBeVisible();
    // await moduleDropdown.click();
    // await expect(page.getByRole('option').first()).toBeVisible();
    // await page.getByRole('option').first().click();
    // await page.waitForTimeout(500);

    // const lessonsDropdown = page.locator('button[name*="lessons"]')
    //     .or(page.locator('label:has-text("Lessons")').locator('..').locator('button[role="combobox"]'))
    //     .or(page.locator('button[role="combobox"]').nth(1));

    // await expect(lessonsDropdown).toBeVisible();
    // await lessonsDropdown.click();
    
    // await page.waitForTimeout(800);

    // await page.keyboard.press('Escape');
    
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /update|Update|submit/i })
        .or(page.locator('button[type="submit"]'))
        .filter({ hasText: /update|Update/i }).click({ force: true });
      
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


