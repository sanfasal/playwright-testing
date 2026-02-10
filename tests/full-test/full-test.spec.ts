import { test, expect } from '@playwright/test';
import {  generateRandomPassword, generateTestmailAddress } from '../../utils/email-helper';
import {  getUserData } from '../../utils/data-store';
import { login } from '../../utils/auth-helper';
import dotenv from 'dotenv';
import { addCursorTracking } from '../../utils/cursor-helper';
import { FileInput } from '../../utils/form-helper';
import { deleteEntityViaActionMenu, deleteItem } from '../../utils/delete-helper';
import { generateVerifiedEmails } from '../../utils/email-generator';
import * as fs from 'fs';
import * as path from 'path';
import staticData from '../../constant/static-data.json';
import { toggleViewMode } from '../../utils/view-helper';
import { openActionMenu } from '../../utils/action-menu-helper';
import { createStudent, updateStudent } from '../../components/students';
import { createCoach, updateCoach } from '../../components/coaches';
import { createMaterial, updateMaterial } from '../../components/materials';
import { createLesson, updateLesson } from '../../components/lessons';
import { createCourse, updateCourse } from '../../components/courses';
import { createClass, updateClass } from '../../components/classes';
import { signUp, signIn } from '../../components/auth';
import { editProfile, changeEmail, updatePassword } from '../../components/personal-life';
import { updateSystem } from '../../components/system';
import { createUser, updateUser } from '../../components/users';
import { createAttendance, updateAttendance, deleteAttendance } from '../../components/attendance';
import { createInvoice, updateInvoice, downloadInvoice, deleteInvoice } from '../../components/invoices';
import { 
  createEngagement, 
  editEngagement, 
  deleteEngagement,
  createActivity,
  editActivity,
  createEmail,
  editEmail,
  createCall,
  editCall,
  createNote,
  editNote,
  createComment,
  editComment,
  deleteComment
} from '../../components/engagements';

// Load environment variables
dotenv.config();

// Static test data
const { 
  TEST_USER, 
  personalDataEdit, 
  systemDataEdit, 
  userDataAdd: userDataAddBase,
  userDataEdit: userDataEditBase,
  coachDataAdd: coachDataAddBase,
  coachDataEdit: coachDataEditBase,
  studentDataAdd: studentDataAddBase,
  studentDataEdit: studentDataEditBase,
  lessonDataAdd,
  lessonDataEdit,

  moduleDataAdd,
  moduleDataEdit,
  courseDataAdd,
  courseDataEdit,
  engagementDataAdd: engagementDataAddBase,
  engagementDataEdit: engagementDataEditBase,
  activityDataAdd,
  activityDataEdit,
  emailDataAdd,
  emailDataEdit,
  callDataAdd,
  callDataEdit,
  noteDataAdd,
  noteDataEdit,

  activityCommentDataAdd,
  activityCommentDataEdit,
  emailCommentDataAdd,
  emailCommentDataEdit,
  callCommentDataAdd,
  callCommentDataEdit,
  noteCommentDataAdd,
  noteCommentDataEdit,
} = staticData;

// Generate random suffix for unique emails and identifiers
const randomSuffix = Math.floor(Math.random() * 10000);

// Build dynamic data objects from static data with runtime values
const userDataAdd = {
  ...userDataAddBase,
  dob: new Date().toISOString().split("T")[0],
};

const userDataEdit = {
  ...userDataEditBase,
};

const coachDataAdd = {
  ...coachDataAddBase,
  email: `${coachDataAddBase.emailPrefix}${randomSuffix}@gmail.com`,
  dob: new Date().toISOString().split("T")[0],
};

const coachDataEdit = {
  ...coachDataEditBase,
  email: `${coachDataEditBase.emailPrefix}${randomSuffix}@gmail.com`,
  dob: new Date().toISOString().split("T")[0],
};

const studentDataAdd = {
  ...studentDataAddBase,
  lastName: `${studentDataAddBase.lastNamePrefix} ${randomSuffix}`,
  email: `${studentDataAddBase.emailPrefix}.${randomSuffix}@gmail.com`,
  telegram: `${studentDataAddBase.telegramPrefix}${randomSuffix}`,
  dob: new Date().toISOString().split('T')[0],
  guardian: {
    ...studentDataAddBase.guardian,
    email: `${studentDataAddBase.guardian.emailPrefix}${randomSuffix}@gmail.com `,
  },
  emergency: {
    ...studentDataAddBase.emergency,
    email: `${studentDataAddBase.emergency.emailPrefix}${randomSuffix}@gmail.com`,
  },
};

const studentDataEdit = {
  ...studentDataEditBase,
  email: `${studentDataEditBase.emailPrefix}${randomSuffix}@gmail.com`,
  telegram: `${studentDataEditBase.telegramPrefix}${randomSuffix}`,
  dob: new Date().toISOString().split('T')[0],
  guardian: {
    ...studentDataEditBase.guardian,
    email: `${studentDataEditBase.guardian.emailPrefix}${randomSuffix}@gmail.com `,
  },
  emergency: {
    ...studentDataEditBase.emergency,
    email: `${studentDataEditBase.emergency.emailPrefix}${randomSuffix}@gmail.com `,
  },
};

    const engagementDataAdd = {
      ...engagementDataAddBase,
      firstName: `${engagementDataAddBase.firstName} ${randomSuffix}`,
      lastName: `${engagementDataAddBase.lastName} ${randomSuffix}`,
      email: `john.doe.${randomSuffix}@example.com`,
    };

    const engagementDataEdit = {
      ...engagementDataEditBase,
      firstName: `${engagementDataEditBase.firstName} ${randomSuffix}`,
      lastName: `${engagementDataEditBase.lastName} ${randomSuffix}`,
      email: `sok.heng.${randomSuffix}@example.com`,
    };

