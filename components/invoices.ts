import { Page, expect } from '@playwright/test';
import { FileInput } from '../utils/form-helper';
import { openActionMenu } from '../utils/action-menu-helper';
import { deleteEntityViaActionMenu } from '../utils/delete-helper';
import { toggleViewMode } from '../utils/view-helper';

export async function createInvoice(page: Page) {
    // Add new invoice
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
    const statusOptionsAdd = page.getByRole('option');
    await statusOptionsAdd.first().waitFor({ state: 'visible', timeout: 5000 });
    await statusOptionsAdd.first().click();
    
    // Fill Due Date
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    
    const dueDateInput = page.getByLabel(/Due Date/i);
    await dueDateInput.click();
    await page.waitForTimeout(200);
    await dueDateInput.fill(formattedDate);
    await page.waitForTimeout(300);
    
    // Fill Amount
    await FileInput(page.getByLabel(/Amount \(\$\)/i), '500');
    
    // Fill Discount (optional field)
    await FileInput(page.getByLabel(/Discount \(\$\)/i), '50');

    // Select reference - only if items exist
    await page.getByText('Select referent', { exact: true }).click();
    await page.waitForTimeout(300); // Small delay for dropdown to open
    const referenceOptions = page.getByRole('option');
    
    // Check if there are any options available
    const referenceCount = await referenceOptions.count();
    if (referenceCount > 0) {
      await referenceOptions.first().waitFor({ state: 'visible', timeout: 5000 });
      await referenceOptions.first().click();
    } else {
      // No options available, close the dropdown
      await page.keyboard.press('Escape');
    }
    // Fill Note (optional textarea)
    await FileInput(page.getByLabel(/Note/i), 'Test invoice note');
    
    // Submit the form by clicking the Create button
    await page.getByRole('button', { name: /Create/i }).click();
}

export async function updateInvoice(page: Page) {
    // Invoice List or Grid view
    await toggleViewMode(page);
    
    // Update Invoice
    await page.waitForTimeout(1000);
    const invoiceRows = page.locator('table tbody tr, [role="row"], .invoice-row');

    // Get the invoice at index 0 (first invoice)
    const invoiceAtIndex0 = invoiceRows.nth(0);
    await invoiceAtIndex0.click();
    await page.waitForTimeout(1500);

    // Open the actions menu (three-dot icon)
    await openActionMenu(page);
    
    // Wait for the dropdown/menu to appear
    const editOption = page.getByRole('menuitem', { name: /Edit|Update/i }).or(page.getByText(/Edit|Update/i));
    await expect(editOption.first()).toBeVisible();
    await editOption.first().click();
    await page.waitForTimeout(1000);

    await page.getByText(/^Select Status/).last().click({ force: true });
    await page.waitForTimeout(1000); 
    const statusOptionsEdit = page.getByRole('option');
    await statusOptionsEdit.first().waitFor({ state: 'visible', timeout: 5000 });
    
    await statusOptionsEdit.nth(1).click().catch(() => statusOptionsEdit.first().click());

    await page.getByRole('button', { name: /Update/i }).click();
    await page.waitForTimeout(1000);
}

export async function downloadInvoice(page: Page) {
    // Download Invoice
    await page.waitForTimeout(1000);
    const invoiceRows = page.locator('table tbody tr, [role="row"], .invoice-row');
    
    // Ensure we have rows
    await expect(invoiceRows.first()).toBeVisible({ timeout: 5000 });

    const invoiceAtIndex0 = invoiceRows.nth(0);
    await invoiceAtIndex0.click();
    await page.waitForTimeout(1500);
    
    // Verify the Download PDF button is visible and click it
    const downloadButton = page.getByRole('button', { name: /Download PDF/i });
    await expect(downloadButton).toBeVisible({ timeout: 5000 });
    await downloadButton.click();
    
    // Wait for download to initiate
    await page.waitForTimeout(2000);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Navigate back to invoice list
    const backButton = page.locator('button:has(svg.lucide-arrow-left)')
      .or(page.locator('svg.lucide-arrow-left').locator('xpath=..'))
      .or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-arrow-left"]') }))
      .or(page.locator('button[aria-label*="back" i]'))
      .or(page.getByRole('button', { name: /Back|back/i }));
    
    if (await backButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await backButton.first().waitFor({ state: 'visible', timeout: 5000 });
      await backButton.first().scrollIntoViewIfNeeded();
      await backButton.first().click();
      await page.waitForTimeout(1500);
    }
}

export async function deleteInvoice(page: Page) {
    const invoiceRowsToDelete = page.locator('table tbody tr, [role="row"], .invoice-item, div[class*="invoice"]');
    const indexToDelete = 0;
    const invoiceToDelete = invoiceRowsToDelete.nth(indexToDelete);
    
    await deleteEntityViaActionMenu(page, invoiceToDelete, 'Confirm Delete');
}

export async function printInvoice(page: Page) {
    // Verify we're on the invoices page
    await expect(page).toHaveTitle(/Invoice/i);
    
    // Handle view toggle buttons (grid/list view) before accessing invoice rows
    await page.waitForTimeout(1000);

    const invoiceRows = page.locator('table tbody tr, [role="row"], .invoice-row');
    
    // Ensure we have rows
    await expect(invoiceRows.first()).toBeVisible({ timeout: 5000 });

    const invoiceAtIndex1 = invoiceRows.nth(0);
    await invoiceAtIndex1.click();
    await page.waitForTimeout(1500);
    
    const printButton = page.getByRole('button', { name: /Print Invoice/i });
    await expect(printButton).toBeVisible({ timeout: 10000 });
    
    // Prepare for the print action verification
    await page.evaluate(() => {
        // @ts-ignore
        window.printCalled = false;
        // @ts-ignore
        window.print = () => { window.printCalled = true; };
    });

    await printButton.click();
    
    // Wait for prompt/action to handle
    await page.waitForTimeout(5000);

    // Close the print dialog/preview by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
}
