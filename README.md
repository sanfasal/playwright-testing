# Playwright Testing Project

Automated end-to-end testing suite for web application using Playwright.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Test Suites](#test-suites)
- [Configuration](#configuration)
- [Test Data](#test-data)
- [Debugging](#debugging)
- [CI/CD Integration](#cicd-integration)

## 🎯 Overview

This project contains automated tests for the following features:
- User Sign In
- User Sign Up
- Password Reset
- Dashboard functionality

## ✅ Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Playwright-testing
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## 📁 Project Structure

```
Playwright-testing/
├── tests/
│   ├── signin.spec.ts          # Sign in test scenarios
│   ├── signup.spec.ts          # Sign up test scenarios
│   ├── reset-password.spec.ts  # Password reset tests
│   └── dashboard.spec.ts       # Dashboard functionality tests
├── test-results/               # Test execution results
├── playwright.config.ts        # Playwright configuration
├── package.json
└── README.md
```

## 🚀 Running Tests

### Run all tests
```bash
npm test
```

### Run tests in headed mode (visible browser)
```bash
npm run test:headed
```

### Run tests in UI mode (interactive)
```bash
npm run test:ui
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run specific test file
```bash
npx playwright test tests/signin.spec.ts
```

### Run specific test by name
```bash
npx playwright test -g "User sign in with valid credentials"
```

### View test report
```bash
npm run test:report
```

## 🧪 Test Suites

### Sign In Tests (`signin.spec.ts`)
- ✅ User sign in with valid credentials
- ✅ User sign in with invalid credentials
- ✅ Sign in fails with invalid email format

### Sign Up Tests (`signup.spec.ts`)
- ✅ User can sign up successfully
- ✅ Sign up fails with existing email
- ✅ Sign up fails with passwords do not match

### Reset Password Tests (`reset-password.spec.ts`)
- ✅ Reset password with valid code
- ✅ Reset password with invalid code

### Dashboard Tests (`dashboard.spec.ts`)
- ✅ Dashboard page loads successfully
- ✅ User can sign out from dashboard

## ⚙️ Configuration

The `playwright.config.ts` file contains the following key settings:

| Setting | Value | Description |
|---------|-------|-------------|
| `baseURL` | `https://dif4vj7xnw6g0.cloudfront.net/` | Application base URL |
| `headless` | `false` | Browser visibility (visible by default) |
| `slowMo` | `1000ms` | Delay between actions for debugging |
| `video` | `retain-on-failure` | Record video on test failure |
| `screenshot` | `only-on-failure` | Capture screenshot on failure |
| `viewport` | `1280x720` | Browser window size |

## 📊 Test Data

### Test Users

**Valid User:**
- Email: `sanfasal70@gmail.com`
- Password: `Sal@2025`

**New User (Sign Up):**
- Email: `nanasiku2005@gmail.com`
- Password: `Password@123`

**Invalid User:**
- Email: `sanfasal709@gmail.com`
- Password: `Sal@12345`

> ⚠️ **Note:** Update test credentials in test files as needed for your environment.

## 🐛 Debugging

### Using `page.pause()`
Several tests include `page.pause()` which opens Playwright Inspector for manual debugging:
```typescript
await page.pause(); // Browser will pause here
```

### Slow Motion
Tests run with 1-second delay between actions by default. Adjust in `playwright.config.ts`:
```typescript
slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 1000
```

### Custom slow motion:
```bash
SLOW_MO=2000 npm test
```

### View trace
If a test fails, view the trace:
```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

## 🔄 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npm test
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

### Environment Variables

For CI/CD, set these environment variables:
```bash
CI=true                    # Enables CI-specific settings
PLAYWRIGHT_HEADLESS=true   # Run in headless mode
```

## 📝 Best Practices

1. **Use accessible selectors** - Tests use `getByRole()` for better reliability
2. **Wait for navigation** - Use `waitForURL()` instead of hard timeouts
3. **Assertions** - Always verify expected outcomes with `expect()`
4. **Test isolation** - Each test should be independent
5. **Remove `page.pause()`** - Comment out before running in CI/CD

## 🤝 Contributing

1. Create a new branch for your feature
2. Write tests following existing patterns
3. Ensure all tests pass
4. Submit a pull request

## 📄 License

ISC

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Last Updated:** January 2026