function getSigninUser() {
  return {
    email: getUserData('signupEmail') || 'sanfasal.its@gmail.com',
    validPassword: getUserData('signupPassword') || 'Sal@2025',
    invalidPassword: 'Sal@12345',
  } as const;
}

test.describe.serial('Full Test', () => {
  test.setTimeout(1200000); // 20 minutes global timeout for this extended suite

  // ========================================
  // 1. Auth
  // ========================================
  test.describe('Auth', () => {
    test("Sign Up", async ({ page }) => {
    await addCursorTracking(page);

    const apiKey = process.env.TESTMAIL_API_KEY;
    const namespace = process.env.TESTMAIL_NAMESPACE;

    // Generate fresh emails before starting
    generateVerifiedEmails();

    if (!apiKey || !namespace) {
      throw new Error(
        "TESTMAIL_API_KEY and TESTMAIL_NAMESPACE must be defined in .env"
      );
    }
    // Read generated emails
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

    // Use the password from the generated email if available, otherwise generate a new one
    const password = emailObj.password || generateRandomPassword(12);
    
    if (emailObj.password) {
        console.log(`Using password from generated-emails.json: ${password}`);
    } else {
        console.log(`No password found in generated-emails.json, generated new one: ${password}`);
    }

    await page.goto("/signup");

    await signUp(page, {
        firstName: TEST_USER.firstName,
        lastName: TEST_USER.lastName,
        company: TEST_USER.company,
        email, 
        password, 
        timestamp, 
        apiKey, 
        namespace
    });
  });

  //===============================================================================
  //Sign In
  test('Sign In', async ({ page }) => {
      await addCursorTracking(page);
      await page.goto('/signin');
      const SIGNIN_USER = getSigninUser();
      await signIn(page, {
        email: SIGNIN_USER.email, 
        password: SIGNIN_USER.validPassword
      });
    });
  });

  // ========================================
  // 2. Personal Life
  // ========================================

  test.describe('Personal Life', () => {
    test.beforeEach(async ({ page }) => {
      await addCursorTracking(page);
      await login(page);
      await expect(page).toHaveURL(/dashboard/);

      await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 30000 });
      await page.getByText('Personal Life', { exact: true }).click().catch(() => null);
      await expect(page).toHaveURL(/\/personal-life/).catch(() => null);
    });

    //Edit Profile
    test('Edit Profile', async ({ page }) => {
      await editProfile(page, personalDataEdit);
    });

    //Change Email
    test('Change Gmail', async ({ page }) => {  
      // Read generated emails to verify available accounts
      const generatedEmailsPath = path.resolve(__dirname, '../../generated-emails.json');
      if (!fs.existsSync(generatedEmailsPath)) {
          throw new Error("generated-emails.json not found. Cannot proceed with email change test.");
      }
      const generatedEmails = JSON.parse(fs.readFileSync(generatedEmailsPath, 'utf-8'));
      if (!Array.isArray(generatedEmails) || generatedEmails.length < 2) {
          throw new Error("Need at least 2 generated emails in generated-emails.json to test cycling.");
      }
  
      // Read current user data to find who is currently signed up/in
      const userDataPath = path.resolve(__dirname, '../../user-signin.json');
      let currentEmail = '';
      
      if (fs.existsSync(userDataPath)) {
          const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf-8'));
          // Try to get email from users array first
          if (userData.users && Array.isArray(userData.users) && userData.users.length > 0) {
              currentEmail = userData.users[0].email;
          } else if (userData.signupEmail) {
              currentEmail = userData.signupEmail;
          }
      }
  
      // Determine target email for the change
      const currentIndex = generatedEmails.findIndex((e: any) => e.email === currentEmail);
      
      if (currentIndex === -1) {
          console.log(`Current email ${currentEmail} not found in generated-emails.json (or no current user).`);
          // Proceed with caution, defaulting or failing might be expected if setup is strict.
          // In this context, we assume the user is valid.
      }
      
      const targetIndex = (currentIndex === -1 || currentIndex === 0) ? 1 : 0;
      const targetEmailData = generatedEmails[targetIndex];
      const targetEmail = targetEmailData.email;
  
      // Determine credential source for the TARGET email
      let targetApiKey = '';
      let targetNamespace = '';
      
      if (targetEmailData.source === 'email-helper1') {
          targetApiKey = process.env.TESTMAIL_API_KEY!;
          targetNamespace = process.env.TESTMAIL_NAMESPACE!;
      } else {
          targetApiKey = process.env.TESTMAIL_API_KEY2!;
          targetNamespace = process.env.TESTMAIL_NAMESPACE2!;
      }
  
      if (!targetApiKey || !targetNamespace) {
          throw new Error(`Could not find API keys for source: ${targetEmailData.source} (Target Email: ${targetEmail}). Check .env`);
      }
  
      await changeEmail(page, currentEmail, targetEmail, targetApiKey, targetNamespace);
    });

    //Update Password
    test('Update Password', async ({ page }) => {
        test.setTimeout(120000);

        // Find current password
        let currentPassword = 'Test@123'; // Fallback
        let currentEmail = '';
        const userDataPath = path.resolve(__dirname, '..', '..', 'user-signin.json');
        try {
            if (fs.existsSync(userDataPath)) {
                const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf-8'));
                if (userData.users && userData.users.length > 0) {
                     currentPassword = userData.users[userData.users.length - 1].password;
                     currentEmail = userData.users[userData.users.length - 1].email;
                } else if (userData.signupEmail) {
                     currentPassword = userData.signupPassword;
                     currentEmail = userData.signupEmail;
                }
            }
        } catch (e) {
            console.error("Error reading user-data.json for password:", e);
        }

        const newPassword = generateRandomPassword(12);

        await updatePassword(page, currentEmail, currentPassword, newPassword);
    });
  });

  // ========================================
  // 3. System Settings
  // ========================================

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

  // ========================================
  // 3. Users
  // ========================================

  test.describe("Users", () => {
    test.beforeEach(async ({ page }) => {
      await addCursorTracking(page);
      await login(page);
      await expect(page).toHaveURL(/dashboard/);
      await expect(
        page.getByText("Please wait while we load your workspace")
      ).toBeHidden({ timeout: 20000 });
      await page.getByText("User", { exact: true }).click();
      await expect(page).toHaveURL(/\/users/);
    });

    // Add new user
    test("CRUD Users", async ({ page }) => {

      await page
        .getByRole("button")
        .filter({ has: page.locator("svg.lucide-plus") })
        .click();
      await page.waitForTimeout(200);

      // Prepare email if needed
      const useGmail = (process.env.TESTMAIL_USE_GMAIL || '').toLowerCase() === 'true';
      const testEmail = useGmail
          ? `${userDataAdd.firstName.toLowerCase()}.${userDataAdd.lastName.toLowerCase()}+${Date.now()}@gmail.com`
          : generateTestmailAddress(process.env.TESTMAIL_NAMESPACE || 'username', String(Date.now()));
      console.log('Using test email for new user:', testEmail);
      
      await createUser(page, { ...userDataAdd, email: testEmail });

      //=============================================================
      // User list or grid view page
      await expect(page).toHaveTitle(/User/i);
      await page.waitForTimeout(1000);
      await toggleViewMode(page);
      await page.waitForTimeout(1000);

      //=============================================================
      // Update User
      const userRows = page.locator(
        'table tbody tr, [role="row"], .user-item, div[class*="user"]'
      );

      // Get the user at index 0 (first user)
      const userAtIndex0 = userRows.nth(0);
      await userAtIndex0.waitFor({ state: "visible", timeout: 5000 });
      const editIcon = userAtIndex0
        .locator("button")
        .filter({ has: page.locator("svg") })
        .filter({ hasNot: page.locator("svg.lucide-trash") })
        .first();

      if (await editIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editIcon.click();

        // Wait for the edit drawer/form to appear
        await page.waitForTimeout(1500);

        await updateUser(page, userDataEdit);
        
        await page.waitForTimeout(2000);
      }

          //=============================================================
      // Delete User
      const indexToDelete = 0;
      const userToDelete = userRows.nth(indexToDelete);
      if (await userToDelete.isVisible({ timeout: 5000 }).catch(() => false)) {
        const deleteIconInRow = userToDelete
          .locator("button")
          .filter({
            has: page.locator("svg.lucide-trash, svg.lucide-trash-2"),
          })
          .first();

        // Click the delete icon directly (don't click the user row)
        if (
          await deleteIconInRow.isVisible({ timeout: 3000 }).catch(() => false)
        ) {
          await deleteIconInRow.click();
          await page.waitForTimeout(1000);

          // Use the delete helper to handle the confirmation modal
          await deleteItem(page, "Confirm Delete");
        }
      }
    });
  });

  // ========================================
  // 3. Coaches 
  // ========================================
  test.describe('Coaches', () => {
    
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 20000 });
    await page.getByText('Coach', { exact: true }).click();
    await expect(page).toHaveURL(/\/coaches/);
    await page.waitForTimeout(1000);
  });
  
    // Add new coach
    test('CRUD Coach', async ({ page }) => {
      // test.setTimeout(300000); // 5 minutes timeout
      await page.getByRole('button').filter({ has: page.locator('svg.lucide-plus') }).click();
      await createCoach(page, coachDataAdd);
      await page.waitForTimeout(1000);

      // View list or grid coaches page
      await expect(page).toHaveTitle(/Coach/i);
      await page.waitForTimeout(1000);
      await toggleViewMode(page);
      await page.waitForTimeout(1000);

    //=========================================================================
      // Update coach
      
      const coachRows = page.locator('table tbody tr, [role="row"], .coach-row, div[class*="coach"]');
      
      await coachRows.first().waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(500);
      
      const firstCoach = coachRows.nth(0);
      await firstCoach.waitFor({ state: 'visible', timeout: 5000 });
      await firstCoach.click();
      await page.waitForTimeout(1500);
      
    // Open the actions menu (three-dot icon)
    const actionsMenuButton = page.locator('button:has(svg.lucide-ellipsis-vertical)')
      .or(page.getByRole('button', { name: /more options|actions|menu/i }))
      .or(page.locator('button[aria-haspopup="menu"]'))
      .or(page.locator('svg.lucide-ellipsis-vertical'))
      .first();

          await actionsMenuButton.waitFor({ state: 'visible', timeout: 5000 });
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
      
      // Look for Edit button in the dropdown menu
      const editButton = page.getByRole('menuitem', { name: /Edit/i })
        .or(page.getByRole('button', { name: /Edit/i }));
      
      if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editButton.click();
        
        // Wait for edit form to appear
        await page.waitForTimeout(1000);
  
      await updateCoach(page, coachDataEdit);
        await page.waitForTimeout(1000);

//=========================================================================
        // Click the back/close button to return to coaches list
      const backButton = page.locator('button:has(svg.lucide-arrow-left)')
        .or(page.locator('svg.lucide-arrow-left').locator('xpath=..'))
        .or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-arrow-left"]') }))
        .or(page.locator('button[aria-label*="back" i]'))
        .or(page.getByRole('button', { name: /Back|back/i }));
      
      await backButton.first().waitFor({ state: 'visible', timeout: 5000 });
      await backButton.first().scrollIntoViewIfNeeded();
      await backButton.first().click();
      await page.waitForTimeout(1500);
      }

//====================================================================
      
      await page.waitForTimeout(1000);

      // Delete coach
      await coachRows.first().waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(500);
      
      // Click the first coach to select it
      await coachRows.nth(0).click();
      await page.waitForTimeout(1500);
      await deleteEntityViaActionMenu(page, null, 'Confirm Delete');
      
      await page.waitForTimeout(1000);


//====================================================================
    // Create Coach Again
    
      // Navigate to list view to find the Add button
      await page.waitForTimeout(1000);

      await page.getByRole('button').filter({ has: page.locator('svg.lucide-plus') }).click();
    // Generate new email for re-creation to ensure uniqueness
    const emailParts = coachDataAdd.email.split('@');
    const cleanLocalPart = emailParts[0].split('+')[0]; 
    coachDataAdd.email = `${cleanLocalPart}+${Date.now()}@${emailParts[1]}`;
    
    await createCoach(page, coachDataAdd);
    await page.waitForTimeout(1000);
    });
  });

  // ========================================
  // 5. Students 
  // ========================================
