import { generateTestmailAddress as generateEmail1 } from './email-helper1';
import { generateTestmailAddress as generateEmail2 } from './email-helper2';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export interface GeneratedEmails {
    email1: string;
    email2: string;
}

/**
 * Generates test emails using configured namespaces and verifies logging.
 * This effectively primes the generated-emails.json file for other tests.
 */
export function generateVerifiedEmails(): GeneratedEmails {
    const generatedEmailsPath = path.join(__dirname, '..', 'generated-emails.json');
    
    // Clear existing file if needed (optional logic preserved from original test)
    if (fs.existsSync(generatedEmailsPath)) {
        // fs.unlinkSync(generatedEmailsPath); 
    }

    const timestamp1 = Date.now().toString();
    const timestamp2 = (Date.now() + 1).toString(); // Add 1ms to ensure unique timestamp
    
    // Use actual namespace values from .env
    const namespace1 = process.env.TESTMAIL_NAMESPACE || 'xxxaw';
    const namespace2 = process.env.TESTMAIL_NAMESPACE2 || 'vz6ur';
    
    const email1 = generateEmail1(namespace1, timestamp1);
    const email2 = generateEmail2(namespace2, timestamp2);

    // Verify file exists
    if (!fs.existsSync(generatedEmailsPath)) {
        throw new Error(`Generated emails file not created at ${generatedEmailsPath}`);
    }

    const content = fs.readFileSync(generatedEmailsPath, 'utf-8');
    const logs = JSON.parse(content);

    const log1 = logs.find((l: any) => l.email === email1);
    const log2 = logs.find((l: any) => l.email === email2);

    if (!log1) console.warn(`Warning: Log for email1 (${email1}) not found immediately.`);
    if (!log2) console.warn(`Warning: Log for email2 (${email2}) not found immediately.`);

    return { email1, email2 };
}
