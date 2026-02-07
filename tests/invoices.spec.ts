import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';
import { FileInput } from '../utils/form-helper';
import { toggleViewMode } from '../utils/view-helper';
import { deleteItem } from '../utils/delete-helper';
import { openActionMenu } from '../utils/action-menu-helper';

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
    // Click the add button using the specific CSS selector
    await page.locator('#add-invoice-button').click();
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    
    // Select Student - wait for dropdown to be ready and select first option
    await page.getByText('Select Student', { exact: true }).click();
    await page.waitForTimeout(300); // Small delay for dropdown to open
    const studentOptions = page.getByRole('option');
    await studentOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    await studentOptions.first().click();
    
    // Select Class - wait for dropdown to be ready and select first option
    await page.getByText('Select Class', { exact: true }).click();
    await page.waitForTimeout(300); // Small delay for dropdown to open
    const classOptions = page.getByRole('option');
    await classOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    await classOptions.first().click();
    
    // Select Status - wait for dropdown to be ready and select first option
    await page.getByText('Select Status', { exact: true }).click();
    await page.waitForTimeout(300); // Small delay for dropdown to open
    const statusOptions = page.getByRole('option');
    await statusOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    await statusOptions.first().click();
    
    // Fill Due Date
    await FileInput(page.getByLabel(/Due Date/i), '2026-01-14');
    
    // Fill Amount
    await FileInput(page.getByLabel(/Amount \(\$\)/i), '500');
    
    // Fill Discount (optional field)
    await FileInput(page.getByLabel(/Discount \(\$\)/i), '50');

    // Select reference
    await page.getByText('Select referent', { exact: true }).click();
    await page.waitForTimeout(300); // Small delay for dropdown to open
    const referenceOptions = page.getByRole('option');
    await referenceOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    await referenceOptions.first().click();
    
    
    // Fill Note (optional textarea)
    await FileInput(page.getByLabel(/Note/i), 'Test invoice note');
    
    // Submit the form by clicking the Create button
    await page.getByRole('button', { name: /Create/i }).click();
    
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
    await expect(page).toHaveTitle(/Invoice/i);
    await page.waitForTimeout(1000);

    const invoiceRows = page.locator('table tbody tr, [role="row"], .invoice-row');

    // Get the invoice at index 1 (second invoice)
    const invoiceAtIndex1 = invoiceRows.nth(0);
    await invoiceAtIndex1.click();
    await page.waitForTimeout(1000);
    
        // Open the actions menu (three-dot icon)
        await openActionMenu(page);
    // Wait for the dropdown/menu to appear
    const editOption = page.getByRole('menuitem', { name: /Edit|Update/i }).or(page.getByText(/Edit|Update/i));
    await expect(editOption.first()).toBeVisible();
    await editOption.first().click();
    await page.waitForTimeout(1000);

    await page.getByText(/^Select Status/).last().click({ force: true });
    await page.waitForTimeout(1000); 
    const statusOptions = page.getByRole('option');
    await statusOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    
    await statusOptions.nth(1).click().catch(() => statusOptions.first().click());

    await page.getByRole('button', { name: /Update/i }).click();
    await page.waitForTimeout(1000);
})

// =======================================
// Download Invoice
// =======================================
  test('Download Invoice', async ({ page }) => {
    await expect(page).toHaveTitle(/Invoice/i);
    
    await page.waitForTimeout(1000);
    
    const invoiceRows = page.locator('table tbody tr, [role="row"], .invoice-row');
    
    // Get the invoice at index 1 (second invoice)
    const invoiceAtIndex1 = invoiceRows.nth(0);
    await invoiceAtIndex1.click();
    await page.waitForTimeout(1500);
    
    // Verify the Download PDF button is visible and click it
    const downloadButton = page.getByRole('button', { name: /Download PDF/i });
    await expect(downloadButton).toBeVisible({ timeout: 5000 });
    await downloadButton.click();
    
    // Wait for download to initiate
    await page.waitForTimeout(2000);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

  });

// =======================================
// Print Invoice
// =======================================
  test('Print Invoice', async ({ page }) => {
    // Verify we're on the invoices page
    await expect(page).toHaveTitle(/Invoice/i);
    
    // Handle view toggle buttons (grid/list view) before accessing invoice rows
    await page.waitForTimeout(1000);

    const invoiceRows = page.locator('table tbody tr, [role="row"], .invoice-row');
    const invoiceAtIndex1 = invoiceRows.nth(0);
    await invoiceAtIndex1.click();
    await page.waitForTimeout(1500);
    
    const printButton = page.getByRole('button', { name: /Print Invoice/i });
    await expect(printButton).toBeVisible({ timeout: 5000 });
    
    // Prepare for the print action verification
    // Mocking window.print to set a flag we can verify
    await page.evaluate(() => {
        // @ts-ignore
        window.printCalled = false;
        // @ts-ignore
        window.print = () => { window.printCalled = true; };
    });

    await printButton.click();
    
    // Wait for prompt/action to handle (matching Download Invoice flow)
    await page.waitForTimeout(2000);

    // Close the print dialog/preview by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

// =======================================
// Delete Invoice
// =======================================
test('Delete Invoice', async ({ page }) => {
    await expect(page).toHaveTitle(/Invoice/i);
    await page.waitForTimeout(1000);

    const invoiceRows = page.locator('table tbody tr, [role="row"], .invoice-row');
    
    // Get the invoice at index 1 (second invoice)
    const invoiceAtIndex1 = invoiceRows.nth(0);
    await invoiceAtIndex1.click();
    await page.waitForTimeout(1500);

    const actionMenuBtn = page.locator('button').filter({ 
        has: page.locator('svg.lucide-ellipsis, svg.lucide-ellipsis-vertical, svg.lucide-more-vertical, svg.lucide-more-horizontal') 
    }).last();

    await expect(actionMenuBtn).toBeVisible({ timeout: 5000 });
    await actionMenuBtn.click();


    // Wait for the dropdown/menu to appear
    const editOption = page.getByRole('menuitem', { name: /Delete|Remove/i }).or(page.getByText(/Delete|Remove/i));
    await expect(editOption.first()).toBeVisible();
    await editOption.first().click();
    await page.waitForTimeout(1000);
    
    // confirm delete
    await deleteItem(page);
});
  
});
