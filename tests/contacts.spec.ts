import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';

test.describe('Contacts Page', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    
    // Verify we are on dashboard
    await expect(page).toHaveURL(/dashboard/);

    // Wait for the loading screen to disappear
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    
    // Navigate to contacts - The "Contact" item is a div with text, not a link
    await page.getByText('Contact', { exact: true }).click();
    
    // Ensure we are on the contacts page before each test starts
    await expect(page).toHaveURL(/contacts/);
  });

  test('Contact page', async ({ page }) => {
    // Verify we're on the contacts page
    await expect(page).toHaveTitle(/Contact/i);
  });

  test('Add new contact', async ({ page }) => {
    // Click the add button
    await page.locator('body > div > div.flex-1.flex.gap-10 > div.flex-1.min-w-\\[600px\\].overflow-auto > div > button').click();
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    
    // Small delay to ensure form is fully rendered
    await page.waitForTimeout(500);
    
    // Fill Name - using nth(0) for first textbox
    const nameField = page.getByRole('textbox').nth(0);
    await nameField.click();
    await nameField.fill('Test Contact');
    
    // Fill Tel - using nth(1) for second textbox
    const telField = page.getByRole('textbox').nth(1);
    await telField.click();
    await telField.fill('1234567890');
    
    // Fill Email - using nth(2) for third textbox
    const emailField = page.getByRole('textbox').nth(2);
    await emailField.click();
    await emailField.fill('test@example.com');
    
    // Fill Select date (date picker) - using nth(3) for fourth textbox
    const dateField = page.getByRole('textbox').nth(3);
    await dateField.click();
    await dateField.fill('2026-01-14');
    
    // Fill Type something... (textarea)
    const noteField = page.getByRole('textbox').nth(4);
    await noteField.click();
    await noteField.fill('This is a test contact note');
    
    // Submit the form by clicking the Add button
    await page.getByRole('button', { name: /Add/i }).click();
  });
});
