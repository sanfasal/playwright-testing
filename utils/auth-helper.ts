import { Page } from '@playwright/test';
import { addCursorTracking } from './cursor-helper';
import { fillFieldWithDelay } from './form-helper';

export async function login(page: Page) {
  await addCursorTracking(page);
  
  await page.goto('/signin');
  await page.waitForTimeout(800); 
  
  const emailField = page.getByRole('textbox', { name: /email/i });
  await fillFieldWithDelay(emailField, 'sanfasal.its@gmail.com');
  
  const passwordField = page.getByRole('textbox', { name: /password/i });
  await fillFieldWithDelay(passwordField, 'Sal@2025', {
    typingDelay: 100,
    afterTypingDelay: 600
  });
   
  
  await page.getByRole('button', { name: /signin|login/i }).click();
  await page.waitForURL(/dashboard/, { timeout: 15000 });
}