test.describe('Students', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 10000 });
    await page.getByText('Student', { exact: true }).click();
    await page.waitForTimeout(500);
    
    // Go to Dashboard first
    await page.getByText('Dashboard', { exact: true }).last().click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/students/);
    await page.waitForTimeout(500);

    // Then List Students
    await page.getByText('List Students', { exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/students/);
    await page.waitForTimeout(1000);
  });

  // ===================================
  // Add new student
  // ===================================
  test('CRUD Students', async ({ page }) => {
    await page.locator('body > div > div.flex-1.flex.gap-10 > div.flex-1.min-w-\\[600px\\].overflow-auto > div > button').click();
    
    await createStudent(page, studentDataAdd);

//===================================================================
// Students list or gird view page
    await expect(page).toHaveTitle(/Student/i);
    await page.waitForTimeout(1000);
    await toggleViewMode(page);
    await page.waitForTimeout(1000);

//===================================================================
// Update Student

    const studentRows = page.locator('table tbody tr, [role="row"], .student-row, div[class*="student"]');
    await studentRows.first().waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
    
    // Click on the first student
    const firstStudent = studentRows.nth(0);
    await firstStudent.waitFor({ state: 'visible', timeout: 5000 });
    await firstStudent.click();
    await page.waitForTimeout(1500);
    
    // Open the actions menu (three-dot icon)
    const actionsMenuButton = page.locator('button:has(svg.lucide-ellipsis-vertical)')
      .or(page.getByRole('button', { name: /more options|actions|menu/i }))
      .or(page.locator('button[aria-haspopup="menu"]'))
      .or(page.locator('svg.lucide-ellipsis-vertical'))
      .first();
    
    await actionsMenuButton.waitFor({ state: 'visible', timeout: 5000 });
    await actionsMenuButton.click();
    await page.waitForTimeout(500);
    
    // Look for Edit button in the dropdown menu
    const editButton = page.getByRole('menuitem', { name: /Edit/i })
      .or(page.getByRole('button', { name: /Edit/i }));
    
    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editButton.click();
      
      await updateStudent(page, studentDataEdit);
    } else {
      console.log('Edit functionality not found');
    }

    //=========================================================================
        // Click the back/close button to return to coaches list
      const backButton = page.locator('button:has(svg.lucide-arrow-left)')
        .or(page.locator('svg.lucide-arrow-left').locator('xpath=..'))
        .or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-arrow-left"]') }))
        .or(page.locator('button[aria-label*="back" i]'))
        .or(page.getByRole('button', { name: /Back|back/i }));
      
      await backButton.first().waitFor({ state: 'visible', timeout: 5000 });
      await backButton.first().scrollIntoViewIfNeeded();
      await backButton.first().click();
      await page.waitForTimeout(1500);
      
//==============================================================================
//Delete Student

    const rowsToDelete = page.locator('table tbody tr, [role="row"], .student-row, div[class*="student"]');
    await rowsToDelete.count();
    const indexToDelete = 0;
    const studentToDelete = rowsToDelete.nth(indexToDelete);
    await studentToDelete.waitFor({ state: 'visible', timeout: 5000 });
    await studentToDelete.click();
    await page.waitForTimeout(1500);
    await deleteEntityViaActionMenu(page, null, 'Confirm Delete');
    await page.waitForTimeout(1000);


//==============================================================================
 //Create Student Again

 // Generate new email for re-creation
 const randomSuffixAgain = Math.floor(Math.random() * 10000);
 studentDataAdd.email = `${staticData.studentDataAdd.emailPrefix}.${randomSuffixAgain}@gmail.com`;

 await page.locator('body > div > div.flex-1.flex.gap-10 > div.flex-1.min-w-\\[600px\\].overflow-auto > div > button').click();
    
 await createStudent(page, studentDataAdd);

  });
});

  // ========================================
  // 6. Material 
  // ========================================

  test.describe('Materials', () => {
    
    test.beforeEach(async ({ page }) => {
      await addCursorTracking(page);
      
      await login(page);
      
      await expect(page).toHaveURL(/dashboard/);
      await page.waitForTimeout(2000);
  
      await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 30000 });
      
      await page.getByText('Material', { exact: true }).click() ;
      
      await expect(page).toHaveURL(/material/);
    });
  
    // ===================================
    // Helper function to select a material and open its details
    // ===================================
    async function selectMaterial(page: any, index: number = 1) {
      const materialRows = page.locator('table tbody tr, [role="row"], .material-row');
      await materialRows.first().waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(500);
      const materialAtIndex = materialRows.nth(index);
      await materialAtIndex.waitFor({ state: 'visible', timeout: 5000 });
      await materialAtIndex.click();
      await page.waitForTimeout(1500);
    }
  
    test('CRUD Material', async ({ page }) => {
      await page.locator('#add-material-button').click();
      
      const createImagePath = path.join(__dirname, '..', '..','public', 'images', 'thumbnail-create.pdf');
      await createMaterial(page, { filePath: createImagePath });

    //================================================================================
    // Material list or grid view 
      await page.waitForTimeout(1000);
      await toggleViewMode(page);
      await page.waitForTimeout(1000);
    //================================================================================
      // Update Material
      await selectMaterial(page, 0);
      
      // Open the actions menu (three-dot icon)
      const actionsMenuButton = page.getByRole('button', { name: /more options|actions|menu/i })
        .or(page.locator('button[aria-haspopup="menu"]'))
        .or(page.locator('svg.lucide-ellipsis-vertical'))
        .first();
      await actionsMenuButton.click();
      await page.waitForTimeout(500);
      
      // Look for Edit button in the dropdown menu
      const editButton = page.getByRole('menuitem', { name: /Edit/i }).or(page.getByRole('button', { name: /Edit/i }));
      
      if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editButton.click();
        
        const updateImagePath = path.join(__dirname, '..', '..', 'public', 'images', 'thumbnail-update.pdf');
        await updateMaterial(page, { filePath: updateImagePath });
        
        // Take a screenshot after successful edit
        await page.screenshot({ 
          path: 'test-results/screenshots/material-edited.png',
          fullPage: true 
        });
      } else {
        console.log('Edit functionality not found');
      }
          //=========================================================================
        // Click the back/close button to return to coaches list
      const backButton = page.locator('button:has(svg.lucide-arrow-left)')
        .or(page.locator('svg.lucide-arrow-left').locator('xpath=..'))
        .or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-arrow-left"]') }))
        .or(page.locator('button[aria-label*="back" i]'))
        .or(page.getByRole('button', { name: /Back|back/i }));
      
      await backButton.first().waitFor({ state: 'visible', timeout: 5000 });
      await backButton.first().scrollIntoViewIfNeeded();
      await backButton.first().click();
      await page.waitForTimeout(1500);

      //================================================================================
      // Delete Material

      // Select and open the first material (index 0)
      await selectMaterial(page, 0);
      await deleteEntityViaActionMenu(page, null, 'Confirm Delete');
    });
});

    // ========================================
  // 7. Lessons 
  // ========================================

  test.describe('Lessons', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);

    await page.getByText('Course', { exact: true }).click();
    await page.waitForTimeout(500); // Wait for dropdown to open
    
    // Then click Lessons from the dropdown menu
    await page.getByText('Lessons', { exact: true }).click();
    
    // Ensure we are on the lessons page before each test starts
    await expect(page).toHaveURL(/courses\/lessons/);
  });
