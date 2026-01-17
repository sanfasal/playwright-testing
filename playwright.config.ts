import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run tests one by one
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Only 1 worker = sequential execution
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
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 500, 
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
