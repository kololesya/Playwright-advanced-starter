import { expect } from '@playwright/test';
import { test } from '../module2/pages/fixtures/base2.js';
import { simulateSlowHydration } from './helpers/slowHydration.js';

/**
 * Lecture: Waiting for hydration
 *
 * Hydration = the moment JavaScript attaches event handlers to HTML that is
 * already on the screen. Before that, a button is visible and clickable for
 * Playwright, but the click does nothing. Actionability checks do not help:
 * the element IS visible, enabled and stable.
 */

test.describe('Waiting for hydration', () => {
    test.beforeEach(async ({ page }) => {
        await simulateSlowHydration(page);
    });

    // BAD: the click lands before the handlers exist and is lost.
    // The panel never opens, no matter how long we wait afterwards.
    test.fail('BAD: click right after page load', async ({ stockPage }) => {
        await stockPage.goto();
        await stockPage.selectTicker('MSFT');

        await expect(stockPage.currentPrice()).toBeVisible({ timeout: 3000 });
    });

    // GOOD #1: wait for a signal that the app is ready. The cash balance is
    // rendered by the same script that attaches the handlers, so once it has
    // a value, the click handlers are attached too.
    test('GOOD: wait for an app-ready signal', async ({ stockPage }) => {
        await stockPage.goto();
        await expect(stockPage.cashBalance()).not.toBeEmpty();

        await stockPage.selectTicker('MSFT');
        await expect(stockPage.currentPrice()).toBeVisible();
    });

    // GOOD #2: when there is no reliable signal, retry the action together with
    // its check. toPass() repeats the whole block until it succeeds.
    test('GOOD: retry the action with toPass()', async ({ stockPage }) => {
        await stockPage.goto();

        await expect(async () => {
            await stockPage.selectTicker('MSFT');
            await expect(stockPage.currentPrice()).toBeVisible({ timeout: 500 });
        }).toPass({ timeout: 5000 });
    });
});