//   =====================================
// Add new lesson
//   =====================================

  test('CRUD Lessons', async ({ page }) => {
    await page.locator('#add-lesson-button').or(page.getByRole('button', { name: /add lesson/i })).click();
    
    const videoPath = path.join(__dirname, '..', '..', 'public', 'video', 'seksaa-vdo.mp4');
    const documentPath = path.join(__dirname, '..', '..', 'public', 'images', 'thumbnail-create.pdf');

    await createLesson(page, {
      ...lessonDataAdd,
      videoPath: videoPath,
      documentPath: documentPath
    });

    //====================================================================
    // Close Dialog by clicking the X icon (if still open or new dialog appeared)
    const closeIcon = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
    if (await closeIcon.isVisible().catch(() => false)) {
      await closeIcon.click();
      await page.waitForTimeout(1000);
    }

    //==================================================================================
    //Update Lesson
    const lessonRows = page.locator('table tbody tr, [role="row"], .lesson-item, div[class*="lesson"]');
    const lessonAtIndex0 = lessonRows.nth(0);
    await lessonAtIndex0.waitFor({ state: 'visible', timeout: 2000 });
    const editIcon = lessonAtIndex0.locator('button').filter({ has: page.locator('svg.lucide-square-pen, svg.lucide-edit, svg.lucide-pencil') }).first()
      .or(lessonAtIndex0.getByRole('button', { name: /edit/i }).first())
      .or(lessonAtIndex0.getByText(/Edit/i).first())
      .or(lessonAtIndex0.locator('button[aria-label*="edit" i]').first());
    
    if (await editIcon.isVisible({ timeout: 1000 }).catch(() => false)) {
      await editIcon.click();
      console.log('✓ Clicked edit icon');
      
      await updateLesson(page, lessonDataEdit);
    }

    //=================================================================================
    //Delete Lesson
    const lessonRowsToDelete = page.locator('table tbody tr, [role="row"], .lesson-item, div[class*="lesson"]');    
    const indexToDelete = 0;
    const lessonToDelete = lessonRowsToDelete.nth(indexToDelete);
    
    if (await lessonToDelete.isVisible({ timeout: 1000 }).catch(() => false)) {
      const deleteIconInRow = lessonToDelete.locator('button').filter({ 
        has: page.locator('svg.lucide-trash, svg.lucide-trash-2') 
      }).first();
      
      // Click the delete icon directly (don't click the lesson row)
      if (await deleteIconInRow.isVisible({ timeout: 1000 }).catch(() => false)) {
        await deleteIconInRow.click();
        await page.waitForTimeout(1000);
        
        // Use the delete helper to handle the confirmation modal
        await deleteItem(page, 'Confirm Delete');
      }
    } 

    //================================================================================
    //Create Lesson again

     await page.locator('#add-lesson-button').or(page.getByRole('button', { name: /add lesson/i })).click();
    
    await createLesson(page, {
      ...lessonDataAdd,
      videoPath: videoPath,
      documentPath: documentPath
    });
    
    await page.waitForTimeout(1000);
  });
});

  // ========================================
  // 8. Modules 
  // ========================================

  test.describe('Modules', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden();
    await page.getByText('Course', { exact: true }).click();
    await page.waitForTimeout(500); 
    await page.getByText('Modules', { exact: true }).click();
    await expect(page).toHaveURL(/courses\/modules/);
  });
  test('CRUD Modules', async ({ page }) => {
    await page.locator('#add-module-button').or(page.getByRole('button', { name: /add module/i })).click();
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible();
    await page.waitForTimeout(500);
    
    // Fill Title field with realistic typing
    const titleField = page.locator('#title').or(page.getByLabel(/title/i)).or(page.getByPlaceholder(/title/i));
    await FileInput(titleField, moduleDataAdd.title);
   
    // Fill Description field
    const descriptionField = page.locator('#description')
      .or(page.getByLabel(/description/i))
      .or(page.getByPlaceholder(/description/i));
    await FileInput(descriptionField, moduleDataAdd.description);
    // Submit the form
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Add|Create|Submit/i }).click();
    await page.waitForTimeout(1000);


    // Close Dialog by clicking the X icon
    const closeIcon = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
    if (await closeIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeIcon.click();
      await page.waitForTimeout(1000);
    }
