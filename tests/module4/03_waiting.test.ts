import { expect } from '@playwright/test';
import { test } from '../module2/pages/fixtures/base2.js';
import { simulateSlowHydration } from './helpers/slowHydration.js';

/**
 * Lecture: Avoid bad waiting
 *
 * The app renders the cash balance 1.5 s after the page loads.
 * Rule: never read a value and then assert on it. Assert on the locator,
 * so Playwright retries until the condition is met (5 s by default).
 */

test.describe('Avoid bad waiting', () => {
    test.beforeEach(async ({ page }) => {
        await simulateSlowHydration(page);
    });

    // BAD: textContent() reads the value ONCE, right now. The value is still empty.
    test.fail('BAD: read the value, then assert', async ({ stockPage }) => {
        await stockPage.goto();

        expect(await stockPage.cashBalance().textContent()).toBe('10000.00');
    });

    // BAD: isVisible() does not wait either; it answers "is it visible at this moment?".
    test.fail('BAD: isVisible() without retry', async ({ page, stockPage }) => {
        await stockPage.goto();

        expect(await page.getByText('10000.00').isVisible()).toBe(true);
    });

    // BAD: a hardcoded sleep. It passes here, but it always costs 2 s,
    // and on a slow CI machine 2 s may still not be enough.
    test('BAD: hardcoded waitForTimeout', async ({ page, stockPage }) => {
        await stockPage.goto();
        await page.waitForTimeout(2000);

        expect(await stockPage.cashBalance().textContent()).toBe('10000.00');
    });

    // GOOD: a web-first assertion retries until the text matches or the timeout expires.
    test('GOOD: web-first assertion', async ({ stockPage }) => {
        await stockPage.goto();

        await expect(stockPage.cashBalance()).toHaveText('10000.00');
    });

    // GOOD: expect.poll retries any async function, not only locators.
    test('GOOD: expect.poll for non-locator values', async ({ page, stockPage }) => {
        await stockPage.goto();

        await expect
            .poll(() => page.evaluate(() => sessionStorage.getItem('cash')))
            .toBe('10000.00');
    });
});
