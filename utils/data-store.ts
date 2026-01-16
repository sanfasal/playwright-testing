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