//====================================================================================================
    // Update Module
    const lessonRows = page.locator('table tbody tr, [role="row"], .lesson-item, div[class*="lesson"]');
    const lessonAtIndex0 = lessonRows.nth(0);
    await lessonAtIndex0.waitFor({ state: 'visible', timeout: 2000 });
    // Click the edit icon (pencil icon) directly within the lesson row
    const editIcon = lessonAtIndex0.locator('button').filter({ has: page.locator('svg.lucide-square-pen, svg.lucide-edit, svg.lucide-pencil') }).first()
      .or(lessonAtIndex0.getByRole('button', { name: /edit/i }).first())
      .or(lessonAtIndex0.getByText(/Edit/i).first())
      .or(lessonAtIndex0.locator('button[aria-label*="edit" i]').first());
    
    if (await editIcon.isVisible({ timeout: 1000 }).catch(() => false)) {
      await editIcon.click();
      
      // Wait for the edit drawer/form to appear
      await page.waitForTimeout(800);
      
      // Edit Title field
      const titleField = page.locator('#title').or(page.getByLabel(/title/i));
      if (await titleField.isVisible({ timeout: 1000 }).catch(() => false)) {
        await titleField.clear();
        await FileInput(titleField, moduleDataEdit.title);
      }
      
      // Edit Description field
      const descriptionField = page.locator('#description').or(page.getByLabel(/description/i));
      if (await descriptionField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await descriptionField.clear();
        await FileInput(descriptionField, moduleDataEdit.description);
      }
      ;
      await page.getByRole('button', { name: /Update|Save|Submit/i }).click();
      await page.waitForTimeout(1000);
    }
    
