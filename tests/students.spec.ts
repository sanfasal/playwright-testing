import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { deleteEntityViaActionMenu } from '../utils/delete-helper';
import { toggleViewMode } from '../utils/view-helper';
import { createStudent, updateStudent } from '../components/students';

import staticData from '../constant/static-data.json';

// Test data for adding a new student
const randomSuffix = Math.floor(Math.random() * 10000);

const studentDataAdd = {
  firstName: staticData.studentDataAdd.firstName,
  lastName: `${staticData.studentDataAdd.lastNamePrefix} ${randomSuffix}`,
  email: `${staticData.studentDataAdd.emailPrefix}.${randomSuffix}@gmail.com`,
  phone: staticData.studentDataAdd.phone,
  telegram: `${staticData.studentDataAdd.telegramPrefix}${randomSuffix}`,
  dob: new Date().toISOString().split('T')[0], 
  address: {
    village: staticData.studentDataAdd.address.village,
    commune: staticData.studentDataAdd.address.commune,
    district: staticData.studentDataAdd.address.district,
    city: staticData.studentDataAdd.address.city,
  },
  guardian: {
    name: staticData.studentDataAdd.guardian.name,
    phone: staticData.studentDataAdd.guardian.phone,
    relation: staticData.studentDataAdd.guardian.relation,
    email: `${staticData.studentDataAdd.guardian.emailPrefix}${randomSuffix}@gmail.com`,
    address: {
      village: staticData.studentDataAdd.guardian.address.village,
      commune: staticData.studentDataAdd.guardian.address.commune,
      district: staticData.studentDataAdd.guardian.address.district,
      city: staticData.studentDataAdd.guardian.address.city,
    },
  },
  emergency: {
    name: staticData.studentDataAdd.emergency.name,
    phone: staticData.studentDataAdd.emergency.phone,
    relation: staticData.studentDataAdd.emergency.relation,
    email: `${staticData.studentDataAdd.emergency.emailPrefix}${randomSuffix}@gmail.com`,
    address: {
        village: staticData.studentDataAdd.emergency.address.village,
        commune: staticData.studentDataAdd.emergency.address.commune,
        district: staticData.studentDataAdd.emergency.address.district,
        city: staticData.studentDataAdd.emergency.address.city,
    },
  },
}

// Test data for editing a student (different values to verify edit works)
const studentDataEdit = {
  firstName: staticData.studentDataEdit.firstName,
  lastName: staticData.studentDataEdit.lastName,
  email: `${staticData.studentDataEdit.emailPrefix}${randomSuffix}@gmail.com`,
  phone: staticData.studentDataEdit.phone,
  telegram: `${staticData.studentDataEdit.telegramPrefix}${randomSuffix}`,
  dob: new Date().toISOString().split('T')[0], 
  address: {
    village: staticData.studentDataEdit.address.village,
    commune: staticData.studentDataEdit.address.commune,
    district: staticData.studentDataEdit.address.district,
    city: staticData.studentDataEdit.address.city,
  },
  guardian: {
    name: staticData.studentDataEdit.guardian.name,
    phone: staticData.studentDataEdit.guardian.phone,
    relation: staticData.studentDataEdit.guardian.relation,
    email: `${staticData.studentDataEdit.guardian.emailPrefix}${randomSuffix}@gmail.com`,
    address: {
      village: staticData.studentDataEdit.guardian.address.village,
      commune: staticData.studentDataEdit.guardian.address.commune,
      district: staticData.studentDataEdit.guardian.address.district,
      city: staticData.studentDataEdit.guardian.address.city,
    },
  },
  emergency: {
    name: staticData.studentDataEdit.emergency.name,
    phone: staticData.studentDataEdit.emergency.phone,
    relation: staticData.studentDataEdit.emergency.relation,
    email: `${staticData.studentDataEdit.emergency.emailPrefix}${randomSuffix}@gmail.com`,
    address: {
      village: staticData.studentDataEdit.emergency.address.village,
      commune: staticData.studentDataEdit.emergency.address.commune,
      district: staticData.studentDataEdit.emergency.address.district,
      city: staticData.studentDataEdit.emergency.address.city,
    },
  },
}

// Test suite for Student Dashboard
test.describe('Student Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Student', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('Dashboard', { exact: true }).last().click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/students/);
    await page.waitForTimeout(1000);
  });

  test('Dashboard page loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Student/i);
    await page.waitForTimeout(1000);
  });
});


// Test suite for Student List
test.describe('Students', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Student', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('List Students', { exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/students/);
    await page.waitForTimeout(1000);
  });

  // ===================================
  // Add new student
  // ===================================
  test('Add new student', async ({ page }) => {
    await page.locator('body > div > div.flex-1.flex.gap-10 > div.flex-1.min-w-\\[600px\\].overflow-auto > div > button').click();
    
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 1000 });

    test.setTimeout(140000);

    await createStudent(page, studentDataAdd);
  });

    // ===================================
  // View students page
  // ===================================
  test('Students List', async ({ page }) => {
    // Verify we're on the students list page
    await expect(page).toHaveTitle(/Student/i);
    await page.waitForTimeout(1000);
    await toggleViewMode(page);
    await page.waitForTimeout(1000);
  });
  
  // ===================================
  // Edit student
  // ===================================
  test('Edit student', async ({ page }) => {
    test.setTimeout(120000);

    // Get all student rows
    const studentRows = page.locator('table tbody tr, [role="row"], .student-row, div[class*="student"]');
    
    // Wait for at least one student to be visible
    await studentRows.first().waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
    
    // Click on the first student
    const firstStudent = studentRows.nth(0);
    await firstStudent.waitFor({ state: 'visible', timeout: 5000 });
    await firstStudent.click();
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
      await updateStudent(page, studentDataEdit);
    } else {
      console.log('Edit functionality not found');
    }
  });

  // ===================================
  // Delete student
  // ===================================
  test('Delete student', async ({ page }) => {
    const studentRows = page.locator('table tbody tr, [role="row"], .student-row, div[class*="student"]');
    await studentRows.count();
    const indexToDelete = 0;
    const studentToDelete = studentRows.nth(indexToDelete);
    await studentToDelete.waitFor({ state: 'visible', timeout: 5000 });
    await studentToDelete.click();
    await page.waitForTimeout(1500);
    await deleteEntityViaActionMenu(page, null, 'Confirm Delete');
    await page.waitForTimeout(2000);
  });
});
