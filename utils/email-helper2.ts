/**
 * Helper functions for testmail.app integration
 * Documentation: https://testmail.app/docs
 */

import { saveUserData, logGeneratedEmail } from "./data-store";
import { generateRandomPassword } from "./email-helper";

export interface TestmailConfig {
  apiKey: string;
  namespace: string;
  timestamp?: string;
}

export interface TestmailEmail {
  subject: string;
  text: string;
  html: string;
  from: string;
  timestamp: number;
}

/**
 * Class-based client for interacting with Testmail.app
 * Allows multiple instances for different users/namespaces/timestamps.
 */
export class TestmailClient {
  private config: TestmailConfig;

  constructor(config: TestmailConfig) {
    this.config = config;
  }

  /**
   * Generates a testmail.app email address for this client configuration
   */
  getAddress(): string {
    return generateTestmailAddress(this.config.namespace, this.config.timestamp);
  }

  /**
   * Fetches emails for this client
   */
  async fetchEmails(timeout: number = 30000, minTimestamp: number = 0): Promise<TestmailEmail[]> {
    return fetchEmails(this.config, timeout, minTimestamp);
  }

  /**
   * Waits for an OTP email and extracts the code
   */
  async getOTP(otpPattern?: RegExp, timeout: number = 30000, minTimestamp: number = 0): Promise<string> {
    return getOTPFromEmail(this.config, otpPattern, timeout, minTimestamp);
  }
}

/**
 * Generates a testmail.app email address
 * @param namespace - Your testmail.app namespace
 * @param timestamp - Optional timestamp for organizing emails (default: random string)
 * @returns Email address in format: namespace.timestamp@inbox.testmail.app
 */
export function generateTestmailAddress(
  namespace: string,
  timestamp?: string
): string {
  const email = `${namespace}.${timestamp}@inbox.testmail.app`;
  logGeneratedEmail(email, 'email-helper2');
  return email;
}

/**
 * Fetches emails from testmail.app inbox
 * @param config - Testmail configuration
 * @param timeout - Maximum time to wait for email (ms)
 * @returns Array of emails
 */
export async function fetchEmails(
  config: TestmailConfig,
  timeout: number = 30000,
  minTimestamp: number = 0
): Promise<TestmailEmail[]> {
  const { apiKey, namespace, timestamp } = config;
  const startTime = Date.now();
  let attemptCount = 0;

  while (Date.now() - startTime < timeout) {
    attemptCount++;
    const elapsed = Date.now() - startTime;

    try {
      const url = new URL("https://api.testmail.app/api/json");
      url.searchParams.append("apikey", apiKey);
      url.searchParams.append("namespace", namespace);
      if (timestamp) {
        url.searchParams.append("tag", timestamp);
      }
      url.searchParams.append("livequery", "true");

      console.log(`   Attempt ${attemptCount} (${elapsed}ms elapsed)...`);
      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `   ❌ API Error: ${response.status} ${response.statusText}`
        );
        console.error(`   Response: ${errorText}`);
        throw new Error(
          `Testmail API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.emails && data.emails.length > 0) {
        // Filter by minTimestamp if provided
        const relevantEmails = data.emails.filter(
          (e: TestmailEmail) => e.timestamp >= minTimestamp
        );

        if (relevantEmails.length > 0) {
          console.log(`   ✅ Found ${relevantEmails.length} new email(s)!`);
          return relevantEmails;
        } else {
          console.log(
            `   Detailed debug: Found ${
              data.emails.length
            } emails, but none were newer than ${minTimestamp}. Newest was ${Math.max(
              ...data.emails.map((e: TestmailEmail) => e.timestamp)
            )}`
          );
        }
      }

      console.log(`   ⏳ No new emails yet, waiting 2 seconds...`);
      // Wait 2 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`   ❌ Error on attempt ${attemptCount}:`, error);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.error(
    `❌ Timeout: No emails received after ${attemptCount} attempts in ${timeout}ms`
  );
  throw new Error(
    `No emails received within ${timeout}ms after ${attemptCount} attempts`
  );
}

/**
 * Extracts OTP code from email text
 * @param emailText - Email body text
 * @param pattern - Regex pattern to match OTP (default: tries multiple common patterns)
 * @returns OTP code or null if not found
 */
export function extractOTP(emailText: string, pattern?: RegExp): string | null {
  if (!emailText) {
    return null;
  }
  // If custom pattern provided, use it
  if (pattern) {
    const match = emailText.match(pattern);
    return match ? match[0] : null;
  }

  // Try multiple common OTP patterns
  const patterns = [
    /\b\d{6}\b/, // 6 digits
    /(?:code|otp|verification)[\s:]+(\d{6})/i, // "code: 123456" or "OTP: 123456"
    /\b\d{4}\b/, // 4 digits
    /\b\d{8}\b/, // 8 digits
    /[A-Z0-9]{6}/, // 6 alphanumeric characters
  ];

  for (const p of patterns) {
    const match = emailText.match(p);
    if (match) {
      return match[1] || match[0]; // Return captured group if exists, otherwise full match
    }
  }

  return null;
}



/**
 * Create signup credentials (testmail address + generated password),
 * save them to user-data.json via `saveUserData`, and return the pair.
 * The credentials are saved with the email as the key and the password as the value.
 */
export function createAndSaveSignupCredentials(
  namespace: string,
  timestamp?: string,
  passwordLength: number = 12
) {
  const email = generateTestmailAddress(
    namespace,
    timestamp ||
      `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  );
  const password = generateRandomPassword(passwordLength);

  try {
    saveUserData(email, password);
    console.log(`Saved signup credentials for ${email}`);
  } catch (e) {
    console.error("Failed to save signup credentials:", e);
  }

  return { email, password };
}

/**
 * Waits for OTP email and extracts the code
 * @param config - Testmail configuration
 * @param otpPattern - Optional custom regex pattern for OTP
 * @param timeout - Maximum time to wait (ms)
 * @returns OTP code
 */
export async function getOTPFromEmail(
  config: TestmailConfig,
  otpPattern?: RegExp,
  timeout: number = 30000,
  minTimestamp: number = 0
): Promise<string> {
  const emails = await fetchEmails(config, timeout, minTimestamp);

  if (emails.length === 0) {
    throw new Error("No emails received");
  }

  // Get the most recent email
  const latestEmail = emails[0];
  console.log(`📬 Received email: "${latestEmail.subject}"`);

  // Try to extract OTP from email text, fallback to html if text is empty
  const contentToSearch = latestEmail.text || latestEmail.html || "";
  const otp = extractOTP(contentToSearch, otpPattern);

  if (!otp) {
    console.error("Email content:", latestEmail.text);
    throw new Error("Could not extract OTP from email");
  }

  console.log(`🔑 Extracted OTP: ${otp}`);
  return otp;
}