//=====================================================================================================
    // Delete Module    
    const moduleRows = page.locator('table tbody tr, [role="row"], .module-item, div[class*="module"]');
    const indexToDelete = 0;
    const moduleToDelete = moduleRows.nth(indexToDelete);
    
    if (await moduleToDelete.isVisible({ timeout: 2000 }).catch(() => false)) {
      const deleteIconInRow = moduleToDelete.locator('button').filter({ 
        has: page.locator('svg.lucide-trash, svg.lucide-trash-2') 
      }).first();
      
      // Click the delete icon directly (don't click the module row)
      if (await deleteIconInRow.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteIconInRow.click();
        await page.waitForTimeout(1000);
        await deleteItem(page, 'Confirm Delete');
      }
    }

//=====================================================================================================
//Create Module Again

 await page.locator('#add-module-button').or(page.getByRole('button', { name: /add module/i })).click();
    
    // Wait for the drawer form to appear
    await expect(page.getByRole('textbox').first()).toBeVisible();
    await page.waitForTimeout(500);
    
    // Fill Title field with realistic typing
    const titleFieldAgain = page.locator('#title').or(page.getByLabel(/title/i)).or(page.getByPlaceholder(/title/i));
    await FileInput(titleFieldAgain, moduleDataAdd.title);
   
    // Fill Description field
    const descriptionFieldAgain = page.locator('#description')
      .or(page.getByLabel(/description/i))
      .or(page.getByPlaceholder(/description/i));
    await FileInput(descriptionFieldAgain, moduleDataAdd.description);
    // Submit the form
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Add|Create|Submit/i }).click();
    await page.waitForTimeout(1000);
  });
});

  // ========================================
  // 9. Courses 
  // ========================================

  test.describe('Courses', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    
    await page.getByText('Course', { exact: true }).click();
    
    const coursesLink = page.getByRole('link', { name: 'Courses', exact: true })
                      .or(page.getByText('Courses', { exact: true }));
    
    if (await coursesLink.isVisible()) {
        await coursesLink.click();
    }
    
    await expect(page).toHaveURL(/courses/); 
  });

  // =====================================
  // Add new course
  // =====================================
  test('CRUD Courses', async ({ page }) => {
    const addButton = page.locator('#add-course-button')
        .or(page.getByRole('button', { name: /add course/i }));
        
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    await addButton.click();
    
    // 2. Create Course using helper
    await createCourse(page, courseDataAdd);
    await page.waitForTimeout(1000);

  //======================================================================================
  // Course List or Grid view
   
      await toggleViewMode(page);

      // Filter by Subject
      const filterSubjectDropdown = page.getByTestId('subjects-dropdown').or(
          page.getByRole('combobox').filter({ hasText: /all subjects/i })
      );
      await expect(filterSubjectDropdown).toBeVisible();
      await filterSubjectDropdown.click();
      
      await expect(filterSubjectDropdown).toHaveAttribute('aria-expanded', 'true');
      
      const filterSubjectOptions = page.getByRole('option');
      await expect(filterSubjectOptions.first()).toBeVisible();
      await expect(filterSubjectOptions.nth(1)).toBeVisible();
      await page.waitForTimeout(300); 
      await filterSubjectOptions.nth(2).click();

      // Filter by Level
      const filterLevelDropdown = page.getByRole('combobox').filter({ hasText: /all levels/i });
      await expect(filterLevelDropdown).toBeVisible();
      await filterLevelDropdown.click();
      
      await expect(filterLevelDropdown).toHaveAttribute('aria-expanded', 'true');

      const filterLevelOptions = page.getByRole('option');
      await expect(filterLevelOptions.nth(1)).toBeVisible();
      
      await page.waitForTimeout(300); 
      await filterLevelOptions.nth(1).click();
      await page.waitForTimeout(2000); // Wait for table to update/re-render
      //=========================================================================================
      // Update Course
    const courseRows = page.locator('table tbody tr, [role="row"], .course-item, div[class*="course-card"]');
    await expect(courseRows.first()).toBeVisible({ timeout: 10000 });

    // Get the course at index 0
    const courseAtIndex0 = courseRows.first();
    await courseAtIndex0.scrollIntoViewIfNeeded();
    
    // Click the "three dots" / More Options menu in the row
    const moreMenuBtn = courseAtIndex0.locator('button').filter({ has: page.locator('svg.lucide-more-vertical, svg.lucide-ellipsis, svg.lucide-more-horizontal') }).first();
    
    if (await moreMenuBtn.isVisible({ timeout: 5000 })) {
        await moreMenuBtn.click();
        await page.waitForTimeout(500); // Wait for menu to open
    } else {
        await courseAtIndex0.click({ force: true });
    }
    await page.waitForTimeout(1000);
 
        // click on icon three dot
        await openActionMenu(page);
    
    const editButton = page.getByRole('menuitem', { name: /Edit/i }).or(page.getByRole('button', { name: /Edit/i }));
    
    if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editButton.click({ force: true });
      await updateCourse(page, courseDataEdit);
    }

    //==============================================================================================
    // Delete Course
    
    await page.waitForTimeout(2000); // Wait for update execution to finish
    
    // Open action menu for the first item (which we just updated)
    await openActionMenu(page);
    
    // Click Delete button
    const deleteButtonCourse = page.getByRole('menuitem', { name: /Delete|Remove/i })
        .or(page.getByRole('button', { name: /Delete|Remove/i }));
        
    if (await deleteButtonCourse.isVisible({ timeout: 5000 }).catch(() => false)) {
        await deleteButtonCourse.click();
        await page.waitForTimeout(1000);
        
        // Confirm deletion
        await deleteItem(page, 'Confirm Delete');
    }

//==============================================================================================
// Create Course Again

 const addButtonAgain = page.locator('#add-course-button')
        .or(page.getByRole('button', { name: /add course/i }));
        
    await addButtonAgain.waitFor({ state: 'visible', timeout: 10000 });
    await addButtonAgain.click();
    
    await createCourse(page, courseDataAdd);
  });
});

  // ========================================
  // 10. Classes 
  // ========================================

  test.describe('Classes', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Class', { exact: true }).click();
    await expect(page).toHaveURL(/classes/);
  });

  test('CRUD Class', async ({ page }) => {
    // Create Class using helper
    await createClass(page, staticData.classDataAdd);


      //======================================================================================
  // Class List or Grid view
      await toggleViewMode(page);

      //======================================================================================
  // Update Class
    await page.waitForTimeout(1000);
    const classRows = page.locator('table tbody tr, [role="row"], .class-item, div[class*="class"]');
    
    const classAtIndex0 = classRows.nth(0);
    await classAtIndex0.waitFor({ state: 'visible', timeout: 5000 });
    await classAtIndex0.click();
    await page.waitForTimeout(1500);

    // Open the actions menu (three-dot icon)
    await openActionMenu(page);
    
    // Click on Edit option in the menu
    const editButton = page.getByRole('menuitem', { name: /Edit/i }).or(page.getByRole('button', { name: /Edit/i }));
    
    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editButton.click();
      
      await updateClass(page, staticData.classDataEdit);

    }
    
    //=========================================================================
        // Click the back/close button to return to coaches list
      const backButton = page.locator('button:has(svg.lucide-arrow-left)')
        .or(page.locator('svg.lucide-arrow-left').locator('xpath=..'))
        .or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-arrow-left"]') }))
        .or(page.locator('button[aria-label*="back" i]'))
        .or(page.getByRole('button', { name: /Back|back/i }));
      
      await backButton.first().waitFor({ state: 'visible', timeout: 5000 });
      await backButton.first().scrollIntoViewIfNeeded();
      await backButton.first().click();
      await page.waitForTimeout(1500);
      
      //======================================================================================
    // Delete Class
    const classRowsToDelete = page.locator('table tbody tr, [role="row"], .class-item, div[class*="class"]');
    const indexToDelete = 0;
    const classToDelete = classRowsToDelete.nth(indexToDelete);
    
    await deleteEntityViaActionMenu(page, classToDelete, 'Confirm Delete');

//=============================================================================================
// Create Class Again
 await createClass(page, staticData.classDataAdd);

  });
});

  // ========================================
  // 11. Attendance 
  // ========================================

  test.describe('Attendances', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await page.waitForTimeout(1000);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 45000 });
    const attendanceLink = page.getByText('Attendance', { exact: true })
      .or(page.getByText('Attendances', { exact: true }))
      .or(page.locator('a[href*="/attendance"]')); 
    
    if (await attendanceLink.isVisible().catch(() => false)) {
      await attendanceLink.click();
    }
    
    await expect(page).toHaveURL(/attendance/i);
    await page.waitForTimeout(1000);            
  });

  //   ====================================== 
  // CRUD Attendance
  //   ====================================== 
  test('CRUD Attendance', async ({ page }) => {
      await createAttendance(page);
      await updateAttendance(page);
      await deleteAttendance(page);
  });
});

  // ========================================
  // 12. Invoices 
  // ========================================

  test.describe('Invoices', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    
    // Navigate to Invoices page
    const invoiceLink = page.getByText('Invoice', { exact: true })
      .or(page.getByText('Invoices', { exact: true }))
      .or(page.locator('a[href*="/invoice"]'));
    
    if (await invoiceLink.isVisible().catch(() => false)) {
      await invoiceLink.click();
    }
    
    await expect(page).toHaveURL(/invoice/i);
    await page.waitForTimeout(1000);
  });

  test('CRUD Invoice', async ({ page }) => {
      await createInvoice(page);
      await updateInvoice(page);
      await downloadInvoice(page);
      await deleteInvoice(page);
  });
});

  // ========================================
  // 13. Engagements 
  // ========================================

  test.describe('Engagements', () => {
  
  test.beforeEach(async ({ page }) => {
    await addCursorTracking(page);
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    
    // Navigate to Engagements Dashboard first
    await page.getByText('Engagement', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('Dashboard', { exact: true }).last().click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/engagements');
    await page.waitForTimeout(1000);
    
    // Then navigate to List Engagements
    await page.getByText('List Engagements', { exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/engagements/);
    await page.waitForTimeout(1000);
  });

  test('CRUD Engagement', async ({ page }) => {
    const randomSuffix = Math.floor(Math.random() * 10000);
    const activityTitle = `Activity Title ${randomSuffix}`;
    
    // Create Engagement
    await createEngagement(page, engagementDataAdd);

    // Edit Engagement
    await editEngagement(page, engagementDataEdit);
    
    // Create Activity
    await createActivity(page, { 
      ...activityDataAdd,
      title: activityTitle,
    });

    // Update Activity
    await editActivity(page, { 
      ...activityDataEdit,
      originalTitle: activityTitle,
    });

    // Activity Comments
    await createComment(page, 'Activities', activityCommentDataAdd.comment);
    await editComment(page, 'Activities', activityCommentDataEdit.comment);
    await deleteComment(page, 'Activities');

    // Email Flow
    await createEmail(page, emailDataAdd);
    await editEmail(page, emailDataEdit);
    
    // Email Comments
    await createComment(page, 'Emails', emailCommentDataAdd.comment);
    await editComment(page, 'Emails', emailCommentDataEdit.comment);
    await deleteComment(page, 'Emails');

    // Call Flow
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); 
    const dd = String(today.getDate()).padStart(2, '0');
    const yyyy = today.getFullYear();
    const endDateFormatted = `${mm}-${dd}-${yyyy}`;
    
    await createCall(page, {
        ...callDataAdd,
        date: endDateFormatted
    });

    await editCall(page, {
        ...callDataEdit,
        date: endDateFormatted
    });

    // // Call Comments
    await createComment(page, 'Calls', callCommentDataAdd.comment);
    await editComment(page, 'Calls', callCommentDataEdit.comment);
    await deleteComment(page, 'Calls');

    // Note Flow
    await createNote(page, noteDataAdd);
    await editNote(page, noteDataEdit);

    // Note Comments
    await createComment(page, 'Notes', noteCommentDataAdd.comment);
    await editComment(page, 'Notes', noteCommentDataEdit.comment);
    await deleteComment(page, 'Notes');
    await deleteEngagement(page);
  });
});

});
