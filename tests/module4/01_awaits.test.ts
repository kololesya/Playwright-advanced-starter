import { expect } from '@playwright/test';
import { test } from '../module2/pages/fixtures/base2.js';

/**
 * Lecture: Remember awaits
 *
 * Every Playwright action and web-first assertion returns a Promise.
 * Without `await`, the next line does not wait for it, and the test can
 * finish before the step has run.
 */

test.describe('Remember awaits', () => {
    // BAD: the assertion is never awaited. The test reaches its end while
    // toHaveText is still retrying, and Playwright reports a confusing "Test ended." error.
    test.fail('BAD: assertion without await', async ({ stockPage }) => {
        await stockPage.goto();

        expect(stockPage.cashBalance()).toHaveText('0.00');
    });

    test('GOOD: assertion with await', async ({ stockPage }) => {
        await stockPage.goto();

        await expect(stockPage.cashBalance()).toHaveText('10000.00');
    });

    // BAD: forEach does not wait for async callbacks. The loop "finishes" instantly,
    // the test ends, and the assertions are silently dropped.
    // This test is GREEN even though '0' is obviously a wrong price: a false positive.
    // That is worse than a red test, because nobody will look at it.
    test('BAD: async callback inside forEach (false green)', async ({ stockPage }) => {
        await stockPage.goto();

        ['MSFT', 'AAPL'].forEach(async (ticker) => {
            await stockPage.selectTicker(ticker);
            await expect(stockPage.currentPrice()).toHaveText('0');
        });
    });

    // GOOD: for...of runs the iterations one by one and awaits each of them.
    test('GOOD: for...of loop with await', async ({ stockPage }) => {
        await stockPage.goto();

        for (const ticker of ['MSFT', 'AAPL']) {
            await stockPage.selectTicker(ticker);
            await expect(stockPage.currentPrice()).toHaveText(/^\d+$/);
        }
    });
});
