import { Page, expect } from '@playwright/test';
import { FileInput } from '../utils/form-helper';
import { uploadThumbnail } from '../utils/upload-thumbnail-helper';

export interface CourseData {
  title: string;
  duration?: string;
  prerequisite?: string;
  preparation?: string;
  purpose?: string;
  overview?: string;
  objective?: string;
  link?: string;
  subject?: string;
  level?: string;
}

/**
 * Creates a new course.
 */
export async function createCourse(page: Page, data: CourseData) {
    // 2. Wait for the General Info form (Title field) to appear
    const titleField = page.getByRole('textbox', { name: /^Title/i })
        .or(page.getByPlaceholder('Title', { exact: true }))
        .or(page.locator('input[name="title"]'))
        .first();
        
    await expect(titleField).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500); // Stability wait
    
    // Fill Title
    await FileInput(titleField, data.title);

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
    if (data.duration) {
        await FileInput(durationField, data.duration);
    }

    // 6. Fill Prerequisite (Textarea)
    const prerequisiteField = page.locator('textarea[name="prerequisite"]')
        .or(page.getByRole('textbox', { name: /^Prerequisite/i }))
        .or(page.getByPlaceholder('Prerequisite'))
        .first();
        
    if (await prerequisiteField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await prerequisiteField.scrollIntoViewIfNeeded();
        if (data.prerequisite) {
            await FileInput(prerequisiteField, data.prerequisite);
        }
    }

    // Optional: Preparation
    const preparationField = page.getByLabel(/preparation/i).or(page.getByPlaceholder(/preparation/i));
    if (await preparationField.isVisible({ timeout: 2000 }).catch(() => false)) {
        if (data.preparation) {
            await FileInput(preparationField, data.preparation);
        }
    }

    // Optional: Purpose
    const purposeField = page.getByLabel(/purpose/i).or(page.getByPlaceholder(/purpose/i));
    if (await purposeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        if (data.purpose) {
            await FileInput(purposeField, data.purpose);
        }
    }

    // Optional: Overview
    const overviewField = page.getByLabel(/overview/i).or(page.getByPlaceholder(/overview/i));
    if (await overviewField.isVisible({ timeout: 2000 }).catch(() => false)) {
        if (data.overview) {
            await FileInput(overviewField, data.overview);
        }
    }
    
    // Optional: Objective
    const objectiveField = page.getByLabel(/objective/i).or(page.getByPlaceholder(/objective/i));
    if (await objectiveField.isVisible({ timeout: 2000 }).catch(() => false)) {
        if (data.objective) {
            await FileInput(objectiveField, data.objective);
        }
    }

    // Optional: Link
    const linkField = page.getByLabel(/link/i).or(page.getByPlaceholder(/link/i));
    if (await linkField.isVisible({ timeout: 2000 }).catch(() => false)) {
        if (data.link) {
            await FileInput(linkField, data.link);
        }
    }

    // 7. Upload Thumbnail
    await uploadThumbnail(page);
    await page.waitForTimeout(1000);

    // 8. Click "Next" to go to Outline tab
    const nextButton = page.getByRole('button', { name: /next/i });
    
    // Ensure button is visible and clickable
    await expect(nextButton).toBeVisible();
    await nextButton.scrollIntoViewIfNeeded();
    await nextButton.hover();
    await page.waitForTimeout(300);
    await nextButton.click();
    
    // --- Interacting with Module and Lessons (Tab 2) ---
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

    // Select Lessons
    const lessonsDropdown = page.getByRole('combobox').filter({ hasText: /select lessons/i })
        .or(page.getByText('Select Lessons', { exact: false })).first();

    if (await lessonsDropdown.isVisible()) {
        await lessonsDropdown.click();
        
        await expect(page.getByRole('option').first()).toBeVisible({ timeout: 5000 }).catch(() => null);
        if (await page.getByRole('option').count() > 0) {
            await page.getByRole('option').first().click();
        }
        
        // Close the multi-select dropdown
        await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /create|save|submit/i })
        .or(page.locator('button[type="submit"]'))
        .filter({ hasText: /create|save/i }).click();
}

/**
 * Updates a course by filling out the form.
 * @param page - Playwright Page object
 * @param courseData - Object containing course data
 */
export async function updateCourse(page: Page, courseData: CourseData) {
      await page.waitForTimeout(1000);
      
      // Edit Title field
      const titleField = page.locator('#title').or(page.getByLabel(/title/i)).first();
      await titleField.waitFor({ state: 'visible', timeout: 5000 });
      
      if (await titleField.isVisible().catch(() => false)) {
        await titleField.clear();
        await FileInput(titleField, courseData.title);
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
           if (courseData.duration) await FileInput(durationField, courseData.duration);
      }

      // Edit Prerequisite
      const prerequisiteField = page.getByLabel(/prerequisite/i).or(page.getByPlaceholder(/prerequisite/i));
      if (await prerequisiteField.isVisible()) {
          await prerequisiteField.clear();
          if (courseData.prerequisite) await FileInput(prerequisiteField, courseData.prerequisite);
      }

      // Edit Preparation
      const preparationField = page.getByLabel(/preparation/i).or(page.getByPlaceholder(/preparation/i));
      if (await preparationField.isVisible()) {
          await preparationField.clear();
          if (courseData.preparation) await FileInput(preparationField, courseData.preparation);
      }

      // Edit Purpose
      const purposeField = page.getByLabel(/purpose/i).or(page.getByPlaceholder(/purpose/i));
      if (await purposeField.isVisible()) {
          await purposeField.clear();
          if (courseData.purpose) await FileInput(purposeField, courseData.purpose);
      }

      // Edit Overview/Description field
      const overviewField = page.locator('#overview')
          .or(page.getByLabel(/overview/i))
          .or(page.getByPlaceholder(/overview/i))
          .or(page.locator('textarea').filter({ hasText: /overview/i }).first())

      if (await overviewField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await overviewField.clear();
        if (courseData.overview) await FileInput(overviewField, courseData.overview);
      }

    // Edit Objective
      const objectiveField = page.getByLabel(/objective/i).or(page.getByPlaceholder(/objective/i));
      if (await objectiveField.isVisible()) {
          await objectiveField.clear();
          if (courseData.objective) await FileInput(objectiveField, courseData.objective);
      }
      
      // Edit Link
      const linkField = page.getByLabel(/link/i).or(page.getByPlaceholder(/link/i));
      if (await linkField.isVisible()) {
           await linkField.clear();
           if (courseData.link) await FileInput(linkField, courseData.link);
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
