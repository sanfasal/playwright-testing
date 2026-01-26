import { test, expect } from '@playwright/test';
import { generateTestmailAddress as generateEmail1 } from '../utils/email-helper1';
import { generateTestmailAddress as generateEmail2 } from '../utils/email-helper2';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

test('verify email logging', async () => {
    const generatedEmailsPath = path.join(__dirname, '..', 'generated-emails.json');
    
    // Clear existing file if needed (optional, effectively verifying append or create)
    if (fs.existsSync(generatedEmailsPath)) {
        // fs.unlinkSync(generatedEmailsPath); // Uncomment to start fresh
    }

    const timestamp1 = Date.now().toString();
    const timestamp2 = (Date.now() + 1).toString(); // Add 1ms to ensure unique timestamp
    
    // Use actual namespace values from .env
    const namespace1 = process.env.TESTMAIL_NAMESPACE || 'xxxaw';
    const namespace2 = process.env.TESTMAIL_NAMESPACE2 || 'vz6ur';
    
    const email1 = generateEmail1(namespace1, timestamp1);
    const email2 = generateEmail2(namespace2, timestamp2);

    expect(fs.existsSync(generatedEmailsPath)).toBeTruthy();

    const content = fs.readFileSync(generatedEmailsPath, 'utf-8');
    const logs = JSON.parse(content);

    console.log('Logs:', logs);

    const log1 = logs.find((l: any) => l.email === email1);
    const log2 = logs.find((l: any) => l.email === email2);

    expect(log1).toBeDefined();
    expect(log2).toBeDefined();
});
