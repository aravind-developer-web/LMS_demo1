---
description: E2E testing for React + Django LMS with Playwright
---

# End-to-End Testing Setup for LMS

Complete setup for E2E testing of the Learning Management System using Playwright.

## Prerequisites

- Frontend: React 19 + Vite running on `http://localhost:5173`
- Backend: Django 5.2 running on `http://localhost:8000`
- Database: Ensure test data is seeded

---

## 1. Install Playwright

Initialize Playwright in the frontend directory.

// turbo
```bash
cd frontend
npm init playwright@latest
```

**Options during setup:**
- TypeScript: Yes
- Test folder: `e2e/`
- Add GitHub Actions: No (optional)
- Install browsers: Yes

---

## 2. Configure Playwright for LMS

Update `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],

  // Ensure Django backend is running
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 3. Create Test Utilities

**File:** `e2e/utils/auth.ts`

```typescript
import { Page } from '@playwright/test';

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

export async function loginAsLearner(page: Page) {
  await login(page, 'learner@test.com', 'testpass123');
}

export async function loginAsManager(page: Page) {
  await login(page, 'manager@test.com', 'testpass123');
}
```

---

## 4. Write E2E Tests

### Example: Learner Workflow

**File:** `e2e/learner-workflow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { loginAsLearner } from './utils/auth';

test.describe('Learner Workflow', () => {
  test('complete module and take quiz', async ({ page }) => {
    await loginAsLearner(page);

    // Navigate to module
    await page.click('text=Module 1');
    await expect(page).toHaveURL(/.*module\/1/);

    // Watch video
    await page.click('button:has-text("Play")');
    await page.waitForTimeout(5000); // Simulate watching

    // Mark as complete
    await page.click('button:has-text("Mark Complete")');
    await expect(page.locator('text=Completed')).toBeVisible();

    // Navigate to quiz
    await page.click('text=Take Quiz');
    await expect(page).toHaveURL(/.*quiz\/1/);

    // Answer questions
    await page.click('input[value="option-a"]');
    await page.click('button:has-text("Next")');
    await page.click('input[value="option-b"]');
    await page.click('button:has-text("Submit")');

    // Check results
    await expect(page.locator('text=Score:')).toBeVisible();
  });
});
```

### Example: Manager Dashboard

**File:** `e2e/manager-dashboard.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { loginAsManager } from './utils/auth';

test.describe('Manager Dashboard', () => {
  test('view learner analytics', async ({ page }) => {
    await loginAsManager(page);

    // Navigate to analytics
    await page.click('text=Analytics');
 await expect(page).toHaveURL(/.*analytics/);

    // Check charts are visible
    await expect(page.locator('[data-testid="enrollment-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="completion-chart"]')).toBeVisible();

    // Drill down into learner
    await page.click('text=John Doe');
    await expect(page.locator('text=Learning Activity')).toBeVisible();
  });
});
```

---

## 5. Run Tests

### Run all tests
// turbo
```bash
npx playwright test
```

### Run specific test file
// turbo
```bash
npx playwright test learner-workflow.spec.ts
```

### Run in headed mode (see browser)
```bash
npx playwright test --headed
```

### View test report
// turbo
```bash
npx playwright show-report
```

---

## 6. Debugging Tests

### Run with Playwright Inspector
```bash
npx playwright test --debug
```

### Generate test code with Codegen
```bash
npx playwright codegen http://localhost:5173
```

### View trace on failure
```bash
npx playwright show-trace trace.zip
```

---

## 7. CI/CD Integration

Add to `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npx playwright test
      
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Pro Tips

1. **Use data-testid attributes** for stable selectors:
   ```jsx
   <button data-testid="submit-quiz">Submit</button>
   ```

2. **Create page object models** for reusable components

3. **Use Playwright's auto-waiting** - no need for manual waits

4. **Run tests in parallel** for faster execution

5. **Use trace viewer** for debugging failed tests

6. **Test against staging environment** before production deploys
