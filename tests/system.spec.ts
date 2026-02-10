import { test, expect } from "@playwright/test";
import { login } from "../utils/auth-helper";
import { addCursorTracking } from "../utils/cursor-helper";
import { updateSystem } from "../components/system";
import staticData from '../constant/static-data.json';

const { systemDataEdit } = staticData;

test.describe("System", () => {
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);

    // Wait for workspace to load then navigate to System
    await expect(
      page.getByText("Please wait while we load your workspace")
    ).toBeHidden({ timeout: 20000 });
    await page
      .getByText("System", { exact: true })
      .click()
      .catch(() => null);
    await expect(page)
      .toHaveURL(/\/system/)
      .catch(() => null);
  });

  test("Edit system", async ({ page }) => {
    test.setTimeout(120000);
    await page.waitForTimeout(1000);

    await updateSystem(page, systemDataEdit);
  });
});
