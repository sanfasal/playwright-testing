import { Page, expect } from '@playwright/test';
import { FileInput } from '../utils/form-helper';
import { uploadThumbnail } from '../utils/upload-thumbnail-helper';

/**
 * Updates the system settings.
 * @param page - Playwright Page object
 * @param systemDataEdit - Object containing new system data
 */
export async function updateSystem(page: Page, systemDataEdit: any) {
    // Try to click the page-level "Update Settings" button first
    const pageUpdateBtn = page
    .getByRole("button", { name: /^Update Settings$/i })
    .first();
    if (await pageUpdateBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await pageUpdateBtn.click();
    await page.waitForTimeout(800);
    } else {
    // Fallback: try a row-local Edit button or a generic Edit button
    const rows = page.locator(
        'table tbody tr, [role="row"], .system-item, div[class*="system"]'
    );
    const row = rows.nth(0);
    if (!(await row.isVisible({ timeout: 3000 }).catch(() => false))) return;

    const preferredBtnByText = row
        .getByRole("button", { name: /Edit System|Edit/i })
        .first();
    let editBtn = preferredBtnByText;
    if (
        !(await preferredBtnByText
        .isVisible({ timeout: 1000 })
        .catch(() => false))
    ) {
        const globalBtn = page
        .getByRole("button", { name: /Edit System|Edit/i })
        .first();
        if (await globalBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        editBtn = globalBtn;
        } else {
        editBtn = row
            .locator("button")
            .filter({ has: page.locator("svg") })
            .first();
        }
    }

    if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editBtn.click();
        await page.waitForTimeout(1200);
    }
    }

    // Upload Profile Image
    await uploadThumbnail(page, "file-input-profile || selected-exist-profile");

    // Edit Name
    const nameField = page
    .getByLabel(/Name|System Name/i)
    .or(page.locator('#name, input[name="name"]'));
    if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await nameField.clear();
    await FileInput(nameField, systemDataEdit.name);
    }

    // Edit Contact Email
    const emailField = page
    .getByLabel(/Email|Contact Email/i)
    .or(page.getByPlaceholder(/email/i))
    .or(page.locator('input[type="email"]'));
    if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await emailField.clear();
    await FileInput(emailField, systemDataEdit.contactEmail);
    }

    // Edit Phone
    const phoneField = page
    .getByLabel(/Phone|Contact Number/i)
    .or(page.locator("#phone"));
    if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await phoneField.clear();
    await FileInput(phoneField, systemDataEdit.phone);
    }

    // Website
    const websiteField = page
    .getByLabel(/Website/i)
    .or(page.locator('#website, input[name="website"]'));
    if (await websiteField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await websiteField.clear();
    await FileInput(websiteField, systemDataEdit.website);
    }

    // Edit Address fields (Village, Commune, District, City)
    const villageField = page
    .getByPlaceholder("Village")
    .or(page.locator('input[name="address.village"]'))
    .or(page.getByLabel(/Village/i));
    if (await villageField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await villageField.clear();
    await FileInput(
        villageField,
        systemDataEdit.village
    );
    await page.waitForTimeout(500);
    }

    const communeField = page
    .getByPlaceholder("Commune")
    .or(page.locator('input[name="address.commune"]'))
    .or(page.locator("#commune"));
    if (await communeField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await communeField.scrollIntoViewIfNeeded();
    const isDisabled = await communeField.isDisabled().catch(() => false);
    if (!isDisabled) {
        await communeField.clear();
        await FileInput(communeField, systemDataEdit.commune); 
    }
    }

    const districtField = page
    .getByPlaceholder("District")
    .or(page.locator('input[name="address.district"]'))
    .or(page.locator("#district"));
    if (await districtField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await districtField.scrollIntoViewIfNeeded();
    const isDisabled = await districtField.isDisabled().catch(() => false);
    if (!isDisabled) {
        await districtField.clear();
        await FileInput(districtField, systemDataEdit.district);
    }
    }

    const cityField = page
    .getByPlaceholder("Province")
    .or(page.locator('input[name="address.city"]'))
    .or(page.locator("#city"));
    if (await cityField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cityField.scrollIntoViewIfNeeded();
    const isDisabled = await cityField.isDisabled().catch(() => false);
    if (!isDisabled) {
        await cityField.clear();
        await FileInput(cityField, systemDataEdit.city);
    }
    }

    // Submit
    const submitButton = page.getByRole("button", {
    name: /Update|Save|Submit/i,
    });
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await submitButton.click();
    await page.waitForTimeout(1500);
    }
}
