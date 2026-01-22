import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { fillFieldWithDelay } from '../utils/form-helper';

// Test suite for Engagement Dashboard
test.describe('Engagement Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Engagement', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('Dashboard', { exact: true }).last().click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/engagements');
    await page.waitForTimeout(1000);
  });

  test('Dashboard page loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
  });
});


// Test suite for Engagement List
test.describe('Engagement List', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    
    // Verify we are on dashboard
    await expect(page).toHaveURL(/dashboard/);

    // Wait for the loading screen to disappear
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    
    // Click on Engagement to open dropdown menu
    await page.getByText('Engagement', { exact: true }).click();
    await page.waitForTimeout(500);
    
    // Click on "List Engagements" from the dropdown
    await page.getByText('List Engagements', { exact: true }).click();
    await page.waitForTimeout(500);
    
    // Ensure we are on the engagement list page
    await expect(page).toHaveURL(/\/engagements/);
    
    // Slow down for better visibility
    await page.waitForTimeout(1000);
  });

  test('Engagement List Page', async ({ page }) => {
    // Verify we're on the engagements list page
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(500);
   
    // === SEARCH FOR THE ENGAGEMENT ===
    const searchButton = page.getByRole('button', { name: 'Search...' });
    await expect(searchButton).toBeVisible({ timeout: 5000 });
    await searchButton.click();
    await page.waitForTimeout(500);
    
    // Find and use the search input field
    const searchInput = page.getByRole('textbox').filter({ hasText: '' })
      .or(page.getByPlaceholder(/search/i));
    await expect(searchInput).toBeVisible({ timeout: 3000 });
    
    // Type search query with realistic delay
    await fillFieldWithDelay(searchInput, 'Seksaa', {
      typingDelay: 80,
      afterTypingDelay: 1200
    });
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);

    // === OPEN ADD ENGAGEMENT DRAWER ===
    const addButton = page.getByRole('button', { name: /Add|Plus|\+/i }).first();
    await expect(addButton).toBeVisible({ timeout: 5000 });
    await addButton.click();
    await page.waitForTimeout(800);
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    await page.waitForTimeout(500);
    
    // Fill First Name
    const firstNameField = page.getByLabel(/First Name/i);
    await fillFieldWithDelay(firstNameField, 'John', {
      typingDelay: 50,
      afterTypingDelay: 400
    });
    
    // Fill Last Name
    const lastNameField = page.getByLabel(/Last Name/i);
    await fillFieldWithDelay(lastNameField, 'Doe', {
      typingDelay: 50,
      afterTypingDelay: 400
    });
    
    // Fill Amount
    const amountField = page.getByLabel(/Amount \(\$\)/i);
    await fillFieldWithDelay(amountField, '5000', {
      typingDelay: 50,
      afterTypingDelay: 400
    });
    
    // Fill Email
    const emailField = page.getByLabel(/Email/i);
    await fillFieldWithDelay(emailField, 'john.doe@example.com', {
      typingDelay: 40,
      afterTypingDelay: 400
    });
    
    // Fill Phone
    const phoneField = page.getByLabel(/Phone/i);
    await fillFieldWithDelay(phoneField, '1234567890', {
      typingDelay: 50,
      afterTypingDelay: 400
    });
    
    // Submit the form
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);
    
    // Verify the engagement was created (drawer should close)
    const firstTextbox = page.getByRole('textbox').first();
    await expect(firstTextbox).toBeHidden({ timeout: 5000 });
    await page.waitForTimeout(500);
  });
});
