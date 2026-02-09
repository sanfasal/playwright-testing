import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { 
  createInvoice, 
  updateInvoice, 
  downloadInvoice, 
  deleteInvoice,
  printInvoice
} from '../components/invoices';
import { toggleViewMode } from '../utils/view-helper';

test.describe('Invoices Page', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await page.waitForTimeout(2000);

    // Wait for the loading screen to disappear
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 30000 });
    
    // Navigate to invoices - The "Invoice" item is a div with text, not a link
    await page.getByText('Invoice', { exact: true }).click();
    
    // Ensure we are on the invoices page before each test starts
    await expect(page).toHaveURL(/invoice/);
  });


// =======================================
// Add new invoice
// =======================================
  test('Add new invoice', async ({ page }) => {
    await createInvoice(page);
  });

  // =======================================
// Invoice List
// =======================================
  test('Invoice List', async ({ page }) => {
    await expect(page).toHaveTitle(/Invoice/i);
    await page.waitForTimeout(1000);
    await toggleViewMode(page);
    await page.waitForTimeout(1000);
  });

// =======================================
//  Edit invoice
// =======================================

test('Edit invoice', async ({ page }) => {
   await updateInvoice(page);
})

// =======================================
// Download Invoice
// =======================================
  test('Download Invoice', async ({ page }) => {
    await downloadInvoice(page);
  });

// =======================================
// Print Invoice
// =======================================
  test('Print Invoice', async ({ page }) => {
    await printInvoice(page);
  });

// =======================================
// Delete Invoice
// =======================================
test('Delete Invoice', async ({ page }) => {
    await deleteInvoice(page);
});
  
});
