import { expect } from '@playwright/test';
import { test } from '../module2/pages/fixtures/base2.js';

/**
 * Lecture: Use better locators
 *
 * Both tests below pass today. The difference shows up when the markup changes:
 * a renamed CSS class, a reordered list or a wrapping <div> breaks the BAD
 * locators, while the GOOD ones describe what the user sees and keep working.
 *
 * Priority: getByRole > getByLabel / getByText > getByTestId > CSS / XPath.
 */

test.describe('Use better locators', () => {
    test('BAD: locators tied to markup structure', async ({ page }) => {
        await page.goto('index.html');

        // position in the list: breaks if the order changes
        await page.locator('#stock-list li:nth-child(1)').click();
        // styling class: breaks if a designer changes the button color
        await page.locator('.btn-success').waitFor();
        // XPath tied to DOM nesting: breaks on any extra wrapper
        await page.locator('//div[@id="trade-panel"]/div[1]/input').fill('100');

        await expect(page.locator('#stock-price')).not.toBeEmpty();
    });

    test('GOOD: user-facing locators', async ({ page }) => {
        await page.goto('index.html');

        await page.getByTestId('stock-list').getByRole('listitem').filter({ hasText: 'MSFT' }).click();
        await expect(page.getByRole('button', { name: 'Buy', exact: true })).toBeVisible();
        await page.getByLabel('Limit Price').fill('100');

        await expect(page.getByTestId('stock-price')).not.toBeEmpty();
    });
});
