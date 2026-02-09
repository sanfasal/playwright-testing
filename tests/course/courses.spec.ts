import { test, expect } from '@playwright/test';
import { login } from '../../utils/auth-helper';
import { addCursorTracking } from '../../utils/cursor-helper';
import { FileInput } from '../../utils/form-helper';
import { deleteEntityViaActionMenu } from '../../utils/delete-helper';
import { toggleViewMode } from '../../utils/view-helper';
import { uploadThumbnail } from '../../utils/upload-thumbnail-helper';
import { openActionMenu } from '../../utils/action-menu-helper';
import staticData from '../../constant/static-data.json';
import { createCourse, updateCourse } from '../../components/courses';

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
    
    // Call the helper function
    await createCourse(page, staticData.courseDataAdd);
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

    // click on icon three dot
    await openActionMenu(page);
    
    const editButton = page.getByRole('menuitem', { name: /Edit/i }).or(page.getByRole('button', { name: /Edit/i }));
    
    if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editButton.click({ force: true });
      await updateCourse(page, staticData.courseDataEdit);
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


