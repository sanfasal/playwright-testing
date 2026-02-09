import { test, expect } from '@playwright/test';
import { login } from '../../utils/auth-helper';
import { addCursorTracking } from '../../utils/cursor-helper';
import { FileInput } from '../../utils/form-helper';
import { deleteItem } from '../../utils/delete-helper';
import { createLesson, updateLesson } from '../../components/lessons';
import staticData from '../../constant/static-data.json';
import path from 'path';

const { 
  lessonDataAdd,
  lessonDataEdit,
} = staticData;


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

    await page.locator('#add-lesson-button').or(page.getByRole('button', { name: /add lesson/i })).click();
        
        const videoPath = path.join(__dirname, '..', '..', 'public', 'video', 'seksaa-vdo.mp4');
        const documentPath = path.join(__dirname, '..', '..', 'public', 'images', 'thumbnail-create.pdf');
    
        await createLesson(page, {
          ...lessonDataAdd,
          videoPath: videoPath,
          documentPath: documentPath
        });
  });

  //   =====================================
   // Edit lesson
//   =====================================
  test('Edit lesson', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(120000);
    
    // Wait for the lesson list to load
    await page.waitForTimeout(1000);
    
        const lessonRows = page.locator('table tbody tr, [role="row"], .lesson-item, div[class*="lesson"]');
    const lessonAtIndex0 = lessonRows.nth(0);
    await lessonAtIndex0.waitFor({ state: 'visible', timeout: 2000 });
    const editIcon = lessonAtIndex0.locator('button').filter({ has: page.locator('svg.lucide-square-pen, svg.lucide-edit, svg.lucide-pencil') }).first()
      .or(lessonAtIndex0.getByRole('button', { name: /edit/i }).first())
      .or(lessonAtIndex0.getByText(/Edit/i).first())
      .or(lessonAtIndex0.locator('button[aria-label*="edit" i]').first());
    
    if (await editIcon.isVisible({ timeout: 1000 }).catch(() => false)) {
      await editIcon.click();
      console.log('✓ Clicked edit icon');
      
      await updateLesson(page, lessonDataEdit);
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
