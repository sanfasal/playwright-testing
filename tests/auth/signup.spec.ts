import { test, expect } from "@playwright/test";
import { getOTPFromEmail } from "../../utils/email-helper";
import { addUser } from "../../utils/data-store";
import dotenv from "dotenv";
import { addCursorTracking } from "../../utils/cursor-helper";
import {
  fillFieldWithDelay,
  verifyPasswordToggle,
} from "../../utils/form-helper";

dotenv.config();

// Static test data
const TEST_USER = {
  firstName: "Seksaa",
  lastName: "Tech",
  company: "SeksaaTech",
  existingEmail: "sanfasal70@gmail.com",
  validPassword: "Password@123",
  invalidPassword: "DifferentPassword@456",
} as const;

test.describe("Sign Up", () => {
  test.setTimeout(60000);

  test("Sign up successfully", async ({ page }) => {
    await addCursorTracking(page);

    const apiKey = process.env.TESTMAIL_API_KEY;
    const namespace = process.env.TESTMAIL_NAMESPACE;

    if (!apiKey || !namespace) {
      throw new Error(
        "TESTMAIL_API_KEY and TESTMAIL_NAMESPACE must be defined in .env"
      );
    }
    // Read generated emails
    const fs = await import("fs");
    const path = await import("path");
    const emailsPath = path.resolve(__dirname, "../../generated-emails.json");
    
    if (!fs.existsSync(emailsPath)) {
        throw new Error(`Generated emails file not found at ${emailsPath}`);
    }

    const emails = JSON.parse(fs.readFileSync(emailsPath, "utf-8"));
    if (!emails || emails.length === 0) {
        throw new Error("No generated emails found in file");
    }

    // Use the first email (index 0)
    const emailObj = emails[0];
    const email = emailObj.email;
    
    // Extract timestamp from email (format: namespace.timestamp@inbox.testmail.app)
    // The timestamp is the part between the dot and the @
    const match = email.match(/\.(\d+)@/);
    if (!match) {
        throw new Error(`Could not extract timestamp from email: ${email}`);
    }
    const timestamp = match[1];

    const { generateRandomPassword } = await import("../../utils/email-helper");
    // Use the password from the generated email if available, otherwise generate a new one
    const password = emailObj.password || generateRandomPassword(12);
    
    if (emailObj.password) {
        console.log(`Using password from generated-emails.json: ${password}`);
    } else {
        console.log(`No password found in generated-emails.json, generated new one: ${password}`);
    }

    await page.goto("/signup");

    // Wait for page to load
    await expect(page).toHaveTitle(/Sign Up/i);
    await page.waitForTimeout(50);

    // Fill form like a real user
    await fillFieldWithDelay(
      page.getByRole("textbox", { name: /first name/i }),
      TEST_USER.firstName
    );
    await fillFieldWithDelay(
      page.getByRole("textbox", { name: /last name/i }),
      TEST_USER.lastName
    );
    await fillFieldWithDelay(
      page.getByRole("textbox", { name: /company/i }),
      TEST_USER.company
    );
    await fillFieldWithDelay(
      page.getByRole("textbox", { name: /email/i }),
      email
    );
    await fillFieldWithDelay(
      page.getByRole("textbox", { name: /^password$/i }),
      password
    );
    await fillFieldWithDelay(
      page.getByRole("textbox", { name: /confirm password/i }),
      password
    );

    // Verify password toggle works for both fields
    const passwordField = page.getByRole("textbox", { name: /^password$/i });
    const confirmPasswordField = page.getByRole("textbox", {
      name: /confirm password/i,
    });

    await verifyPasswordToggle(passwordField);
    await verifyPasswordToggle(confirmPasswordField);

    await page.getByRole("button", { name: /sign up/i }).click();
    await page.waitForURL(/signup-verify/i, { timeout: 50000 });

    if (apiKey && namespace) {
      const otp = await getOTPFromEmail({
        apiKey,
        namespace,
        timestamp: timestamp,
      });
      await fillFieldWithDelay(
        page.getByRole("textbox", { name: /code/i }),
        otp,
        { typingDelay: 50, afterTypingDelay: 50 }
      );
      await page
        .getByRole("button", { name: /verify|submit|confirm/i })
        .click();

      // Save data for other tests
      addUser({ 
        email, 
        password, 
        signupTimestamp: timestamp 
      });
    }
  });
});
