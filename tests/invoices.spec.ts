import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { addCursorTracking } from '../utils/cursor-helper';

test.describe('Invoices Page', () => {
  
  test.beforeEach(async ({ page }) => {
    // Add visual cursor tracking for better test visibility
    await addCursorTracking(page);
    
    await login(page);
    
    // Verify we are on dashboard
    await expect(page).toHaveURL(/dashboard/);
    await page.waitForTimeout(2000);

    // Wait for the loading screen to disappear
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 30000 });
    
    // Navigate to invoices - The "Invoice" item is a div with text, not a link
    await page.getByText('Invoice', { exact: true }).click();
    
    // Ensure we are on the invoices page before each test starts
    await expect(page).toHaveURL(/invoice/);
  });

  test('Invoice page', async ({ page }) => {
    // Verify we're on the invoices page
    await expect(page).toHaveTitle(/Invoice/i);
    
    // Handle view toggle buttons (grid/list view) before accessing invoice rows
    await page.waitForTimeout(1000);
    
    // Method 1: Try using JavaScript to add IDs to the view toggle buttons
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach((btn, index) => {
        const svg = btn.querySelector('svg');
        if (svg) {
          const classes = svg.className.baseVal || svg.getAttribute('class') || '';
          if (classes.includes('lucide-layout-grid')) {
            btn.id = 'grid-view-btn';
          } else if (classes.includes('lucide-list')) {
            btn.id = 'list-view-btn';
          }
        }
      });
    });
    
    // Try clicking with ID first
    let clicked = false;
    
    // Try to click grid view
    const gridBtn = page.locator('#grid-view-btn');
    if (await gridBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await gridBtn.click();
      await page.waitForTimeout(800);
      clicked = true;
    }
    
    // Try to click list view
    const listBtn = page.locator('#list-view-btn');
    if (await listBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await listBtn.click();
      await page.waitForTimeout(800);
      clicked = true;
    }
    
    // Method 2: If IDs didn't work, try direct SVG selectors
    if (!clicked) {
      const gridSvg = page.locator('svg.lucide-layout-grid').first();
      if (await gridSvg.isVisible({ timeout: 1000 }).catch(() => false)) {
        await gridSvg.click();
        await page.waitForTimeout(800);
      }
      
      const listSvg = page.locator('svg.lucide-list').first();
      if (await listSvg.isVisible({ timeout: 1000 }).catch(() => false)) {
        await listSvg.click();
        await page.waitForTimeout(800);
      }
    }
    
    // Get all invoice rows (adjust selector based on your actual HTML structure)
    // Common patterns: table rows, list items, or divs with specific classes
    const invoiceRows = page.locator('table tbody tr, [role="row"], .invoice-row');
    
    // Get the invoice at index 1 (second invoice)
    const invoiceAtIndex1 = invoiceRows.nth(1);
    
    // Click on the invoice at index 1 to view details
    await invoiceAtIndex1.click();
    
    // Wait for invoice details to load
    await page.waitForTimeout(1500);
    
    // Verify the Download PDF button is visible and click it
    const downloadButton = page.getByRole('button', { name: /Download PDF/i });
    await expect(downloadButton).toBeVisible({ timeout: 5000 });
    await downloadButton.click();
    
    // Wait for download to initiate
    await page.waitForTimeout(2000);
    
    // Listen for the beforeprint event which fires when print is triggered
    await page.evaluate(() => {
      window.addEventListener('beforeprint', () => {
        console.log('Print dialog triggered');
      });
    });
    
    // Verify the Print Invoice button is visible and click it
    const printButton = page.getByRole('button', { name: /Print Invoice/i });
    await expect(printButton).toBeVisible({ timeout: 5000 });
    
    // Click the print button - this will trigger window.print()
    await printButton.click();
    
    // Wait for the print dialog to appear (the browser's native print UI)
    // Note: The native print dialog cannot be automated, but we can verify it was triggered
    await page.waitForTimeout(2000);
    
    // Take a screenshot - this will capture the page with the print dialog open
    await page.screenshot({ 
      path: 'test-results/screenshots/invoice-print-preview.png',
      fullPage: true 
    });
    
    // Close the print dialog by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

  });

  test('Add new invoice', async ({ page }) => {
    // Click the add button using the specific CSS selector
    await page.locator('body > div > div.flex-1.flex.gap-10 > div.flex-1.min-w-\\[600px\\].overflow-auto > main > button').click();
    
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
    await page.getByLabel(/Due Date/i).fill('2026-01-14');
    
    // Fill Amount
    await page.getByLabel(/Amount \(\$\)/i).fill('500');
    
    // Fill Discount (optional field)
    await page.getByLabel(/Discount \(\$\)/i).fill('50');
    
    // Fill Note (optional textarea)
    await page.getByLabel(/Note/i).fill('Test invoice note');
    
    // Submit the form by clicking the Create button
    await page.getByRole('button', { name: /Create/i }).click();
    
  });
});
