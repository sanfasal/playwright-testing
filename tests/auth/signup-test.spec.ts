import { test, expect } from "@playwright/test";
import { getOTPFromEmail, createAndSaveSignupCredentials } from "../../utils/email-helper";
import { getUserData, addUser } from "../../utils/data-store";
import dotenv from "dotenv";
import { addCursorTracking } from "../../utils/cursor-helper";
import {
  FileInput,
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

  test("Sign up", async ({ page }) => {
    await addCursorTracking(page);

    const apiKey = process.env.TESTMAIL_API_KEY;
    const namespace = process.env.TESTMAIL_NAMESPACE;

    if (!apiKey || !namespace) {
      throw new Error(
        "TESTMAIL_API_KEY and TESTMAIL_NAMESPACE must be defined in .env"
      );
    }
    // Generate dynamic email + password and save credentials
    const timestamp = Date.now().toString();
    const { generateTestmailAddress, generateRandomPassword } = await import("../../utils/email-helper");
    const email = generateTestmailAddress(namespace, timestamp);
    const password = generateRandomPassword(12);

    await page.goto("/signup");

    // Wait for page to load
    await expect(page).toHaveTitle(/Sign Up/i);
    await page.waitForTimeout(50);

    // Fill form like a real user
    await FileInput(
      page.getByRole("textbox", { name: /first name/i }),
      TEST_USER.firstName
    );
    await FileInput(
      page.getByRole("textbox", { name: /last name/i }),
      TEST_USER.lastName
    );
    await FileInput(
      page.getByRole("textbox", { name: /company/i }),
      TEST_USER.company
    );
    await FileInput(
      page.getByRole("textbox", { name: /email/i }),
      email
    );
    await FileInput(
      page.getByRole("textbox", { name: /^password$/i }),
      password
    );
    await FileInput(
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
      await FileInput(
        page.getByRole("textbox", { name: /code/i }),
        otp,
        { typingDelay: 50, afterTypingDelay: 50 }
      );
      await page
        .getByRole("button", { name: /verify|submit|confirm/i })
        .click();

      // Save data for other tests
      // console.log("Saving user data for reset password test...");
      // addUser({ 
      //   email, 
      //   password, 
      //   signupTimestamp: timestamp 
      // });
    }
  });

  test("Sign up with existing email", async ({ page }) => {
    await addCursorTracking(page);

    await page.goto("/signup");
    await page.waitForTimeout(50);

    // Fill form like a real user
    await FileInput(
      page.getByRole("textbox", { name: /first name/i }),
      TEST_USER.firstName
    );
    await FileInput(
      page.getByRole("textbox", { name: /last name/i }),
      TEST_USER.lastName
    );
    await FileInput(
      page.getByRole("textbox", { name: /company/i }),
      TEST_USER.company
    );
    const existingEmail = getUserData('signupEmail') || TEST_USER.existingEmail;
    await FileInput(
      page.getByRole("textbox", { name: /email/i }),
      existingEmail
    );
    await FileInput(
      page.getByRole("textbox", { name: /^password$/i }),
      TEST_USER.validPassword
    );
    await FileInput(
      page.getByRole("textbox", { name: /confirm password/i }),
      TEST_USER.validPassword
    );

    // Verify password toggle works for both fields
    const passwordField = page.getByRole("textbox", { name: /^password$/i });
    const confirmPasswordField = page.getByRole("textbox", {
      name: /confirm password/i,
    });

    await verifyPasswordToggle(passwordField);
    await verifyPasswordToggle(confirmPasswordField);

    await page.getByRole("button", { name: /sign up/i }).click();
    await page.waitForTimeout(1000);

    // Verify error message - check for various possible error messages
    const errorMessage = page
      .getByText(/user already exists/i)
      .or(page.getByText(/email already/i))
      .or(page.getByText(/already registered/i))
      .or(page.getByText(/account exists/i))
      .or(page.getByRole("alert"))
      .first();

    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test("Sign up with passwords do not match", async ({ page }) => {
    await addCursorTracking(page);

    await page.goto("/signup");
    await page.waitForTimeout(50);

    // Fill in all required fields like a real user
    await FileInput(
      page.getByRole("textbox", { name: /first name/i }),
      TEST_USER.firstName
    );
    await FileInput(
      page.getByRole("textbox", { name: /last name/i }),
      TEST_USER.lastName
    );
    await FileInput(
      page.getByRole("textbox", { name: /company/i }),
      TEST_USER.company
    );
     const existingEmail = getUserData('signupEmail') || TEST_USER.existingEmail;
    await FileInput(
      page.getByRole("textbox", { name: /email/i }),
      existingEmail
    );

    const passwordField = page.getByRole("textbox", { name: /^password$/i });
    const confirmPasswordField = page.getByRole("textbox", {
      name: /confirm password/i,
    });

    await FileInput(passwordField, TEST_USER.validPassword);
    await FileInput(confirmPasswordField, TEST_USER.invalidPassword);

    // Verify password toggle works for both fields
    await verifyPasswordToggle(passwordField);
    await verifyPasswordToggle(confirmPasswordField);
  });

  test("Sign up with weak password", async ({ page }) => {
    await addCursorTracking(page);

    await page.goto("/signup");
    await page.waitForTimeout(50);

    // Fill in all required fields like a real user
    await FileInput(
      page.getByRole("textbox", { name: /first name/i }),
      TEST_USER.firstName
    );
    await FileInput(
      page.getByRole("textbox", { name: /last name/i }),
      TEST_USER.lastName
    );
    await FileInput(
      page.getByRole("textbox", { name: /company/i }),
      TEST_USER.company
    );
    await FileInput(
      page.getByRole("textbox", { name: /email/i }),
      "test@example.com"
    );

    // Fill with weak password (too short)
    const weakPassword = "123";
    const passwordField = page.getByRole("textbox", { name: /^password$/i });
    const confirmPasswordField = page.getByRole("textbox", {
      name: /confirm password/i,
    });

    await FileInput(passwordField, weakPassword);
    await FileInput(confirmPasswordField, weakPassword);

    // Verify password toggle works for both fields
    await verifyPasswordToggle(passwordField);
    await verifyPasswordToggle(confirmPasswordField);

    await page.waitForTimeout(100);
  });
});
