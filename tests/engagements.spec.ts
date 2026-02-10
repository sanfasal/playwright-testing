
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth-helper';
import { 
  createEngagement, 
  editEngagement, 
  deleteEngagement,
  createActivity,
  editActivity,
  deleteActivity,
  createEmail,
  editEmail,
  deleteEmail,
  createCall,
  editCall,
  deleteCall,
  createNote,
  editNote,
  deleteNote,
  createComment,
  editComment,
  deleteComment
} from '../components/engagements'; 
import staticData from '../constant/static-data.json';

const {
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

// Test suite for Engagement Dashboard
const randomSuffix = Math.floor(Math.random() * 10000);

// Merge static data with dynamic unique values
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

test.describe('Engagement Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Engagement', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('Dashboard', { exact: true }).last().click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/engagements');
    await page.waitForTimeout(1000);
  });

  test('Dashboard page loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
  });
});

// Test suite for Engagement List
test.describe('Engagement', () => {
  test.setTimeout(120000);
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Engagement', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('List Engagements', { exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/engagements/);
    await page.waitForTimeout(1000);
  });

  // ============================
  // Add new engagement
  //=============================

  test('Add new engagement', async ({ page }) => {
    await createEngagement(page, engagementDataAdd);
  });

  //=============================
  // View Detail Engagement
  //=============================
  test('View Detail Engagement', async ({ page }) => {
    await expect(page).toHaveTitle(/Engagement/i);
    await page.waitForTimeout(1000);
    
    // Select an item
    await page.locator('span.bg-yellow-500').or(page.locator('p[title="Won"]')).or(page.locator('p[title="Lost"]')).first().click();
    await page.waitForTimeout(1000);
    
    // Click on Activities tab
    await page.getByText('Activities', { exact: true }).click();
    await page.waitForTimeout(500);

    // Click on Emails tab
    await page.getByText('Emails', { exact: true }).click();
    await page.waitForTimeout(500);

    // Click on Calls tab
    await page.getByText('Calls', { exact: true }).click();
    await page.waitForTimeout(500);

    // Click on Notes tab
    await page.getByText('Notes', { exact: true }).click();
    await page.waitForTimeout(500);
  });

  // ============================
  // Edit Engagement
  // ============================

  test('Edit Engagement', async ({ page }) => {
    await editEngagement(page, engagementDataEdit);
  });

  // ============================
  // Delete Engagement
  // ============================

  test('Delete Engagement', async ({ page }) => {
    await deleteEngagement(page);
  });
});

test.describe('Engagement Tabs List', () => {
  test.setTimeout(120000);
  
  test.beforeEach(async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Please wait while we load your workspace')).toBeHidden({ timeout: 60000 });
    await page.getByText('Engagement', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByText('List Engagements', { exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/engagements/);
    await page.waitForTimeout(1000);
  });

  // ====================================================================================
  //  Activity
  // ====================================================================================

  // Create Activity
  test('Create Activity', async ({ page }) => {
    await createActivity(page, activityDataAdd);
  });

  // Edit Activity
  test('Edit Activity', async ({ page }) => {
    await editActivity(page, activityDataEdit);
  });

  // Create Comment
  test('Comment on Activity', async ({ page }) => {
    await createComment(page, 'Activities', activityCommentDataAdd.comment);
  });

  // Edit Comment
  test('Edit on Comment Activity', async ({ page }) => {
    await editComment(page, 'Activities', activityCommentDataEdit.comment);
  });

  // Delete Comment
  test('Delete Comment on Activity', async ({ page }) => {
    await deleteComment(page, 'Activities');
  });

    // Delete Activity
  test('Delete Activity', async ({ page }) => {
    await deleteActivity(page, activityDataAdd.title);
  });


  // ====================================================================================
  //  Emails
  // ====================================================================================

  // Create Email
    test('Create Email', async ({ page }) => {
    await createEmail(page, emailDataAdd);
  });

  // Edit Email
  test('Edit Email', async ({ page }) => {
    await editEmail(page, emailDataEdit);
  });

    // Create Comment
  test('Comment on Email', async ({ page }) => {
    await createComment(page, 'Emails', emailCommentDataAdd.comment);
  });

  // Edit Comment
  test('Edit Comment on Email', async ({ page }) => {
    await editComment(page, 'Emails', emailCommentDataEdit.comment);
  });

  // Delete Comment
  test('Delete Comment on Email', async ({ page }) => {
    await deleteComment(page, 'Emails');
  });

  // Delete Email
  test('Delete Email', async ({ page }) => {
    await deleteEmail(page, emailDataAdd.subject); 
  });

  // ====================================================================================
  //  Calls
  // ====================================================================================

  // Create Calls
  test('Create Calls', async ({ page }) => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); 
    const dd = String(today.getDate()).padStart(2, '0');
    const yyyy = today.getFullYear();
    const endDateFormatted = `${mm}-${dd}-${yyyy}`; 

    await createCall(page, {
        ...callDataAdd,
        date: endDateFormatted
    });
  });

  // Edit Calls
  test('Edit Calls', async ({ page }) => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); 
    const dd = String(today.getDate()).padStart(2, '0');
    const yyyy = today.getFullYear();
    const endDateFormatted = `${mm}-${dd}-${yyyy}`;

    await editCall(page, {
        ...callDataEdit,
        date: endDateFormatted
    });
  });

  // Create Comment
  test('Comment on Calls', async ({ page }) => {
    await createComment(page, 'Calls', callCommentDataAdd.comment);
  });

  // Edit Comment
  test('Edit Comment on Calls', async ({ page }) => {
    await editComment(page, 'Calls', callCommentDataEdit.comment);
  });

  // Delete Comment
  test('Delete Comment on Calls', async ({ page }) => {
    await deleteComment(page, 'Calls');
  });

  //Delete Call
  test('Delete Call', async ({ page }) => {
    await deleteCall(page);
  });

  // ====================================================================================
  //  Notes
  // ====================================================================================

  // Create Note
  test('Create Note', async ({ page }) => {
    await createNote(page, noteDataAdd);
  });

  // Edit Note
  test('Edit Note', async ({ page }) => {
    await editNote(page, noteDataEdit);
  });

  // Create Comment
  test('Comment on Notes', async ({ page }) => {
    await createComment(page, 'Notes', noteCommentDataAdd.comment);
  });

  // Edit Comment on Notes
  test('Edit Comment on Notes', async ({ page }) => {
    await editComment(page, 'Notes', noteCommentDataEdit.comment);
  });

  // Delete Comment
  test('Delete Comment on Notes', async ({ page }) => {
    await deleteComment(page, 'Notes');
  });

    // Delete Note
  test('Delete Note', async ({ page }) => {
    await deleteNote(page, noteDataAdd.note);
  });

});
