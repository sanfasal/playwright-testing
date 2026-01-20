import { Page } from '@playwright/test';

/**
 * Helper function to toggle between grid and list views
 * Tries to click both grid and list view buttons to ensure the view is toggled
 * 
 * @param page - Playwright page object
 * @returns Promise<boolean> - true if any view button was clicked
 */
export async function toggleViewMode(page: Page): Promise<boolean> {
  // Method 1: Try using JavaScript to add IDs
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn) => {
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
      clicked = true;
    }
    
    const listSvg = page.locator('svg.lucide-list').first();
    if (await listSvg.isVisible({ timeout: 1000 }).catch(() => false)) {
      await listSvg.click();
      await page.waitForTimeout(800);
      clicked = true;
    }
  }
  
  return clicked;
}
