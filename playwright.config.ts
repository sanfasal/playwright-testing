import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list', 

  use: {
    baseURL: 'https://dif4vj7xnw6g0.cloudfront.net/',
    trace: 'on', // Always capture trace for documentation
    
    video: 'on', // ✅ Always record video for documentation
    
    screenshot: 'on', // ✅ Always capture screenshots for documentation 
    
    headless: false, // Always show browser
    
    // Larger viewport for better visibility
    viewport: { width: 1280, height: 720 },
    
    // Slow down operations for debugging (set SLOW_MO env variable)
    launchOptions: {
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 1000, // 1 second delay
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
