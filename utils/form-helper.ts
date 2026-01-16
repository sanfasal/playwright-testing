import { Locator } from '@playwright/test';

/**
 * Fills a form field with realistic typing delays
 * @param field - The Playwright locator for the field
 * @param value - The text to type into the field
 * @param options - Optional configuration for delays
 */
export async function fillFieldWithDelay(
  field: Locator,
  value: string,
  options?: {
    clickDelay?: number;      // Delay after clicking the field (default: 300ms)
    typingDelay?: number;     // Delay between each character (default: 80ms)
    afterTypingDelay?: number; // Delay after typing completes (default: 500ms)
  }
) {
  const {
    clickDelay = 300,
    typingDelay = 80,
    afterTypingDelay = 200
  } = options || {};

  await field.click();
  await field.page().waitForTimeout(clickDelay);
  await field.pressSequentially(value, { delay: typingDelay });
  await field.page().waitForTimeout(afterTypingDelay);
}

/**
 * Verifies that the password visibility toggle works for a given field
 * Assumes the toggle icon is a sibling or in the immediate parent container
 * @param field - The password input locator
 */
export async function verifyPasswordToggle(field: Locator) {
  const page = field.page();
  // Try to find the icon container relative to the field
  // We look up to 2 levels to find the container with the icon
  const maxLevels = 2;
  let container = field;
  let eyeOffIcon: Locator | null = null;

  for (let i = 0; i < maxLevels; i++) {
    container = container.locator('xpath=..');
    const icon = container.locator('.lucide-eye-off');
    if (await icon.count() > 0) {
      eyeOffIcon = icon.first();
      break;
    }
  }

  if (eyeOffIcon) {
    // Click to show password
    await eyeOffIcon.click();
    await page.waitForTimeout(800);
    
    // Now find the 'eye' icon in the same container to hide it
    // Note: The icon selector changes from eye-off to eye
    await container.locator('.lucide-eye').first().click();
    await page.waitForTimeout(800);
  } else {
    console.warn('Password toggle icon not found for field');
  }
}
