import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { 
  createAttendance, 
  updateAttendance, 
  deleteAttendance,
  selectClassFilter
} from '../components/attendance';

test.describe('Attendances', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await page.waitForTimeout(1000);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 45000 });
    const attendanceLink = page.getByText('Attendance', { exact: true })
      .or(page.getByText('Attendances', { exact: true }))
      .or(page.locator('a[href*="/attendance"]')); 
    
    if (await attendanceLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await attendanceLink.click();
    }
    
    await expect(page).toHaveURL(/attendance/i);
    await page.waitForTimeout(1000);            
  });


//   ====================================== 
// Add new attendance
//   ====================================== 
  test('Add new attendance', async ({ page }) => {
    await createAttendance(page);
  });

//   ======================================
// Attendances List
//   ======================================
  test('Attendances List', async ({ page }) => {
    await expect(page).toHaveTitle(/Attendance/i);
    await selectClassFilter(page);
  });

//   ====================================== 
// Edit attendance
//   ====================================== 
  test('Edit attendance', async ({ page }) => {
    await updateAttendance(page);
  });

//   ====================================== 
// Delete attendance
//   ====================================== 
  test('Delete attendance', async ({ page }) => {
    test.setTimeout(60000);
    await deleteAttendance(page);
  });
});
