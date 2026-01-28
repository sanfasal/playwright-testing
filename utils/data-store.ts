import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(__dirname, '..', 'user-data.json');
const GENERATED_EMAILS_FILE = path.join(__dirname, '..', 'generated-emails.json');

/**
 * Saves a key-value pair to user-data.json
 */
export function saveUserData(key: string, value: any): void {
  let data: Record<string, any> = {};
  
  if (fs.existsSync(DATA_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) {
      console.warn('Could not parse user-data.json, creating new one.');
    }
  }

  data[key] = value;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`Saved ${key}: ${value} to ${DATA_FILE}`);
}

/**
 * Retrieves a value by key from user-data.json
 */
export function getUserData(key: string): any {
  if (!fs.existsSync(DATA_FILE)) {
    console.warn(`Data file ${DATA_FILE} does not exist.`);
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    return data[key];
  } catch (e) {
    console.warn('Error reading user-data.json:', e);
    return null;
  }
}

/**
 * Clears the user data file
 */
export function clearUserData(): void {
  if (fs.existsSync(DATA_FILE)) {
    fs.unlinkSync(DATA_FILE);
  }
}

/**
 * Appends a new user to the users array in user-data.json
 */
export function addUser(user: { email: string; password?: string; [key: string]: any }): void {
  let data: { users?: any[]; [key: string]: any } = {};

  if (fs.existsSync(DATA_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) {
      console.warn('Could not parse user-data.json, creating new one.');
    }
  }

  // Store only one user object as requested
  data.users = [user];

  // Also update the flat properties for backward compatibility
  data.signupEmail = user.email;
  if (user.password) data.signupPassword = user.password;
  if (user.signupTimestamp) data.signupTimestamp = user.signupTimestamp;

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`Added user ${user.email} to ${DATA_FILE}`);
}

/**
 * Updates a user's email address in user-data.json
 */
export function updateUserEmail(oldEmail: string, newEmail: string): void {
  let data: any = {};
  if (fs.existsSync(DATA_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) {
      console.warn('Could not parse user-data.json');
      return;
    }
  }

  let updated = false;

  // Update root key-value if exists
  if (data[oldEmail]) {
    data[newEmail] = data[oldEmail];
    delete data[oldEmail];
    updated = true;
  }

  // Update users array
  if (data.users && Array.isArray(data.users)) {
    const userIndex = data.users.findIndex((u: any) => u.email === oldEmail);
    if (userIndex !== -1) {
      data.users[userIndex].email = newEmail;
      updated = true;
    }
  }

  // Update signupEmail if matches
  if (data.signupEmail === oldEmail) {
    data.signupEmail = newEmail;
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`Updated email from ${oldEmail} to ${newEmail} in ${DATA_FILE}`);
    console.warn(`Could not find user with email ${oldEmail} to update.`);
  }
}

/**
 * Updates a user's password in user-data.json
 */
export function updateUserPassword(email: string, newPassword: string): void {
  let data: any = {};
  if (fs.existsSync(DATA_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) {
      console.warn('Could not parse user-data.json');
      return;
    }
  }

  let updated = false;

  // Update root key-value if exists
  if (data[email]) {
    // If stored as simple key-value, we can't really store password easily unless we convert structure
    // But typically simple key-value is {email: password}, so we update the value
    data[email] = newPassword;
    updated = true;
  }

  // Update users array
  if (data.users && Array.isArray(data.users)) {
    const userIndex = data.users.findIndex((u: any) => u.email === email);
    if (userIndex !== -1) {
      data.users[userIndex].password = newPassword;
      updated = true;
    }
  }

  // Update signupPassword if email matches signupEmail
  if (data.signupEmail === email) {
    data.signupPassword = newPassword;
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`Updated password for ${email} in ${DATA_FILE}`);
  } else {
    console.warn(`Could not find user with email ${email} to update password.`);
  }
}

/**
 * Logs a generated email to generated-emails.json
 * Limits storage to 2 emails maximum - removes oldest when adding new
 */
