import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { deleteEntityViaActionMenu } from '../utils/delete-helper';
import { createCoach, updateCoach } from '../components/coaches';
import staticData from '../constant/static-data.json';
import { toggleViewMode } from '../utils/view-helper';
// Test data for adding a new student
const randomSuffix = Math.floor(Math.random() * 10000);

// Test data for adding a new coach
const coachDataAdd = {
  ...staticData.coachDataAdd,
  email: `${staticData.coachDataAdd.emailPrefix}${randomSuffix}@gmail.com`,
  dob: new Date().toISOString().split("T")[0],
}

// Test data for editing a coach (different values to verify edit works)
const coachDataEdit = {
  ...staticData.coachDataEdit,
  email: `${staticData.coachDataEdit.emailPrefix}${randomSuffix}@gmail.com`,
}

// Test suite for Coach List
test.describe('Coaches', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    
    // Verify we are on dashboard
    await expect(page).toHaveURL(/dashboard/);

    // Wait for the loading screen to disappear
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    
    // Click on Coach to navigate to Coaches page
    await page.getByText('Coach', { exact: true }).click();
    await expect(page).toHaveURL(/\/coaches/);
    await page.waitForTimeout(1000);
  });

// ===================================
  test('Add new coach', async ({ page }) => {
    test.setTimeout(120000); // 3 minutes for complex multi-tab form
    
    // Click Add button
    await page.getByRole('button').filter({ has: page.locator('svg.lucide-plus') }).click();
    
    await createCoach(page, coachDataAdd);
  });

    // ===================================
  test('Coach List', async ({ page }) => {
    await expect(page).toHaveTitle(/Coach/i);
    await page.waitForTimeout(1000);
    await toggleViewMode(page);
    await page.waitForTimeout(1000);
  });
  
  // ===================================
  // Edit coach
  // ===================================
  test('Edit coach', async ({ page }) => {
    // Set longer timeout for this complex form
    test.setTimeout(120000); // 2 minutes

    // Get all coach rows
    const coachRows = page.locator('table tbody tr, [role="row"], .coach-row, div[class*="coach"]');
    
    // Wait for at least one coach to be visible
    await coachRows.first().waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
    
    // Click on the first coach
    const firstCoach = coachRows.nth(0);
    await firstCoach.waitFor({ state: 'visible', timeout: 5000 });
    await firstCoach.click();
    await page.waitForTimeout(1500);
    
    // Open the actions menu (three-dot icon)
    const actionsMenuButton = page.locator('button:has(svg.lucide-ellipsis-vertical)')
      .or(page.getByRole('button', { name: /more options|actions|menu/i }))
      .or(page.locator('button[aria-haspopup="menu"]'))
      .or(page.locator('svg.lucide-ellipsis-vertical'))
      .first();
    
    await actionsMenuButton.waitFor({ state: 'visible', timeout: 5000 });
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
    
    // Look for Edit button in the dropdown menu
    const editButton = page.getByRole('menuitem', { name: /Edit/i })
      .or(page.getByRole('button', { name: /Edit/i }));
    
    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editButton.click();
      await updateCoach(page, coachDataEdit);
      await page.waitForTimeout(2000);
      
      // Target the button containing the lucide-arrow-left SVG
      const backButton = page.locator('button:has(svg.lucide-arrow-left)')
        .or(page.locator('svg.lucide-arrow-left').locator('xpath=..'))
        .or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-arrow-left"]') }))
        .or(page.locator('button[aria-label*="back" i]'))
        .or(page.getByRole('button', { name: /Back|back/i }));
      
      await backButton.first().waitFor({ state: 'visible', timeout: 5000 });
      await backButton.first().scrollIntoViewIfNeeded();
      await backButton.first().click();
      await page.waitForTimeout(1500);
    }
  });

  // ===================================
  // Delete coach
  // ===================================
  test('Delete coach', async ({ page }) => {
    // Get all coach rows
    const coachRows = page.locator('table tbody tr, [role="row"], .coach-row, div[class*="coach"]');
    
    // Wait for at least one coach to be visible
    await coachRows.first().waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
    
    // Click on the first coach
    const firstCoach = coachRows.nth(0);
    await firstCoach.waitFor({ state: 'visible', timeout: 5000 });
    await firstCoach.click();
    await page.waitForTimeout(1500);
    
    // Use the delete helper function
    await deleteEntityViaActionMenu(page);
    await page.waitForTimeout(2000);
  });
});
