import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { FileInput } from '../utils/form-helper';

test.describe('Contacts Page', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Contact', { exact: true }).click();
    await expect(page).toHaveURL(/contacts/);
  });

  test('Contact page', async ({ page }) => {
    await expect(page).toHaveTitle(/Contact/i);
  });

  test('Add new contact', async ({ page }) => {
    await page.locator('body > div > div.flex-1.flex.gap-10 > div.flex-1.min-w-\\[600px\\].overflow-auto > div > button').click();
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    await page.waitForTimeout(500);
    const nameField = page.getByRole('textbox').nth(0);
    await FileInput(nameField, 'Test Contact');
    
    const telField = page.getByRole('textbox').nth(1);
    await FileInput(telField, '1234567890');
    
    const emailField = page.getByRole('textbox').nth(2);
    await FileInput(emailField, 'test@example.com');

    const dateField = page.getByRole('textbox').nth(3);
    await FileInput(dateField, '2026-01-14');

    const noteField = page.getByRole('textbox').nth(4);
    await FileInput(noteField, 'This is a test contact note');
    await page.getByRole('button', { name: /Add/i }).click();
  });
});