export function logGeneratedEmail(email: string, source: string, password?: string): void {
  let emails: any[] = [];
  
  if (fs.existsSync(GENERATED_EMAILS_FILE)) {
    try {
      emails = JSON.parse(fs.readFileSync(GENERATED_EMAILS_FILE, 'utf-8'));
    } catch (e) {
      console.warn('Could not parse generated-emails.json, creating new one.');
    }
  }

  const newEntry = {
    email,
    password,
    source,
    timestamp: new Date().toISOString()
  };

  emails.push(newEntry);
  
  // Limit to 20 emails - remove oldest if exceeded
  const MAX_EMAILS = 2;
  if (emails.length > MAX_EMAILS) {
    const removed = emails.shift(); // Remove the oldest (first) email
    console.log(`Removed oldest email: ${removed.email} (limit: ${MAX_EMAILS})`);
  }
  
  try {
    fs.writeFileSync(GENERATED_EMAILS_FILE, JSON.stringify(emails, null, 2));
    console.log(`Logged generated email ${email} to ${GENERATED_EMAILS_FILE} (${emails.length}/${MAX_EMAILS})`);
  } catch (e) {
    console.error('Failed to log generated email:', e);
  }
}

/**
 * Retrieves a generated email by index from generated-emails.json
 * @param index - The index of the email to retrieve (0-based)
 * @returns The email string at the specified index, or null if not found
 */
export function getGeneratedEmail(index: number): string | null {
  if (!fs.existsSync(GENERATED_EMAILS_FILE)) {
    console.warn(`Generated emails file ${GENERATED_EMAILS_FILE} does not exist.`);
    return null;
  }

  try {
    const emails = JSON.parse(fs.readFileSync(GENERATED_EMAILS_FILE, 'utf-8'));
    
    if (!Array.isArray(emails) || emails.length === 0) {
      console.warn('No generated emails found.');
      return null;
    }

    if (index < 0 || index >= emails.length) {
      console.warn(`Index ${index} out of bounds. Available emails: ${emails.length}`);
      return null;
    }

    const emailEntry = emails[index];
    console.log(`Retrieved generated email at index ${index}: ${emailEntry.email}`);
    return emailEntry.email;
  } catch (e) {
    console.warn('Error reading generated-emails.json:', e);
    return null;
  }
}

/**
 * Retrieves the password for a generated email by index from generated-emails.json
 * @param index - The index of the email to retrieve the password for (0-based)
 * @returns The password string at the specified index, or null if not found
 */
export function getGeneratedEmailPassword(index: number): string | null {
  if (!fs.existsSync(GENERATED_EMAILS_FILE)) {
    console.warn(`Generated emails file ${GENERATED_EMAILS_FILE} does not exist.`);
    return null;
  }

  try {
    const emails = JSON.parse(fs.readFileSync(GENERATED_EMAILS_FILE, 'utf-8'));
    
    if (!Array.isArray(emails) || emails.length === 0) {
      console.warn('No generated emails found.');
      return null;
    }

    if (index < 0 || index >= emails.length) {
      console.warn(`Index ${index} out of bounds. Available emails: ${emails.length}`);
      return null;
    }

    const emailEntry = emails[index];
    if (emailEntry.password) {
      console.log(`Retrieved password for email at index ${index}`);
      return emailEntry.password;
    } else {
      console.warn(`No password found for email at index ${index}`);
      return null;
    }
  } catch (e) {
    console.warn('Error reading generated-emails.json:', e);
    return null;
  }
}
/**
 * Retrieves the password for a user from user-data.json by email
 */
export function getUserPasswordByEmail(email: string): string | null {
  if (!fs.existsSync(DATA_FILE)) {
    console.warn(`Data file ${DATA_FILE} does not exist.`);
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    
    // Check root user
    if (data.signupEmail === email && data.signupPassword) {
      return data.signupPassword;
    }
    
    // Check key-value pairs (legacy)
    if (data[email] && typeof data[email] === 'string') {
        return data[email];
    }

    // Check users array
    if (data.users && Array.isArray(data.users)) {
      const user = data.users.find((u: any) => u.email === email);
      if (user && user.password) {
        return user.password;
      }
    }
    
    console.warn(`User with email ${email} not found or has no password.`);
    return null;
  } catch (e) {
    console.warn('Error reading user-data.json:', e);
    return null;
  }
}
