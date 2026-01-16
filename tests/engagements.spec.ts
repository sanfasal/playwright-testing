import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';

// Test suite for Engagement Dashboard
test.describe('Engagement Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    
    // Verify we are on dashboard
    await expect(page).toHaveURL(/dashboard/);

    // Wait for the loading screen to disappear
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    
    // Navigate to engagement dashboard using direct URL
    const baseUrl = page.url().match(/^https?:\/\/[^\/]+/)?.[0];
    await page.goto(`${baseUrl}/engagements`);
    
    // Ensure we are on the engagement dashboard before each test starts
    await expect(page).toHaveURL(/\/engagements$/);
    
    // Slow down for better visibility
    await page.waitForTimeout(1000);
  });

  test('Dashboard page loads correctly', async ({ page }) => {
    // Verify we're on the engagement dashboard
    await expect(page).toHaveTitle(/Engagement/i);
  });

  // Add more dashboard-specific tests here
});



// Test suite for List Engagements
test.describe('List Engagements', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    
    // Verify we are on dashboard
    await expect(page).toHaveURL(/dashboard/);

    // Wait for the loading screen to disappear
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    
    // Navigate to engagements list page using direct URL
    const baseUrl = page.url().match(/^https?:\/\/[^\/]+/)?.[0];
    await page.goto(`${baseUrl}/engagements/list`);
    
    // Ensure we are on the engagements list page before each test starts
    await expect(page).toHaveURL(/engagements\/list/);
    
    // Slow down for better visibility
    await page.waitForTimeout(1000);
  });

  test('Engagement List Page', async ({ page }) => {
    // Verify we're on the engagements list page
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(500);
   
    // === SEARCH FOR THE ENGAGEMENT ===
    // Look for the search button
    const searchButton = page.getByRole('button', { name: 'Search...' });
    
    // Wait for search button to be visible
    await expect(searchButton).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(300);
    
    // Click on the search button
    await searchButton.click();
    await page.waitForTimeout(500);
    
    // Now find the actual search input field that appears after clicking
    const searchInput = page.getByRole('textbox').filter({ hasText: '' }).or(page.getByPlaceholder(/search/i));
    await expect(searchInput).toBeVisible({ timeout: 3000 });
    await page.waitForTimeout(300);
    
    // Type search query
    await searchInput.fill('Seksaa');
    await page.waitForTimeout(1200);
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);

    // === CLICK PLUS ICON TO OPEN ADD ENGAGEMENT DRAWER ===
    // Look for the plus/add button (could be an icon button)
    const addButton = page.getByRole('button', { name: /Add|Plus|\+/i }).first();
    
    // Wait for add button to be visible
    await expect(addButton).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(300);
    
    // Click the plus icon to open the drawer
    await addButton.click();
    await page.waitForTimeout(800);
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 9000 });
    await page.waitForTimeout(500);
    
    // Fill First Name
    await page.getByLabel(/First Name/i).click();
    await page.waitForTimeout(200);
    await page.getByLabel(/First Name/i).fill('John');
    await page.waitForTimeout(400);
    
    // Fill Last Name
    await page.getByLabel(/Last Name/i).click();
    await page.waitForTimeout(200);
    await page.getByLabel(/Last Name/i).fill('Doe');
    await page.waitForTimeout(400);
    
    // Fill Amount
    await page.getByLabel(/Amount \(\$\)/i).click();
    await page.waitForTimeout(200);
    await page.getByLabel(/Amount \(\$\)/i).fill('5000');
    await page.waitForTimeout(400);
    
    // Fill Email
    await page.getByLabel(/Email/i).click();
    await page.waitForTimeout(200);
    await page.getByLabel(/Email/i).fill('john.doe@example.com');
    await page.waitForTimeout(400);
    
    // Fill Phone
    await page.getByLabel(/Phone/i).click();
    await page.waitForTimeout(200);
    await page.getByLabel(/Phone/i).fill('1234567890');
    await page.waitForTimeout(400);
    
    // Submit the form by clicking the Create button
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForTimeout(1500);
    
    // Verify the engagement was created (drawer should close)
    const firstTextbox = page.getByRole('textbox').first();
    await expect(firstTextbox).toBeHidden({ timeout: 5000 });
    await page.waitForTimeout(500);

  });
});
