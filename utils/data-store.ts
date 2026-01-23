import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(__dirname, '..', 'user-data.json');

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

  if (!data.users) {
    data.users = [];
  }

  data.users.push(user);

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
  } else {
    console.warn(`Could not find user with email ${oldEmail} to update.`);
  }
}

