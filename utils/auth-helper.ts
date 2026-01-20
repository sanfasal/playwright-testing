import { Page } from '@playwright/test';
import { addCursorTracking } from './cursor-helper';
import { fillFieldWithDelay } from './form-helper';

export async function login(page: Page) {
  await addCursorTracking(page);
  
  await page.goto('/signin');
  await page.waitForTimeout(50); 
  
  const emailField = page.getByRole('textbox', { name: /email/i });
  await fillFieldWithDelay(emailField, 'sanfasal.its@gmail.com', {
    typingDelay: 3,
    afterTypingDelay: 5
  });
  
  const passwordField = page.getByRole('textbox', { name: /password/i });
  await fillFieldWithDelay(passwordField, 'Sal@2025', {
    typingDelay: 3,
    afterTypingDelay: 5
  });
  
  // Toggle password visibility - show password
  const eyeOffIcon = page.locator('.lucide-eye-off');
  if (await eyeOffIcon.isVisible({ timeout: 100 }).catch(() => false)) {
    await eyeOffIcon.click();
    await page.waitForTimeout(50);
  }
  
  // Toggle password visibility - hide password
  const eyeIcon = page.locator('.lucide-eye');
  if (await eyeIcon.isVisible({ timeout: 100 }).catch(() => false)) {
    await eyeIcon.click();
    await page.waitForTimeout(50);
  }
  
  await page.getByRole('button', { name: /signin|login/i }).click();
  await page.waitForURL(/dashboard/, { timeout: 15000 });
}
