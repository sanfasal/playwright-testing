import { Page } from '@playwright/test';

/**
 * Helper function to open the actions menu (three-dot icon)
 * 
 * @param page - Playwright page object
 */
export async function openActionMenu(page: Page) {
    // Open the actions menu (three-dot icon)
    const actionsMenuButton = page.getByRole('button', { name: /more options|actions|menu/i })
      .or(page.locator('button[aria-haspopup="menu"]'))
      .or(page.locator('svg.lucide-ellipsis-vertical'))
      .first();
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
}
